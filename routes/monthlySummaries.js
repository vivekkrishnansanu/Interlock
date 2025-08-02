const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../utils/auth');
const { calculateMonthlySummary } = require('../utils/wageCalculator');

const router = express.Router();

// Generate monthly summary for all employees
router.get('/generate', authenticateToken, async (req, res) => {
  try {
    const { month, year, site, category } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const monthNum = parseInt(month) - 1; // Convert to 0-based index
    const yearNum = parseInt(year);

    // Get all employees with filters
    let employeeQuery = supabase.from('employees').select('*');
    
    if (site) {
      employeeQuery = employeeQuery.eq('site', site);
    }
    
    if (category) {
      employeeQuery = employeeQuery.eq('category', category);
    }

    const { data: employees, error: employeeError } = await employeeQuery;

    if (employeeError) {
      return res.status(500).json({ error: 'Error fetching employees' });
    }

    const summaries = [];

    for (const employee of employees) {
      // Get daily logs for this employee in the specified month
      const startDate = new Date(yearNum, monthNum, 1);
      const endDate = new Date(yearNum, monthNum + 1, 0);

      const { data: dailyLogs, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('employeeId', employee.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (logsError) {
        console.error(`Error fetching logs for employee ${employee.id}:`, logsError);
        continue;
      }

      // Calculate monthly summary
      const summary = calculateMonthlySummary(dailyLogs, employee, monthNum, yearNum);
      summaries.push(summary);
    }

    res.json({
      month: `${calculateMonthlySummary.getMonthName ? calculateMonthlySummary.getMonthName(monthNum) : month} ${yearNum}`,
      summaries,
      totalEmployees: summaries.length
    });

  } catch (error) {
    console.error('Generate monthly summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly summary for specific employee
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get daily logs for the specified month
    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0);

    const { data: dailyLogs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('employeeId', employeeId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date');

    if (logsError) {
      return res.status(500).json({ error: 'Error fetching daily logs' });
    }

    // Calculate monthly summary
    const summary = calculateMonthlySummary(dailyLogs, employee, monthNum, yearNum);

    res.json({
      employee,
      summary,
      dailyLogs,
      totalDays: dailyLogs.length
    });

  } catch (error) {
    console.error('Get employee monthly summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get monthly summary history for an employee
router.get('/employee/:employeeId/history', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { limit = 12 } = req.query;

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get all daily logs for this employee
    const { data: dailyLogs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('employeeId', employeeId)
      .order('date', { ascending: false });

    if (logsError) {
      return res.status(500).json({ error: 'Error fetching daily logs' });
    }

    // Group logs by month and calculate summaries
    const monthlySummaries = [];
    const monthGroups = {};

    dailyLogs.forEach(log => {
      const logDate = new Date(log.date);
      const monthKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = [];
      }
      monthGroups[monthKey].push(log);
    });

    // Calculate summary for each month
    Object.keys(monthGroups)
      .sort((a, b) => b.localeCompare(a)) // Sort descending
      .slice(0, parseInt(limit))
      .forEach(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthNum = parseInt(month) - 1;
        const yearNum = parseInt(year);
        
        const summary = calculateMonthlySummary(monthGroups[monthKey], employee, monthNum, yearNum);
        monthlySummaries.push(summary);
      });

    res.json({
      employee,
      monthlySummaries,
      totalMonths: monthlySummaries.length
    });

  } catch (error) {
    console.error('Get employee history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export monthly summary to CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const { month, year, site, category } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Generate monthly summary
    const summaryResponse = await fetch(`${req.protocol}://${req.get('host')}/api/monthly-summaries/generate?${new URLSearchParams(req.query)}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });

    if (!summaryResponse.ok) {
      return res.status(500).json({ error: 'Error generating summary' });
    }

    const summaryData = await summaryResponse.json();

    // Generate CSV content
    const csvHeaders = [
      'Employee Name',
      'CPR',
      'Designation',
      'Site',
      'Category',
      'Total NT Hours',
      'Total ROT Hours',
      'Total HOT Hours',
      'NT Pay',
      'ROT Pay',
      'HOT Pay',
      'Allowance',
      'Final Pay',
      'Rounded Pay',
      'Total Days'
    ];

    const csvRows = summaryData.summaries.map(summary => [
      summary.employeeName || 'N/A',
      summary.employeeCPR || 'N/A',
      summary.employeeDesignation || 'N/A',
      summary.employeeSite || 'N/A',
      summary.employeeCategory || 'N/A',
      summary.totalNt,
      summary.totalRot,
      summary.totalHot,
      summary.ntPay,
      summary.rotPay,
      summary.hotPay,
      summary.allowance,
      summary.finalPay,
      summary.roundedPay,
      summary.totalDays
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="wage-summary-${month}-${year}.csv"`);
    
    res.send(csvContent);

  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get summary statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { month, year, site, category } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    // Generate monthly summary
    const summaryResponse = await fetch(`${req.protocol}://${req.get('host')}/api/monthly-summaries/generate?${new URLSearchParams(req.query)}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });

    if (!summaryResponse.ok) {
      return res.status(500).json({ error: 'Error generating summary' });
    }

    const summaryData = await summaryResponse.json();

    // Calculate statistics
    const stats = {
      totalEmployees: summaryData.summaries.length,
      totalNTHours: summaryData.summaries.reduce((sum, s) => sum + s.totalNt, 0),
      totalROTHours: summaryData.summaries.reduce((sum, s) => sum + s.totalRot, 0),
      totalHOTHours: summaryData.summaries.reduce((sum, s) => sum + s.totalHot, 0),
      totalNTPay: summaryData.summaries.reduce((sum, s) => sum + s.ntPay, 0),
      totalROTPay: summaryData.summaries.reduce((sum, s) => sum + s.rotPay, 0),
      totalHOTPay: summaryData.summaries.reduce((sum, s) => sum + s.hotPay, 0),
      totalAllowance: summaryData.summaries.reduce((sum, s) => sum + s.allowance, 0),
      totalFinalPay: summaryData.summaries.reduce((sum, s) => sum + s.finalPay, 0),
      totalRoundedPay: summaryData.summaries.reduce((sum, s) => sum + s.roundedPay, 0),
      averagePay: summaryData.summaries.length > 0 ? 
        summaryData.summaries.reduce((sum, s) => sum + s.finalPay, 0) / summaryData.summaries.length : 0,
      totalDays: summaryData.summaries.reduce((sum, s) => sum + s.totalDays, 0)
    };

    res.json({
      month: summaryData.month,
      stats,
      filters: { site, category }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
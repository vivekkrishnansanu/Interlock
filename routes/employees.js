const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireEditor } = require('../utils/auth');
const { validateEmployee } = require('../utils/wageCalculator');

const router = express.Router();

// Get all employees with optional filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { site, category, search } = req.query;
    let query = supabase.from('employees').select('*').order('name');

    // Apply filters
    if (site) {
      query = query.eq('site', site);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,cpr.ilike.%${search}%,designation.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error fetching employees' });
    }

    res.json(data);

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Employee not found' });
      }
      return res.status(500).json({ error: 'Error fetching employee' });
    }

    res.json(data);

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new employee
router.post('/', authenticateToken, requireEditor, async (req, res) => {
  try {
    const employeeData = req.body;

    // Validate employee data
    const validationErrors = validateEmployee(employeeData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Check if CPR already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('cpr', employeeData.cpr)
      .single();

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee with this CPR already exists' });
    }

    // Create employee
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: employeeData.name.trim(),
        cpr: employeeData.cpr.trim(),
        designation: employeeData.designation.trim(),
        site: employeeData.site.trim(),
        category: employeeData.category || 'General',
        ntRate: parseFloat(employeeData.ntRate) || 0,
        rotRate: parseFloat(employeeData.rotRate) || 0,
        hotRate: parseFloat(employeeData.hotRate) || 0,
        allowance: parseFloat(employeeData.allowance) || 0,
        notes: employeeData.notes || null,
        createdBy: req.user.id
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error creating employee' });
    }

    res.status(201).json(data);

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee
router.put('/:id', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { id } = req.params;
    const employeeData = req.body;

    // Validate employee data
    const validationErrors = validateEmployee(employeeData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Check if employee exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if CPR is being changed and if it already exists
    if (employeeData.cpr && employeeData.cpr !== existingEmployee.cpr) {
      const { data: duplicateCPR } = await supabase
        .from('employees')
        .select('id')
        .eq('cpr', employeeData.cpr)
        .neq('id', id)
        .single();

      if (duplicateCPR) {
        return res.status(400).json({ error: 'Employee with this CPR already exists' });
      }
    }

    // Update employee
    const { data, error } = await supabase
      .from('employees')
      .update({
        name: employeeData.name.trim(),
        cpr: employeeData.cpr.trim(),
        designation: employeeData.designation.trim(),
        site: employeeData.site.trim(),
        category: employeeData.category || 'General',
        ntRate: parseFloat(employeeData.ntRate) || 0,
        rotRate: parseFloat(employeeData.rotRate) || 0,
        hotRate: parseFloat(employeeData.hotRate) || 0,
        allowance: parseFloat(employeeData.allowance) || 0,
        notes: employeeData.notes || null,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error updating employee' });
    }

    res.json(data);

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee has any daily logs
    const { data: dailyLogs } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('employeeId', id)
      .limit(1);

    if (dailyLogs && dailyLogs.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete employee with existing work logs. Please delete all logs first.' 
      });
    }

    // Delete employee
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error deleting employee' });
    }

    res.json({ message: 'Employee deleted successfully' });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee wage history
router.get('/:id/wage-history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (employeeError) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get daily logs for the employee
    let query = supabase
      .from('daily_logs')
      .select('*')
      .eq('employeeId', id)
      .order('date', { ascending: false });

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      query = query
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
    }

    const { data: dailyLogs, error: logsError } = await query;

    if (logsError) {
      return res.status(500).json({ error: 'Error fetching wage history' });
    }

    res.json({
      employee,
      dailyLogs,
      totalLogs: dailyLogs.length
    });

  } catch (error) {
    console.error('Get wage history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unique sites and categories for filters
router.get('/filters/options', authenticateToken, async (req, res) => {
  try {
    const { data: sites } = await supabase
      .from('employees')
      .select('site')
      .not('site', 'is', null);

    const { data: categories } = await supabase
      .from('employees')
      .select('category')
      .not('category', 'is', null);

    const uniqueSites = [...new Set(sites.map(item => item.site))].sort();
    const uniqueCategories = [...new Set(categories.map(item => item.category))].sort();

    res.json({
      sites: uniqueSites,
      categories: uniqueCategories
    });

  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
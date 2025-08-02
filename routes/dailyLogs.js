const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireEditor } = require('../utils/auth');
const { validateDailyLog } = require('../utils/wageCalculator');

const router = express.Router();

// Get daily logs with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employeeId, date, startDate, endDate, site } = req.query;
    let query = supabase
      .from('daily_logs')
      .select(`
        *,
        employees (
          id,
          name,
          cpr,
          designation,
          site,
          category
        )
      `)
      .order('date', { ascending: false });

    // Apply filters
    if (employeeId) {
      query = query.eq('employeeId', employeeId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    if (startDate && endDate) {
      query = query
        .gte('date', startDate)
        .lte('date', endDate);
    }

    if (site) {
      query = query.eq('employees.site', site);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Error fetching daily logs' });
    }

    res.json(data);

  } catch (error) {
    console.error('Get daily logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get daily log by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('daily_logs')
      .select(`
        *,
        employees (
          id,
          name,
          cpr,
          designation,
          site,
          category,
          ntRate,
          rotRate,
          hotRate,
          allowance
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Daily log not found' });
      }
      return res.status(500).json({ error: 'Error fetching daily log' });
    }

    res.json(data);

  } catch (error) {
    console.error('Get daily log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new daily log
router.post('/', authenticateToken, requireEditor, async (req, res) => {
  try {
    const logData = req.body;

    // Validate log data
    const validationErrors = validateDailyLog(logData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Check if employee exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', logData.employeeId)
      .single();

    if (employeeError || !employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // Check if log already exists for this employee and date
    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('employeeId', logData.employeeId)
      .eq('date', logData.date)
      .single();

    if (existingLog) {
      return res.status(400).json({ error: 'Daily log already exists for this employee and date' });
    }

    // Determine day type
    const logDate = new Date(logData.date);
    const dayOfWeek = logDate.getDay();
    const isFriday = dayOfWeek === 5; // Friday is day 5
    const isHoliday = logData.isHoliday || false;

    // Create daily log
    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        employeeId: logData.employeeId,
        date: logData.date,
        isHoliday,
        isFriday,
        ntHours: parseFloat(logData.ntHours) || 0,
        rotHours: parseFloat(logData.rotHours) || 0,
        hotHours: parseFloat(logData.hotHours) || 0,
        createdBy: req.user.id
      })
      .select(`
        *,
        employees (
          id,
          name,
          cpr,
          designation,
          site,
          category,
          ntRate,
          rotRate,
          hotRate,
          allowance
        )
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error creating daily log' });
    }

    res.status(201).json(data);

  } catch (error) {
    console.error('Create daily log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update daily log
router.put('/:id', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { id } = req.params;
    const logData = req.body;

    // Validate log data
    const validationErrors = validateDailyLog(logData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Check if log exists
    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('id, employeeId, date')
      .eq('id', id)
      .single();

    if (!existingLog) {
      return res.status(404).json({ error: 'Daily log not found' });
    }

    // Check if employee exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', logData.employeeId)
      .single();

    if (employeeError || !employee) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    // Check if another log already exists for this employee and date (excluding current log)
    if (logData.employeeId !== existingLog.employeeId || logData.date !== existingLog.date) {
      const { data: duplicateLog } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('employeeId', logData.employeeId)
        .eq('date', logData.date)
        .neq('id', id)
        .single();

      if (duplicateLog) {
        return res.status(400).json({ error: 'Daily log already exists for this employee and date' });
      }
    }

    // Determine day type
    const logDate = new Date(logData.date);
    const dayOfWeek = logDate.getDay();
    const isFriday = dayOfWeek === 5; // Friday is day 5
    const isHoliday = logData.isHoliday || false;

    // Update daily log
    const { data, error } = await supabase
      .from('daily_logs')
      .update({
        employeeId: logData.employeeId,
        date: logData.date,
        isHoliday,
        isFriday,
        ntHours: parseFloat(logData.ntHours) || 0,
        rotHours: parseFloat(logData.rotHours) || 0,
        hotHours: parseFloat(logData.hotHours) || 0,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        employees (
          id,
          name,
          cpr,
          designation,
          site,
          category,
          ntRate,
          rotRate,
          hotRate,
          allowance
        )
      `)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Error updating daily log' });
    }

    res.json(data);

  } catch (error) {
    console.error('Update daily log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete daily log
router.delete('/:id', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if log exists
    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingLog) {
      return res.status(404).json({ error: 'Daily log not found' });
    }

    // Delete daily log
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Error deleting daily log' });
    }

    res.json({ message: 'Daily log deleted successfully' });

  } catch (error) {
    console.error('Delete daily log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk create daily logs
router.post('/bulk', authenticateToken, requireEditor, async (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'Logs array is required' });
    }

    const results = [];
    const errors = [];

    for (const logData of logs) {
      try {
        // Validate log data
        const validationErrors = validateDailyLog(logData);
        if (validationErrors.length > 0) {
          errors.push({
            log: logData,
            error: `Validation failed: ${validationErrors.join(', ')}`
          });
          continue;
        }

        // Check if employee exists
        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('id', logData.employeeId)
          .single();

        if (!employee) {
          errors.push({
            log: logData,
            error: 'Employee not found'
          });
          continue;
        }

        // Check if log already exists
        const { data: existingLog } = await supabase
          .from('daily_logs')
          .select('id')
          .eq('employeeId', logData.employeeId)
          .eq('date', logData.date)
          .single();

        if (existingLog) {
          errors.push({
            log: logData,
            error: 'Daily log already exists for this employee and date'
          });
          continue;
        }

        // Determine day type
        const logDate = new Date(logData.date);
        const dayOfWeek = logDate.getDay();
        const isFriday = dayOfWeek === 5;
        const isHoliday = logData.isHoliday || false;

        // Create daily log
        const { data, error } = await supabase
          .from('daily_logs')
          .insert({
            employeeId: logData.employeeId,
            date: logData.date,
            isHoliday,
            isFriday,
            ntHours: parseFloat(logData.ntHours) || 0,
            rotHours: parseFloat(logData.rotHours) || 0,
            hotHours: parseFloat(logData.hotHours) || 0,
            createdBy: req.user.id
          })
          .select()
          .single();

        if (error) {
          errors.push({
            log: logData,
            error: 'Error creating log'
          });
        } else {
          results.push(data);
        }

      } catch (error) {
        errors.push({
          log: logData,
          error: 'Unexpected error'
        });
      }
    }

    res.json({
      success: results.length,
      errors: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk create daily logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
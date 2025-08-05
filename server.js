const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Supabase configuration - using service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL || 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    req.user = user;
    req.userProfile = profile;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userProfile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    if (!allowedRoles.includes(req.userProfile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// ========================================
// AUTHENTICATION ROUTES
// ========================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({
      user: data.user,
      profile: profile,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateUser, async (req, res) => {
  try {
    res.json({
      user: req.user,
      profile: req.userProfile
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ========================================
// EMPLOYEES ROUTES
// ========================================

// Get all employees (with role-based filtering)
app.get('/api/employees', authenticateUser, async (req, res) => {
  try {
    let query = supabase
      .from('employees')
      .select(`
        *,
        sites (
          id,
          name,
          code
        )
      `)
      .order('name', { ascending: true });

    // Apply RLS-like filtering based on user role
    if (req.userProfile.role === 'viewer') {
      // Viewers can only see basic employee info
      query = query.select(`
        id,
        name,
        designation,
        site_id,
        category,
        sites (
          id,
          name,
          code
        )
      `);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Create employee (admin/leadership only)
app.post('/api/employees', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const employeeData = {
      ...req.body,
      created_by: req.user.id
    };

    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee (admin/leadership only)
app.put('/api/employees/:id', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee (admin only)
app.delete('/api/employees/:id', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// ========================================
// SITES ROUTES
// ========================================

// Get all sites
app.get('/api/sites', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// Create site (admin/leadership only)
app.post('/api/sites', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const siteData = {
      ...req.body,
      created_by: req.user.id
    };

    const { data, error } = await supabase
      .from('sites')
      .insert(siteData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating site:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// Update site (admin/leadership only)
app.put('/api/sites/:id', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('sites')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating site:', error);
    res.status(500).json({ error: 'Failed to update site' });
  }
});

// Delete site (admin only)
app.delete('/api/sites/:id', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// ========================================
// DAILY LOGS ROUTES
// ========================================

// Get daily logs (with role-based filtering)
app.get('/api/daily-logs', authenticateUser, async (req, res) => {
  try {
    let query = supabase
      .from('daily_logs')
      .select(`
        *,
        employees (
          id,
          name,
          designation,
          category
        ),
        sites (
          id,
          name,
          code
        )
      `)
      .order('date', { ascending: false });

    // Apply role-based filtering
    if (req.userProfile.role === 'viewer') {
      // Viewers see limited data
      query = query.select(`
        id,
        employee_id,
        site_id,
        date,
        is_holiday,
        is_friday,
        nt_hours,
        rot_hours,
        hot_hours,
        hours_worked,
        employees (
          id,
          name,
          designation
        ),
        sites (
          id,
          name,
          code
        )
      `);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    res.status(500).json({ error: 'Failed to fetch daily logs' });
  }
});

// Create daily log (admin/leadership only)
app.post('/api/daily-logs', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const logData = {
      ...req.body,
      created_by: req.user.id
    };

    const { data, error } = await supabase
      .from('daily_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating daily log:', error);
    res.status(500).json({ error: 'Failed to create daily log' });
  }
});

// Update daily log (admin/leadership only)
app.put('/api/daily-logs/:id', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('daily_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating daily log:', error);
    res.status(500).json({ error: 'Failed to update daily log' });
  }
});

// Delete daily log (admin only)
app.delete('/api/daily-logs/:id', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Daily log deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    res.status(500).json({ error: 'Failed to delete daily log' });
  }
});

// ========================================
// ALLOWANCES ROUTES
// ========================================

// Get allowances (with role-based filtering)
app.get('/api/allowances', authenticateUser, async (req, res) => {
  try {
    let query = supabase
      .from('allowances')
      .select(`
        *,
        employees (
          id,
          name,
          designation
        )
      `)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (req.userProfile.role === 'viewer') {
      query = query.select(`
        id,
        employee_id,
        category,
        allowance_type,
        amount,
        effective_date,
        description,
        employees (
          id,
          name,
          designation
        )
      `);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching allowances:', error);
    res.status(500).json({ error: 'Failed to fetch allowances' });
  }
});

// Create allowance (admin/leadership only)
app.post('/api/allowances', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const allowanceData = {
      ...req.body,
      created_by: req.user.id
    };

    const { data, error } = await supabase
      .from('allowances')
      .insert(allowanceData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating allowance:', error);
    res.status(500).json({ error: 'Failed to create allowance' });
  }
});

// Update allowance (admin/leadership only)
app.put('/api/allowances/:id', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('allowances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating allowance:', error);
    res.status(500).json({ error: 'Failed to update allowance' });
  }
});

// Delete allowance (admin only)
app.delete('/api/allowances/:id', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('allowances')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Allowance deleted successfully' });
  } catch (error) {
    console.error('Error deleting allowance:', error);
    res.status(500).json({ error: 'Failed to delete allowance' });
  }
});

// ========================================
// SALARY ADVANCES ROUTES
// ========================================

// Get salary advances (with role-based filtering)
app.get('/api/salary-advances', authenticateUser, async (req, res) => {
  try {
    let query = supabase
      .from('salary_advances')
      .select(`
        *,
        employees (
          id,
          name,
          designation
        )
      `)
      .order('created_at', { ascending: false });

    // Apply role-based filtering
    if (req.userProfile.role === 'viewer') {
      query = query.select(`
        id,
        employee_id,
        amount,
        request_date,
        deduction_period_months,
        deduction_start_month,
        status,
        total_deducted,
        employees (
          id,
          name,
          designation
        )
      `);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching salary advances:', error);
    res.status(500).json({ error: 'Failed to fetch salary advances' });
  }
});

// Create salary advance (admin/leadership only)
app.post('/api/salary-advances', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const advanceData = {
      ...req.body,
      created_by: req.user.id
    };

    const { data, error } = await supabase
      .from('salary_advances')
      .insert(advanceData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating salary advance:', error);
    res.status(500).json({ error: 'Failed to create salary advance' });
  }
});

// Update salary advance (admin/leadership only)
app.put('/api/salary-advances/:id', authenticateUser, requireRole(['admin', 'leadership']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('salary_advances')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating salary advance:', error);
    res.status(500).json({ error: 'Failed to update salary advance' });
  }
});

// Delete salary advance (admin only)
app.delete('/api/salary-advances/:id', authenticateUser, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('salary_advances')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Salary advance deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary advance:', error);
    res.status(500).json({ error: 'Failed to delete salary advance' });
  }
});

// ========================================
// REPORTS ROUTES
// ========================================

// Get monthly summaries (with role-based filtering)
app.get('/api/monthly-summaries', authenticateUser, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = supabase
      .from('monthly_summaries')
      .select('*')
      .order('employee_name', { ascending: true });

    if (month && year) {
      query = query.eq('month', `${year}-${month.padStart(2, '0')}-01`);
    }

    // Apply role-based filtering
    if (req.userProfile.role === 'viewer') {
      query = query.select(`
        employee_id,
        employee_name,
        employee_cpr,
        employee_designation,
        employee_site,
        employee_category,
        month,
        total_nt_hours,
        total_rot_hours,
        total_hot_hours,
        total_days
      `);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching monthly summaries:', error);
    res.status(500).json({ error: 'Failed to fetch monthly summaries' });
  }
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`🔒 Secure API Server running on port ${PORT}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`🔐 Authentication: Enabled`);
  console.log(`🛡️ Role-based access: Enabled`);
  console.log(`📊 Data filtering: Enabled`);
});

module.exports = app; 
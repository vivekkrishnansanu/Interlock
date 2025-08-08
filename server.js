const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'https://interlock-bahrain.vercel.app',
    'https://interlock.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static('build')); // Serve from build directory
app.use(express.static('public')); // Fallback to public

// Supabase configuration - using service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL || 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required for server-side operations');
  // Don't exit in serverless environment, just log the error
  console.error('Server will not function properly without service role key');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || 'dummy-key');

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔐 Authentication attempt...');
    const authHeader = req.headers.authorization;
    console.log('🔐 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔐 Invalid auth header format');
      return res.status(401).json({ error: 'No valid authorization token provided' });
    }

    const token = authHeader.substring(7);
    console.log('🔐 Token length:', token.length);
    console.log('🔐 Token preview:', token.substring(0, 20) + '...');
    
    // Verify the JWT token with Supabase
    console.log('🔐 Verifying token with Supabase...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('🔐 Token verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    if (!user) {
      console.log('🔐 No user found in token');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log('🔐 User verified:', user.id);
    
    // Get user profile with role
    console.log('🔐 Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('🔐 Profile fetch error:', profileError);
      return res.status(401).json({ error: 'User profile not found' });
    }
    
    if (!profile) {
      console.log('🔐 No profile found for user');
      return res.status(401).json({ error: 'User profile not found' });
    }

    console.log('🔐 Authentication successful for:', profile.name, 'Role:', profile.role);
    req.user = user;
    req.userProfile = profile;
    next();
  } catch (error) {
    console.error('🔐 Authentication error:', error);
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
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to check if server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Test authenticated endpoint
app.get('/api/test-auth', authenticateUser, (req, res) => {
  res.json({ 
    message: 'Authentication successful!',
    user: req.user,
    profile: req.userProfile,
    timestamp: new Date().toISOString()
  });
});

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
// USER MANAGEMENT ROUTES
// ========================================

// Get all users (admin/editor only)
app.get('/api/users', authenticateUser, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    console.log('Fetching users...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} users`);
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
});

// Create new user (admin/editor only)
app.post('/api/users', authenticateUser, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent creating admin users unless current user is admin
    if (role === 'admin' && req.userProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create admin users' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        email,
        role
      });

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    res.json({ 
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin/editor only)
app.put('/api/users/:id', authenticateUser, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent self-modification of role
    if (id === req.user.id) {
      return res.status(403).json({ error: 'Cannot modify your own account' });
    }

    // Prevent promoting to admin unless current user is admin
    if (role === 'admin' && req.userProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can promote users to admin' });
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        email,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin/editor only)
app.delete('/api/users/:id', authenticateUser, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    // Delete from profiles first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) throw profileError;

    // Delete from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    
    if (authError) {
      console.warn('Failed to delete auth user:', authError);
      // Continue anyway as the profile is deleted
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
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

// Serve React app for any non-API routes
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  
  // Serve the React app
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
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
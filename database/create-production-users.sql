-- Create demo users for production
-- Run this after the main setup script

-- First, create the users in auth.users (this will be done via the app)
-- Then, manually insert their profiles with proper roles

-- Insert demo user profiles (run this after users are created via the app)
INSERT INTO profiles (id, name, email, role) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'leadership@interlock.com'),
    'Leadership User',
    'leadership@interlock.com',
    'leadership'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role;

INSERT INTO profiles (id, name, email, role) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'admin@interlock.com'),
    'Admin User',
    'admin@interlock.com',
    'admin'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role;

INSERT INTO profiles (id, name, email, role) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'viewer@interlock.com'),
    'Viewer User',
    'viewer@interlock.com',
    'viewer'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role;

-- Confirm emails for demo users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email IN ('leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com');

-- Insert some sample data for testing
INSERT INTO sites (name, code, location, description) VALUES 
('Main Office', 'MO001', 'Manama', 'Primary office location'),
('Site A', 'SA001', 'Muharraq', 'Construction site A'),
('Site B', 'SB001', 'Riffa', 'Construction site B')
ON CONFLICT (code) DO NOTHING;

INSERT INTO employees (name, cpr, designation, site_id, category, nt_rate, rot_rate, hot_rate) VALUES 
('John Doe', '123456789', 'Engineer', (SELECT id FROM sites WHERE code = 'MO001'), 'Technical', 15.00, 20.00, 25.00),
('Jane Smith', '987654321', 'Technician', (SELECT id FROM sites WHERE code = 'SA001'), 'Technical', 12.00, 16.00, 20.00),
('Mike Johnson', '456789123', 'Supervisor', (SELECT id FROM sites WHERE code = 'SB001'), 'Management', 18.00, 24.00, 30.00)
ON CONFLICT (cpr) DO NOTHING; 
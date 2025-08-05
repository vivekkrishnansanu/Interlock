-- Production Database Setup for Interlock
-- Run this in your Supabase SQL Editor to fix all database issues

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production)
-- DROP TABLE IF EXISTS salary_advances CASCADE;
-- DROP TABLE IF EXISTS allowances CASCADE;
-- DROP TABLE IF EXISTS daily_logs CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS sites CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer', 'leadership')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    cpr TEXT UNIQUE NOT NULL,
    designation TEXT NOT NULL,
    site_id UUID REFERENCES sites(id),
    category TEXT DEFAULT 'General',
    nt_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    rot_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    hot_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    allowance DECIMAL(10,2) NOT NULL DEFAULT 0,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    site_id UUID REFERENCES sites(id),
    date DATE NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    is_friday BOOLEAN DEFAULT FALSE,
    nt_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    rot_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    hot_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
    hours_worked DECIMAL(5,2) GENERATED ALWAYS AS (nt_hours + rot_hours + hot_hours) STORED,
    total_pay DECIMAL(10,2) GENERATED ALWAYS AS (
        (nt_hours * (SELECT nt_rate FROM employees WHERE id = employee_id)) +
        (rot_hours * (SELECT rot_rate FROM employees WHERE id = employee_id)) +
        (hot_hours * (SELECT hot_rate FROM employees WHERE id = employee_id))
    ) STORED,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Create allowances table with all required columns
CREATE TABLE IF NOT EXISTS allowances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    allowance_type TEXT DEFAULT 'General',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    effective_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create salary_advances table
CREATE TABLE IF NOT EXISTS salary_advances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    request_date DATE NOT NULL,
    deduction_period_months INTEGER NOT NULL DEFAULT 12,
    deduction_start_month DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    total_deducted DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_code ON sites(code);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_employees_site_id ON employees(site_id);
CREATE INDEX IF NOT EXISTS idx_employees_category ON employees(category);
CREATE INDEX IF NOT EXISTS idx_employees_cpr ON employees(cpr);
CREATE INDEX IF NOT EXISTS idx_daily_logs_employee_id ON daily_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_site_id ON daily_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_employee_date ON daily_logs(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_allowances_employee_id ON allowances(employee_id);
CREATE INDEX IF NOT EXISTS idx_allowances_effective_date ON allowances(effective_date);
CREATE INDEX IF NOT EXISTS idx_allowances_type ON allowances(allowance_type);
CREATE INDEX IF NOT EXISTS idx_salary_advances_employee_id ON salary_advances(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_advances_status ON salary_advances(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'leadership')
        )
    );

CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'leadership')
        )
    );

-- Sites RLS policies
CREATE POLICY "All authenticated users can view sites" ON sites
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and leadership can insert sites" ON sites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'leadership')
        )
    );

CREATE POLICY "Admins and leadership can update sites" ON sites
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'leadership')
        )
    );

CREATE POLICY "Admins and leadership can delete sites" ON sites
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'leadership')
        )
    );

-- Employees RLS policies
CREATE POLICY "All authenticated users can view employees" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert employees" ON employees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update employees" ON employees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete employees" ON employees
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Daily logs RLS policies
CREATE POLICY "All authenticated users can view daily logs" ON daily_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert daily logs" ON daily_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update daily logs" ON daily_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete daily logs" ON daily_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allowances RLS policies
CREATE POLICY "All authenticated users can view allowances" ON allowances
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert allowances" ON allowances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update allowances" ON allowances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete allowances" ON allowances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Salary advances RLS policies
CREATE POLICY "All authenticated users can view salary advances" ON salary_advances
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert salary advances" ON salary_advances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update salary advances" ON salary_advances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete salary advances" ON salary_advances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allowances_updated_at BEFORE UPDATE ON allowances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_advances_updated_at BEFORE UPDATE ON salary_advances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create monthly summaries view
CREATE OR REPLACE VIEW monthly_summaries AS
SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.designation,
    s.name as site_name,
    DATE_TRUNC('month', dl.date) as month,
    COUNT(dl.id) as days_worked,
    SUM(dl.nt_hours) as total_nt_hours,
    SUM(dl.rot_hours) as total_rot_hours,
    SUM(dl.hot_hours) as total_hot_hours,
    SUM(dl.hours_worked) as total_hours,
    SUM(dl.total_pay) as total_pay,
    e.nt_rate,
    e.rot_rate,
    e.hot_rate
FROM employees e
LEFT JOIN daily_logs dl ON e.id = dl.employee_id
LEFT JOIN sites s ON e.site_id = s.id
GROUP BY e.id, e.name, e.designation, s.name, DATE_TRUNC('month', dl.date), e.nt_rate, e.rot_rate, e.hot_rate;

-- Insert sample data for testing (optional)
-- INSERT INTO sites (name, code, location, description) VALUES 
-- ('Main Office', 'MO001', 'Manama', 'Primary office location'),
-- ('Site A', 'SA001', 'Muharraq', 'Construction site A'),
-- ('Site B', 'SB001', 'Riffa', 'Construction site B');

-- INSERT INTO employees (name, cpr, designation, site_id, category, nt_rate, rot_rate, hot_rate) VALUES 
-- ('John Doe', '123456789', 'Engineer', (SELECT id FROM sites WHERE code = 'MO001'), 'Technical', 15.00, 20.00, 25.00),
-- ('Jane Smith', '987654321', 'Technician', (SELECT id FROM sites WHERE code = 'SA001'), 'Technical', 12.00, 16.00, 20.00);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 
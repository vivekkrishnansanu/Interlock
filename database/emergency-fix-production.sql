-- EMERGENCY FIX FOR PRODUCTION DATABASE
-- Run this script in Supabase SQL Editor to fix all data entry issues

-- Step 1: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow all authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated users" ON sites;
DROP POLICY IF EXISTS "Allow all authenticated users" ON employees;
DROP POLICY IF EXISTS "Allow all authenticated users" ON daily_logs;
DROP POLICY IF EXISTS "Allow all authenticated users" ON allowances;
DROP POLICY IF EXISTS "Allow all authenticated users" ON salary_advances;

-- Step 2: Disable RLS temporarily to allow all operations
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE allowances DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant all permissions to authenticated users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 4: Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer', 'leadership')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Step 5: Add missing columns if they don't exist
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS effective_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE allowances ADD COLUMN IF NOT EXISTS allowance_type TEXT DEFAULT 'General';

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_sites_code ON sites(code);
CREATE INDEX IF NOT EXISTS idx_employees_site_id ON employees(site_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_employee_id ON daily_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_allowances_employee_id ON allowances(employee_id);

-- Step 7: Create user management function
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

-- Step 8: Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 9: Test data insertion
INSERT INTO sites (name, code, location, description) 
VALUES ('Test Site', 'TEST001', 'Test Location', 'Test Description')
ON CONFLICT (code) DO NOTHING;

-- Step 10: Show test results
SELECT 'SUCCESS: Database setup completed' as status;
SELECT 'Test site created:' as info, name, code FROM sites WHERE code = 'TEST001';

-- Step 11: Clean up test data
DELETE FROM sites WHERE code = 'TEST001';

-- Step 12: Re-enable RLS with permissive policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;

-- Step 13: Create permissive policies
CREATE POLICY "Allow all authenticated users" ON profiles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON sites
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON employees
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON daily_logs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON allowances
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all authenticated users" ON salary_advances
    FOR ALL USING (auth.role() = 'authenticated');

SELECT 'COMPLETE: All tables created, RLS enabled with permissive policies' as final_status; 
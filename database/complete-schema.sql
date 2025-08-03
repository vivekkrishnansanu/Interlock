-- Create sites table with additional fields
CREATE TABLE IF NOT EXISTS sites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    location TEXT,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
    quotation_amount DECIMAL(12,2) DEFAULT 0,
    client_name TEXT,
    client_contact TEXT,
    client_email TEXT,
    project_start_date DATE,
    expected_end_date DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table with employment type
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    cpr TEXT UNIQUE NOT NULL,
    designation TEXT NOT NULL,
    site_id UUID REFERENCES sites(id),
    category TEXT DEFAULT 'General',
    employment_type TEXT DEFAULT 'permanent' CHECK (employment_type IN ('permanent', 'flexi visa')),
    work_type TEXT DEFAULT 'workshop' CHECK (work_type IN ('workshop', 'site')),
    salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly')),
    nt_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    rot_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    hot_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_logs table with adjustment hours
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
    adjustment_hours DECIMAL(5,2) DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Create allowances table
CREATE TABLE IF NOT EXISTS allowances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
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
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_daily_logs_employee_id ON daily_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_site_id ON daily_logs(site_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_employee_date ON daily_logs(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_allowances_employee_id ON allowances(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_advances_employee_id ON salary_advances(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_advances_status ON salary_advances(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;

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
    FOR UPDATE USING (
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- Grant permissions on all tables
GRANT ALL ON sites TO anon, authenticated;
GRANT ALL ON employees TO anon, authenticated;
GRANT ALL ON daily_logs TO anon, authenticated;
GRANT ALL ON allowances TO anon, authenticated;
GRANT ALL ON salary_advances TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 
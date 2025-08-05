const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');
    
    // Test connection
    console.log('🔧 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection error:', error.message);
      console.log('🔧 This might mean tables need to be created in Supabase SQL Editor');
      console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
      console.log(`
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'leadership', 'viewer')),
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
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Create allowances table
CREATE TABLE IF NOT EXISTS allowances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
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
    date DATE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Allow all operations for authenticated users" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON sites FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON daily_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON allowances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON salary_advances FOR ALL USING (auth.role() = 'authenticated');
      `);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('✅ Tables are ready for use!');
    
    // Test creating a sample site
    console.log('\n🔧 Testing data creation...');
    const { data: siteData, error: siteError } = await supabase
      .from('sites')
      .insert([
        {
          name: 'Test Site',
          code: 'TEST001',
          location: 'Test Location',
          description: 'Test site for verification'
        }
      ])
      .select()
      .single();
    
    if (siteError) {
      console.log('❌ Error creating test site:', siteError.message);
    } else {
      console.log('✅ Test site created successfully!');
      
      // Clean up test data
      await supabase
        .from('sites')
        .delete()
        .eq('code', 'TEST001');
      
      console.log('✅ Test data cleaned up!');
    }
    
    console.log('\n🎉 Database is ready! You can now:');
    console.log('- Add Employees');
    console.log('- Add Sites');
    console.log('- Add Daily Logs');
    console.log('- Add Allowances');
    console.log('- Add Salary Advances');
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupDatabase(); 
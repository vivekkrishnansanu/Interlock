-- Fix RLS Security Issues
-- This script enables Row Level Security on all tables and creates proper security policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

DROP POLICY IF EXISTS "All authenticated users can view sites" ON sites;
DROP POLICY IF EXISTS "Editors and admins can insert sites" ON sites;
DROP POLICY IF EXISTS "Editors and admins can update sites" ON sites;
DROP POLICY IF EXISTS "Editors and admins can delete sites" ON sites;

DROP POLICY IF EXISTS "All authenticated users can view employees" ON employees;
DROP POLICY IF EXISTS "Editors and admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Editors and admins can update employees" ON employees;
DROP POLICY IF EXISTS "Editors and admins can delete employees" ON employees;

DROP POLICY IF EXISTS "All authenticated users can view daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Editors and admins can insert daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Editors and admins can update daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Editors and admins can delete daily logs" ON daily_logs;

DROP POLICY IF EXISTS "All authenticated users can view allowances" ON allowances;
DROP POLICY IF EXISTS "Admins can insert allowances" ON allowances;
DROP POLICY IF EXISTS "Admins can update allowances" ON allowances;
DROP POLICY IF EXISTS "Admins can delete allowances" ON allowances;

DROP POLICY IF EXISTS "All authenticated users can view salary advances" ON salary_advances;
DROP POLICY IF EXISTS "Admins can insert salary advances" ON salary_advances;
DROP POLICY IF EXISTS "Admins can update salary advances" ON salary_advances;
DROP POLICY IF EXISTS "Admins can delete salary advances" ON salary_advances;

-- PROFILES TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- SITES TABLE POLICIES
-- All authenticated users can view sites
CREATE POLICY "All authenticated users can view sites" ON sites
    FOR SELECT USING (auth.role() = 'authenticated');

-- Editors and admins can insert sites
CREATE POLICY "Editors and admins can insert sites" ON sites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can update sites
CREATE POLICY "Editors and admins can update sites" ON sites
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can delete sites
CREATE POLICY "Editors and admins can delete sites" ON sites
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- EMPLOYEES TABLE POLICIES
-- All authenticated users can view employees
CREATE POLICY "All authenticated users can view employees" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

-- Editors and admins can insert employees
CREATE POLICY "Editors and admins can insert employees" ON employees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can update employees
CREATE POLICY "Editors and admins can update employees" ON employees
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can delete employees
CREATE POLICY "Editors and admins can delete employees" ON employees
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- DAILY LOGS TABLE POLICIES
-- All authenticated users can view daily logs
CREATE POLICY "All authenticated users can view daily logs" ON daily_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Editors and admins can insert daily logs
CREATE POLICY "Editors and admins can insert daily logs" ON daily_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can update daily logs
CREATE POLICY "Editors and admins can update daily logs" ON daily_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- Editors and admins can delete daily logs
CREATE POLICY "Editors and admins can delete daily logs" ON daily_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

-- ALLOWANCES TABLE POLICIES
-- All authenticated users can view allowances
CREATE POLICY "All authenticated users can view allowances" ON allowances
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create allowances
CREATE POLICY "Admins can insert allowances" ON allowances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update allowances
CREATE POLICY "Admins can update allowances" ON allowances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete allowances
CREATE POLICY "Admins can delete allowances" ON allowances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- SALARY ADVANCES TABLE POLICIES
-- All authenticated users can view salary advances
CREATE POLICY "All authenticated users can view salary advances" ON salary_advances
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create salary advances
CREATE POLICY "Admins can insert salary advances" ON salary_advances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update salary advances
CREATE POLICY "Admins can update salary advances" ON salary_advances
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete salary advances
CREATE POLICY "Admins can delete salary advances" ON salary_advances
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
ORDER BY tablename;

-- Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
ORDER BY tablename, policyname;

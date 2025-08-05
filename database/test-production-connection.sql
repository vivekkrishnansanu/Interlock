-- Test Production Database Connection and Permissions
-- Run this first to check if everything is working

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances');

-- Check if we can insert into sites table
INSERT INTO sites (name, code, location, description) 
VALUES ('Test Site', 'TEST001', 'Test Location', 'Test Description')
ON CONFLICT (code) DO NOTHING;

-- Check if the insert worked
SELECT * FROM sites WHERE code = 'TEST001';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('sites', 'employees', 'profiles');

-- Check current user permissions
SELECT current_user, session_user;

-- Check if we're authenticated
SELECT auth.uid(), auth.role();

-- Clean up test data
DELETE FROM sites WHERE code = 'TEST001'; 
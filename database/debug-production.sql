-- Debug Production Database Issues
-- Run this to check what's wrong with your database

-- 1. Check if tables exist
SELECT 'Tables Check' as check_type, table_name, 'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
UNION ALL
SELECT 'Tables Check' as check_type, 'profiles' as table_name, 'MISSING' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
UNION ALL
SELECT 'Tables Check' as check_type, 'sites' as table_name, 'MISSING' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sites')
UNION ALL
SELECT 'Tables Check' as check_type, 'employees' as table_name, 'MISSING' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employees')
UNION ALL
SELECT 'Tables Check' as check_type, 'daily_logs' as table_name, 'MISSING' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_logs')
UNION ALL
SELECT 'Tables Check' as check_type, 'allowances' as table_name, 'MISSING' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'allowances')
UNION ALL
SELECT 'Tables Check' as check_type, 'salary_advances' as table_name, 'MISSING' as status
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'salary_advances');

-- 2. Check RLS policies
SELECT 'RLS Policies' as check_type, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('sites', 'employees', 'profiles')
ORDER BY tablename, policyname;

-- 3. Check if RLS is enabled
SELECT 'RLS Status' as check_type, schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('sites', 'employees', 'profiles')
ORDER BY tablename;

-- 4. Check current user and permissions
SELECT 'User Info' as check_type, current_user as current_user, session_user as session_user, auth.role() as auth_role;

-- 5. Check if we can insert into sites table (this will fail if there are permission issues)
DO $$
BEGIN
    -- Try to insert a test record
    INSERT INTO sites (name, code, location, description) 
    VALUES ('Debug Test Site', 'DEBUG001', 'Debug Location', 'Debug Description')
    ON CONFLICT (code) DO NOTHING;
    
    RAISE NOTICE 'SUCCESS: Could insert into sites table';
    
    -- Clean up
    DELETE FROM sites WHERE code = 'DEBUG001';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: Could not insert into sites table. Error: %', SQLERRM;
END $$;

-- 6. Check if sites table has the right columns
SELECT 'Sites Columns' as check_type, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'sites'
ORDER BY ordinal_position;

-- 7. Check if there are any existing sites
SELECT 'Existing Sites' as check_type, COUNT(*) as site_count FROM sites;

-- 8. Check if profiles table has any users
SELECT 'Existing Profiles' as check_type, COUNT(*) as profile_count FROM profiles;

-- 9. Check auth.users table
SELECT 'Auth Users' as check_type, COUNT(*) as user_count FROM auth.users;

-- 10. Check if the trigger function exists
SELECT 'Trigger Function' as check_type, routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user'; 
-- Verify RLS Status
-- This script checks the current Row Level Security status of all tables

-- Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED' 
        ELSE '❌ DISABLED' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
ORDER BY tablename;

-- Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has WHERE clause'
        ELSE 'No WHERE clause'
    END as has_restrictions
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 4 THEN '✅ Complete'
        WHEN COUNT(*) > 0 THEN '⚠️ Partial'
        ELSE '❌ None'
    END as coverage
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
GROUP BY tablename
ORDER BY tablename;

-- Summary of security status
SELECT 
    'SECURITY SUMMARY' as info,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
    COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tables_without_rls,
    CASE 
        WHEN COUNT(CASE WHEN NOT rowsecurity THEN 1 END) = 0 THEN '✅ All tables secure'
        ELSE '❌ Security issues found'
    END as overall_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances');

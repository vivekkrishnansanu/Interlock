-- SECURITY VERIFICATION SCRIPT
-- Run this to verify all security measures are properly implemented

-- ========================================
-- STEP 1: VERIFY RLS IS ENABLED
-- ========================================

SELECT '🔒 VERIFYING ROW LEVEL SECURITY' as verification_step;

SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
ORDER BY tablename;

-- ========================================
-- STEP 2: VERIFY RLS POLICIES
-- ========================================

SELECT '🔐 VERIFYING RLS POLICIES' as verification_step;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '📖 READ'
        WHEN cmd = 'INSERT' THEN '➕ CREATE'
        WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
        WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
        ELSE cmd
    END as operation
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ========================================
-- STEP 3: VERIFY SECURITY FUNCTIONS
-- ========================================

SELECT '⚙️ VERIFYING SECURITY FUNCTIONS' as verification_step;

SELECT 
    proname as function_name,
    CASE 
        WHEN proname IN ('is_admin', 'is_leadership_or_admin', 'audit_data_change') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_leadership_or_admin', 'audit_data_change')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ========================================
-- STEP 4: VERIFY AUDIT TRIGGERS
-- ========================================

SELECT '📝 VERIFYING AUDIT TRIGGERS' as verification_step;

SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    CASE 
        WHEN tgname LIKE '%audit%' THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_trigger 
WHERE tgname LIKE '%audit%'
AND tgrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

-- ========================================
-- STEP 5: VERIFY SECURE VIEWS
-- ========================================

SELECT '👁️ VERIFYING SECURE VIEWS' as verification_step;

SELECT 
    schemaname,
    viewname,
    CASE 
        WHEN viewname IN ('secure_employee_view', 'secure_daily_logs_view') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('secure_employee_view', 'secure_daily_logs_view');

-- ========================================
-- STEP 6: VERIFY PERMISSIONS
-- ========================================

SELECT '🔑 VERIFYING PERMISSIONS' as verification_step;

SELECT 
    grantee,
    table_name,
    privilege_type,
    CASE 
        WHEN privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE') THEN '✅ GRANTED'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
AND grantee IN ('authenticated', 'anon')
ORDER BY grantee, table_name, privilege_type;

-- ========================================
-- STEP 7: TEST SECURITY FUNCTIONS
-- ========================================

SELECT '🧪 TESTING SECURITY FUNCTIONS' as verification_step;

-- Test is_admin function (will return false for non-admin users)
SELECT 
    'is_admin() function' as test_name,
    CASE 
        WHEN is_admin() IS NOT NULL THEN '✅ WORKING'
        ELSE '❌ FAILED'
    END as status;

-- Test is_leadership_or_admin function
SELECT 
    'is_leadership_or_admin() function' as test_name,
    CASE 
        WHEN is_leadership_or_admin() IS NOT NULL THEN '✅ WORKING'
        ELSE '❌ FAILED'
    END as status;

-- ========================================
-- STEP 8: SECURITY SUMMARY
-- ========================================

SELECT '📊 SECURITY SUMMARY' as summary_header;

-- Count RLS enabled tables
SELECT 
    'Tables with RLS Enabled' as metric,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ ALL TABLES SECURED'
        ELSE '❌ INCOMPLETE'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
AND rowsecurity = true;

-- Count RLS policies
SELECT 
    'Total RLS Policies' as metric,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) >= 30 THEN '✅ COMPREHENSIVE'
        ELSE '❌ INCOMPLETE'
    END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- Count audit triggers
SELECT 
    'Audit Triggers' as metric,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 6 THEN '✅ ALL TABLES AUDITED'
        ELSE '❌ INCOMPLETE'
    END as status
FROM pg_trigger 
WHERE tgname LIKE '%audit%'
AND tgrelid IN (
    SELECT oid FROM pg_class 
    WHERE relname IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
);

-- ========================================
-- STEP 9: FINAL SECURITY STATUS
-- ========================================

SELECT '🎯 FINAL SECURITY STATUS' as final_header;

SELECT 
    CASE 
        WHEN (
            SELECT COUNT(*) FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
            AND rowsecurity = true
        ) = 6
        AND (
            SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'
        ) >= 30
        AND (
            SELECT COUNT(*) FROM pg_trigger 
            WHERE tgname LIKE '%audit%'
            AND tgrelid IN (
                SELECT oid FROM pg_class 
                WHERE relname IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
                AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            )
        ) = 6
        THEN '🔒 PRODUCTION-READY SECURITY'
        ELSE '⚠️ SECURITY INCOMPLETE'
    END as overall_status;

-- ========================================
-- STEP 10: RECOMMENDATIONS
-- ========================================

SELECT '💡 SECURITY RECOMMENDATIONS' as recommendations_header;

SELECT '• Run SECURITY-ENHANCEMENT.sql if any issues found' as recommendation1;
SELECT '• Regularly review access logs and audit trails' as recommendation2;
SELECT '• Update security policies quarterly' as recommendation3;
SELECT '• Conduct security training for admin users' as recommendation4;
SELECT '• Monitor for suspicious access patterns' as recommendation5;
SELECT '• Keep security documentation updated' as recommendation6; 
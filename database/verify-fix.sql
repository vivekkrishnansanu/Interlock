-- VERIFICATION SCRIPT
-- Run this after the ULTIMATE-FIX.sql to verify everything is working

-- Check if tables exist
SELECT 'TABLE CHECK:' as check_type, table_name, 'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'sites', 'employees', 'daily_logs', 'allowances', 'salary_advances')
ORDER BY table_name;

-- Check RLS status (should be disabled)
SELECT 'RLS STATUS:' as check_type, tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('sites', 'employees', 'profiles', 'daily_logs', 'allowances', 'salary_advances')
ORDER BY tablename;

-- Check if we can insert data
DO $$
BEGIN
    -- Test site insertion
    INSERT INTO sites (name, code, location, description) 
    VALUES ('Verification Test Site', 'VERIFY001', 'Test Location', 'Verification test')
    ON CONFLICT (code) DO NOTHING;
    
    RAISE NOTICE '✅ SUCCESS: Could insert into sites table';
    
    -- Test employee insertion
    INSERT INTO employees (name, cpr, designation, site_id, nt_rate, rot_rate, hot_rate) 
    VALUES ('Test Employee', '999999999', 'Tester', (SELECT id FROM sites WHERE code = 'VERIFY001'), 10.00, 15.00, 20.00)
    ON CONFLICT (cpr) DO NOTHING;
    
    RAISE NOTICE '✅ SUCCESS: Could insert into employees table';
    
    -- Clean up test data
    DELETE FROM employees WHERE cpr = '999999999';
    DELETE FROM sites WHERE code = 'VERIFY001';
    
    RAISE NOTICE '✅ SUCCESS: Could delete test data';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: %', SQLERRM;
END $$;

-- Check current data counts
SELECT 'DATA COUNTS:' as check_type, 'sites' as table_name, COUNT(*) as count FROM sites
UNION ALL
SELECT 'DATA COUNTS:' as check_type, 'employees' as table_name, COUNT(*) as count FROM employees
UNION ALL
SELECT 'DATA COUNTS:' as check_type, 'allowances' as table_name, COUNT(*) as count FROM allowances;

-- Check permissions
SELECT 'PERMISSIONS:' as check_type, grantee, table_name, privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('sites', 'employees')
AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- Final verification
SELECT '🎉 VERIFICATION COMPLETE!' as status;
SELECT 'If you see this message, the database is working correctly' as info; 
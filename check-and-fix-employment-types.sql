-- Check and fix employment types step by step
-- This script will safely migrate from 'flexi visa' to 'temporary'

-- Step 1: First, let's see what employment types currently exist
SELECT 
    employment_type,
    COUNT(*) as employee_count
FROM employees 
GROUP BY employment_type
ORDER BY employment_type;

-- Step 2: Check if there are any NULL values or unexpected values
SELECT 
    name,
    employment_type,
    CASE 
        WHEN employment_type IS NULL THEN 'NULL'
        WHEN employment_type = '' THEN 'EMPTY'
        ELSE employment_type
    END as status
FROM employees 
WHERE employment_type IS NULL OR employment_type = '' OR employment_type NOT IN ('permanent', 'flexi visa')
ORDER BY employment_type;

-- Step 3: Set default values for any problematic records
UPDATE employees 
SET employment_type = 'permanent' 
WHERE employment_type IS NULL OR employment_type = '';

-- Step 4: Now drop the constraint
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_employment_type_check;

-- Step 5: Add the new constraint
ALTER TABLE employees 
ADD CONSTRAINT employees_employment_type_check 
CHECK (employment_type IN ('permanent', 'temporary'));

-- Step 6: Update 'flexi visa' to 'temporary'
UPDATE employees 
SET employment_type = 'temporary' 
WHERE employment_type = 'flexi visa';

-- Step 7: Verify the final result
SELECT 
    employment_type,
    COUNT(*) as employee_count
FROM employees 
GROUP BY employment_type
ORDER BY employment_type;

-- Show sample of final records
SELECT 
    name,
    employment_type,
    salary_type,
    created_at
FROM employees 
ORDER BY created_at DESC
LIMIT 10;

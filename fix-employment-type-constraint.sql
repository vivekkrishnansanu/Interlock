-- Fix employment type constraint and update data
-- This script properly updates the database to support 'temporary' employment type

-- Step 1: First, drop the existing constraint
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_employment_type_check;

-- Step 2: Add the new constraint that allows 'temporary'
ALTER TABLE employees 
ADD CONSTRAINT employees_employment_type_check 
CHECK (employment_type IN ('permanent', 'temporary'));

-- Step 3: Now update the existing data
UPDATE employees 
SET employment_type = 'temporary' 
WHERE employment_type = 'flexi visa';

-- Step 4: Verify the changes
SELECT 
    employment_type,
    COUNT(*) as employee_count
FROM employees 
GROUP BY employment_type
ORDER BY employment_type;

-- Show sample of updated records
SELECT 
    name,
    employment_type,
    salary_type,
    created_at
FROM employees 
ORDER BY created_at DESC
LIMIT 10;

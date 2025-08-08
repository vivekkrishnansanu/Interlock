-- Update employment type from 'flexi visa' to 'temporary'
-- This script updates existing employee records to use the new employment type terminology

-- Update existing employees with 'flexi visa' employment type to 'temporary'
UPDATE employees 
SET employment_type = 'temporary' 
WHERE employment_type = 'flexi visa';

-- Update the check constraint to allow 'temporary' instead of 'flexi visa'
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_employment_type_check;

ALTER TABLE employees 
ADD CONSTRAINT employees_employment_type_check 
CHECK (employment_type IN ('permanent', 'temporary'));

-- Verify the changes
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

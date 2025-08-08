-- Update employment types to support the new structure
-- This script updates the database to support the three employment types

-- Step 1: First, let's see what employment types currently exist
SELECT 
    employment_type,
    COUNT(*) as employee_count
FROM employees 
GROUP BY employment_type
ORDER BY employment_type;

-- Step 2: Set default values for any problematic records
UPDATE employees 
SET employment_type = 'permanent' 
WHERE employment_type IS NULL OR employment_type = '';

-- Step 3: Drop the existing constraint
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_employment_type_check;

-- Step 4: Add the new constraint with all three employment types
ALTER TABLE employees 
ADD CONSTRAINT employees_employment_type_check 
CHECK (employment_type IN ('permanent', 'flexi visa', 'manpower supply'));

-- Step 5: Update any 'temporary' records back to 'flexi visa' if they exist
UPDATE employees 
SET employment_type = 'flexi visa' 
WHERE employment_type = 'temporary';

-- Step 6: Verify the final result
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

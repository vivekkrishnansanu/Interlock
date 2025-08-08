-- Complete Employee Migration
-- This script adds all missing fields for the new employee system

-- Step 1: Add basic_pay field to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS basic_pay DECIMAL(10,3) DEFAULT 0;

-- Step 2: Add employment_type field to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'permanent' CHECK (employment_type IN ('permanent', 'flexi visa'));

-- Step 3: Add salary_type field to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly'));

-- Step 4: Add hourly_wage field to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(10,2) DEFAULT 0;

-- Step 5: Add work_type field to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT 'workshop' CHECK (work_type IN ('workshop', 'site'));

-- Step 6: Add comments for documentation
COMMENT ON COLUMN employees.basic_pay IS 'Monthly basic pay amount used for dynamic rate calculation';
COMMENT ON COLUMN employees.employment_type IS 'Type of employment: permanent or flexi visa';
COMMENT ON COLUMN employees.salary_type IS 'Type of salary: monthly or hourly';
COMMENT ON COLUMN employees.hourly_wage IS 'Hourly wage for flexi visa employees';
COMMENT ON COLUMN employees.work_type IS 'Type of work: workshop or site';

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_basic_pay ON employees(basic_pay);
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_employees_salary_type ON employees(salary_type);
CREATE INDEX IF NOT EXISTS idx_employees_hourly_wage ON employees(hourly_wage);
CREATE INDEX IF NOT EXISTS idx_employees_work_type ON employees(work_type);

-- Step 8: Update existing employees to have proper employment type
-- Set all existing employees as permanent by default
UPDATE employees 
SET employment_type = 'permanent', 
    salary_type = 'monthly'
WHERE employment_type IS NULL;

-- Step 9: Update existing employees with basic pay if they have rates
-- This is a sample update - adjust values based on your actual requirements
UPDATE employees 
SET basic_pay = 3120.000 
WHERE name = 'DEEPAK KUMAR' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 5040.000 
WHERE name = 'ARUNKUMAR PC' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 3120.000 
WHERE name = 'AMAL KOORARA' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 3120.000 
WHERE name = 'SHIFIN RAPHEL' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 4560.000 
WHERE name = 'ARUN MON' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 3120.000 
WHERE name = 'AJITH KUMAR' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 2880.000 
WHERE name = 'VISHNU' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 3360.000 
WHERE name = 'RAVI KAMMARI' AND basic_pay = 0;

UPDATE employees 
SET basic_pay = 3240.000 
WHERE name = 'YADHUKRISHNAN' AND basic_pay = 0;

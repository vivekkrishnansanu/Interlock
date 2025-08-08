-- Add missing columns to employees table
-- This script adds the columns that the EmployeeModal expects

-- Add employment_type column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'permanent' CHECK (employment_type IN ('permanent', 'flexi visa'));

-- Add salary_type column  
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly'));

-- Add work_type column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT 'workshop' CHECK (work_type IN ('workshop', 'site'));

-- Add basic_pay column for permanent employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS basic_pay DECIMAL(10,2) DEFAULT 0;

-- Add hourly_wage column for flexi visa employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(10,2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN employees.employment_type IS 'Employment type: permanent or flexi visa';
COMMENT ON COLUMN employees.salary_type IS 'Salary type: monthly or hourly';
COMMENT ON COLUMN employees.work_type IS 'Work type: workshop or site';
COMMENT ON COLUMN employees.basic_pay IS 'Monthly basic pay for permanent employees';
COMMENT ON COLUMN employees.hourly_wage IS 'Hourly wage for flexi visa employees';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_employment_type ON employees(employment_type);
CREATE INDEX IF NOT EXISTS idx_employees_salary_type ON employees(salary_type);
CREATE INDEX IF NOT EXISTS idx_employees_work_type ON employees(work_type);
CREATE INDEX IF NOT EXISTS idx_employees_basic_pay ON employees(basic_pay);
CREATE INDEX IF NOT EXISTS idx_employees_hourly_wage ON employees(hourly_wage);

-- Update existing employees to have default values
UPDATE employees 
SET employment_type = 'permanent' 
WHERE employment_type IS NULL;

UPDATE employees 
SET salary_type = 'monthly' 
WHERE salary_type IS NULL;

UPDATE employees 
SET work_type = 'workshop' 
WHERE work_type IS NULL;

-- For existing employees, set basic_pay based on their current rates
UPDATE employees 
SET basic_pay = nt_rate * 8 * 30  -- Estimate monthly pay from hourly rate
WHERE basic_pay = 0 AND nt_rate > 0;

-- For flexi visa employees, set hourly_wage from nt_rate
UPDATE employees 
SET hourly_wage = nt_rate 
WHERE employment_type = 'flexi visa' AND hourly_wage = 0 AND nt_rate > 0;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('employment_type', 'salary_type', 'work_type', 'basic_pay', 'hourly_wage')
ORDER BY column_name;

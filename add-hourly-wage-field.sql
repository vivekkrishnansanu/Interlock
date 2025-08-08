-- Add hourly_wage field to employees table for flexi visa employees
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN employees.hourly_wage IS 'Hourly wage for flexi visa employees';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_employees_hourly_wage ON employees(hourly_wage);

-- Update existing flexi visa employees to have default hourly wage if not set
UPDATE employees 
SET hourly_wage = nt_rate 
WHERE employment_type = 'flexi visa' AND hourly_wage = 0 AND nt_rate > 0;

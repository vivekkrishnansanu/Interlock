-- Add visa fields to employees table
-- This script adds visa management fields for better employee tracking

-- Add visa_name column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS visa_name TEXT;

-- Add visa_expiry_date column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS visa_expiry_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN employees.visa_name IS 'Visa name/type for the employee';
COMMENT ON COLUMN employees.visa_expiry_date IS 'Visa expiry date for the employee';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_visa_name ON employees(visa_name);
CREATE INDEX IF NOT EXISTS idx_employees_visa_expiry_date ON employees(visa_expiry_date);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('visa_name', 'visa_expiry_date')
ORDER BY column_name;

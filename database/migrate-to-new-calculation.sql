-- Migration Script: Update Employee Rates to New Calculation Logic
-- This script updates existing employee rates to match the new calculation formulas:
-- NT Rate = (Basic Salary / No. of days in month) / 8
-- ROT Rate = Basic Salary × 12 / 365 / 8 × 1.25
-- HOT Rate = Basic Salary × 12 / 365 / 8 × 1.5

-- First, let's create a backup of current rates
CREATE TABLE IF NOT EXISTS employee_rates_backup AS 
SELECT 
    id,
    name,
    nt_rate,
    rot_rate,
    hot_rate,
    basic_pay,
    salary_type,
    employment_type,
    created_at
FROM employees;

-- Add basic_pay column if it doesn't exist (for monthly salary employees)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'basic_pay') THEN
        ALTER TABLE employees ADD COLUMN basic_pay DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Update rates for monthly salary employees using new calculation logic
UPDATE employees 
SET 
    nt_rate = (basic_pay / 31) / 8,  -- March has 31 days, adjust per month
    rot_rate = (basic_pay * 12) / 365 / 8 * 1.25,
    hot_rate = (basic_pay * 12) / 365 / 8 * 1.5
WHERE 
    salary_type = 'monthly' 
    AND basic_pay > 0;

-- Update rates for hourly wage employees (keep existing logic)
-- Note: These don't change as they use direct hourly rates
UPDATE employees 
SET 
    rot_rate = nt_rate * 1.25,
    hot_rate = nt_rate * 1.5
WHERE 
    salary_type = 'hourly' 
    AND nt_rate > 0;

-- Create a function to recalculate rates dynamically
CREATE OR REPLACE FUNCTION recalculate_employee_rates()
RETURNS TABLE (
    employee_id UUID,
    employee_name TEXT,
    old_nt_rate DECIMAL(10,2),
    new_nt_rate DECIMAL(10,2),
    old_rot_rate DECIMAL(10,2),
    new_rot_rate DECIMAL(10,2),
    old_hot_rate DECIMAL(10,2),
    new_hot_rate DECIMAL(10,2),
    change_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        b.nt_rate as old_nt_rate,
        e.nt_rate as new_nt_rate,
        b.rot_rate as old_rot_rate,
        e.rot_rate as new_rot_rate,
        b.hot_rate as old_hot_rate,
        e.hot_rate as new_hot_rate,
        CASE 
            WHEN e.salary_type = 'monthly' THEN 'Updated to new calculation logic'
            WHEN e.salary_type = 'hourly' THEN 'Updated multipliers (ROT: 1.25x, HOT: 1.5x)'
            ELSE 'No changes made'
        END as change_notes
    FROM employees e
    JOIN employee_rates_backup b ON e.id = b.id
    WHERE e.nt_rate != b.nt_rate 
       OR e.rot_rate != b.rot_rate 
       OR e.hot_rate != b.hot_rate;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION recalculate_employee_rates() TO authenticated;

-- Show summary of changes
SELECT 
    'Migration Summary' as info,
    COUNT(*) as total_employees,
    COUNT(CASE WHEN salary_type = 'monthly' THEN 1 END) as monthly_employees,
    COUNT(CASE WHEN salary_type = 'hourly' THEN 1 END) as hourly_employees
FROM employees;

-- Show what changed
SELECT * FROM recalculate_employee_rates();

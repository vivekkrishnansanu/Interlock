-- Monthly Rate Adjustment Implementation
-- This script adds basic_pay field and implements dynamic rate calculation

-- Step 1: Add basic_pay field to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS basic_pay DECIMAL(10,3) DEFAULT 0;

-- Step 2: Create function to calculate dynamic rates based on month
CREATE OR REPLACE FUNCTION calculate_monthly_rates(
    basic_pay DECIMAL(10,3),
    month_date DATE
) RETURNS TABLE(
    nt_rate DECIMAL(10,3),
    rot_rate DECIMAL(10,3),
    hot_rate DECIMAL(10,3)
) AS $$
DECLARE
    days_in_month INTEGER;
    daily_rate DECIMAL(10,3);
    hourly_rate DECIMAL(10,3);
BEGIN
    -- Get number of days in the month
    days_in_month := EXTRACT(DAY FROM (DATE_TRUNC('month', month_date) + INTERVAL '1 month - 1 day'));
    
    -- Calculate daily rate
    daily_rate := basic_pay / days_in_month;
    
    -- Calculate hourly rate (8 hours per day)
    hourly_rate := daily_rate / 8;
    
    -- Return calculated rates
    RETURN QUERY SELECT
        hourly_rate as nt_rate,
        hourly_rate * 1.25 as rot_rate,
        hourly_rate * 1.5 as hot_rate;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Update monthly_summaries view to use dynamic rates
CREATE OR REPLACE VIEW monthly_summaries AS
WITH monthly_rates AS (
    SELECT 
        e.id as employee_id,
        e.basic_pay,
        (e.basic_pay / EXTRACT(DAY FROM (DATE_TRUNC('month', dl.date) + INTERVAL '1 month - 1 day')) / 8) as nt_rate,
        (e.basic_pay / EXTRACT(DAY FROM (DATE_TRUNC('month', dl.date) + INTERVAL '1 month - 1 day')) / 8) * 1.25 as rot_rate,
        (e.basic_pay / EXTRACT(DAY FROM (DATE_TRUNC('month', dl.date) + INTERVAL '1 month - 1 day')) / 8) * 1.5 as hot_rate
    FROM employees e
    CROSS JOIN (SELECT DISTINCT DATE_TRUNC('month', date) as month_start FROM daily_logs) dl
    WHERE e.basic_pay > 0
)
SELECT 
    e.id as employee_id,
    e.name as employee_name,
    e.cpr as employee_cpr,
    e.designation as employee_designation,
    s.name as employee_site,
    e.category as employee_category,
    DATE_TRUNC('month', dl.date) as month,
    SUM(dl.nt_hours) as total_nt_hours,
    SUM(dl.rot_hours) as total_rot_hours,
    SUM(dl.hot_hours) as total_hot_hours,
    -- Use dynamic rates for calculations
    SUM(dl.nt_hours * COALESCE(mr.nt_rate, e.nt_rate)) as total_normal_time_pay,
    SUM(dl.rot_hours * COALESCE(mr.rot_rate, e.rot_rate)) as total_regular_ot_pay,
    SUM(dl.hot_hours * COALESCE(mr.hot_rate, e.hot_rate)) as total_holiday_ot_pay,
    e.allowance,
    SUM(dl.nt_hours * COALESCE(mr.nt_rate, e.nt_rate) + 
        dl.rot_hours * COALESCE(mr.rot_rate, e.rot_rate) + 
        dl.hot_hours * COALESCE(mr.hot_rate, e.hot_rate)) as total_pay,
    SUM(dl.nt_hours * COALESCE(mr.nt_rate, e.nt_rate) + 
        dl.rot_hours * COALESCE(mr.rot_rate, e.rot_rate) + 
        dl.hot_hours * COALESCE(mr.hot_rate, e.hot_rate)) + e.allowance as final_pay,
    e.deductions,
    (SUM(dl.nt_hours * COALESCE(mr.nt_rate, e.nt_rate) + 
         dl.rot_hours * COALESCE(mr.rot_rate, e.rot_rate) + 
         dl.hot_hours * COALESCE(mr.hot_rate, e.hot_rate)) + e.allowance) - e.deductions as net_pay,
    ROUND(((SUM(dl.nt_hours * COALESCE(mr.nt_rate, e.nt_rate) + 
              dl.rot_hours * COALESCE(mr.rot_rate, e.rot_rate) + 
              dl.hot_hours * COALESCE(mr.hot_rate, e.hot_rate)) + e.allowance) - e.deductions) * 10) / 10 as rounded_net_pay,
    COUNT(dl.id) as total_days,
    -- Add rate information for transparency
    COALESCE(mr.nt_rate, e.nt_rate) as calculated_nt_rate,
    COALESCE(mr.rot_rate, e.rot_rate) as calculated_rot_rate,
    COALESCE(mr.hot_rate, e.hot_rate) as calculated_hot_rate,
    EXTRACT(DAY FROM (DATE_TRUNC('month', dl.date) + INTERVAL '1 month - 1 day')) as days_in_month
FROM employees e
LEFT JOIN sites s ON e.site_id = s.id
LEFT JOIN daily_logs dl ON e.id = dl.employee_id
LEFT JOIN monthly_rates mr ON e.id = mr.employee_id AND DATE_TRUNC('month', dl.date) = DATE_TRUNC('month', mr.month_start)
GROUP BY e.id, e.name, e.cpr, e.designation, s.name, e.category, e.allowance, e.deductions, 
         e.nt_rate, e.rot_rate, e.hot_rate, mr.nt_rate, mr.rot_rate, mr.hot_rate, DATE_TRUNC('month', dl.date);

-- Step 4: Update existing employees with basic pay (example values)
-- You can adjust these values based on your actual requirements
UPDATE employees SET basic_pay = 3120.000 WHERE name = 'DEEPAK KUMAR'; -- 130 * 8 * 30
UPDATE employees SET basic_pay = 5040.000 WHERE name = 'ARUNKUMAR PC'; -- 210 * 8 * 30
UPDATE employees SET basic_pay = 3120.000 WHERE name = 'AMAL KOORARA'; -- 130 * 8 * 30
UPDATE employees SET basic_pay = 3120.000 WHERE name = 'SHIFIN RAPHEL'; -- 130 * 8 * 30
UPDATE employees SET basic_pay = 4560.000 WHERE name = 'ARUN MON'; -- 190 * 8 * 30
UPDATE employees SET basic_pay = 3120.000 WHERE name = 'AJITH KUMAR'; -- 130 * 8 * 30
UPDATE employees SET basic_pay = 2880.000 WHERE name = 'VISHNU'; -- 120 * 8 * 30
UPDATE employees SET basic_pay = 3360.000 WHERE name = 'RAVI KAMMARI'; -- 140 * 8 * 30
UPDATE employees SET basic_pay = 3240.000 WHERE name = 'YADHUKRISHNAN'; -- 135 * 8 * 30

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_employees_basic_pay ON employees(basic_pay);

-- Step 6: Add comment for documentation
COMMENT ON COLUMN employees.basic_pay IS 'Monthly basic pay amount used for dynamic rate calculation';
COMMENT ON FUNCTION calculate_monthly_rates IS 'Calculates NT, ROT, and HOT rates based on basic pay and days in month'; 
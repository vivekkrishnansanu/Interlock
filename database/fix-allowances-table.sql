-- Fix allowances table by adding missing columns
-- Add effective_date column to allowances table
ALTER TABLE allowances 
ADD COLUMN IF NOT EXISTS effective_date DATE DEFAULT CURRENT_DATE;

-- Add allowance_type column if it doesn't exist
ALTER TABLE allowances 
ADD COLUMN IF NOT EXISTS allowance_type TEXT DEFAULT 'General';

-- Update existing records to have a default effective_date
UPDATE allowances 
SET effective_date = CURRENT_DATE 
WHERE effective_date IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_allowances_effective_date ON allowances(effective_date);
CREATE INDEX IF NOT EXISTS idx_allowances_type ON allowances(allowance_type);

-- Update the table structure to match the application expectations
COMMENT ON TABLE allowances IS 'Employee allowances with effective dates and types';
COMMENT ON COLUMN allowances.effective_date IS 'Date when the allowance becomes effective';
COMMENT ON COLUMN allowances.allowance_type IS 'Type of allowance (e.g., Housing, Transport, Food)'; 
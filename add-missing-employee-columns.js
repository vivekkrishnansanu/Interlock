const { supabase } = require('./config/supabase');

console.log('🔧 Adding missing employee columns to fix EmployeeModal error...\n');

console.log('📋 INSTRUCTIONS:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the following SQL script:');
console.log('');

console.log('```sql');
console.log('-- Add missing columns to employees table');
console.log('-- This script adds the columns that the EmployeeModal expects');
console.log('');
console.log('-- Add employment_type column');
console.log('ALTER TABLE employees');
console.log('ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT \'permanent\' CHECK (employment_type IN (\'permanent\', \'flexi visa\'));');
console.log('');
console.log('-- Add salary_type column');
console.log('ALTER TABLE employees');
console.log('ADD COLUMN IF NOT EXISTS salary_type TEXT DEFAULT \'monthly\' CHECK (salary_type IN (\'monthly\', \'hourly\'));');
console.log('');
console.log('-- Add work_type column');
console.log('ALTER TABLE employees');
console.log('ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT \'workshop\' CHECK (work_type IN (\'workshop\', \'site\'));');
console.log('');
console.log('-- Add basic_pay column for permanent employees');
console.log('ALTER TABLE employees');
console.log('ADD COLUMN IF NOT EXISTS basic_pay DECIMAL(10,2) DEFAULT 0;');
console.log('');
console.log('-- Add hourly_wage column for flexi visa employees');
console.log('ALTER TABLE employees');
console.log('ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(10,2) DEFAULT 0;');
console.log('');
console.log('-- Update existing employees to have default values');
console.log('UPDATE employees');
console.log('SET employment_type = \'permanent\'');
console.log('WHERE employment_type IS NULL;');
console.log('');
console.log('UPDATE employees');
console.log('SET salary_type = \'monthly\'');
console.log('WHERE salary_type IS NULL;');
console.log('');
console.log('UPDATE employees');
console.log('SET work_type = \'workshop\'');
console.log('WHERE work_type IS NULL;');
console.log('```');
console.log('');
console.log('4. Click "Run" to execute the script');
console.log('5. After running, try adding an employee again');
console.log('');
console.log('✅ This will fix the "Could not find the \'employment_type\' column" error');

// Also try to run it programmatically if possible
async function tryAddColumns() {
  try {
    console.log('\n🔄 Attempting to add columns programmatically...');
    
    // Try to add the columns via SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE employees 
        ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'permanent' CHECK (employment_type IN ('permanent', 'flexi visa'));
        
        ALTER TABLE employees 
        ADD COLUMN IF NOT EXISTS salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly'));
        
        ALTER TABLE employees 
        ADD COLUMN IF NOT EXISTS work_type TEXT DEFAULT 'workshop' CHECK (work_type IN ('workshop', 'site'));
        
        ALTER TABLE employees 
        ADD COLUMN IF NOT EXISTS basic_pay DECIMAL(10,2) DEFAULT 0;
        
        ALTER TABLE employees 
        ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(10,2) DEFAULT 0;
      `
    });
    
    if (error) {
      console.log('❌ Programmatic approach failed:', error.message);
      console.log('📝 Please use the manual SQL approach above');
    } else {
      console.log('✅ Columns added successfully!');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('📝 Please use the manual SQL approach above');
  }
}

// Uncomment the line below if you want to try the programmatic approach
// tryAddColumns();

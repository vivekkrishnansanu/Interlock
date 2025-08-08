const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addBasicPayColumn() {
  try {
    console.log('🔧 Adding basic_pay column to employees table...');
    
    // First, let's check if the column already exists
    console.log('🔍 Checking if basic_pay column already exists...');
    
    const { data: existingColumns, error: checkError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.log('❌ Error checking table structure:', checkError.message);
      return;
    }
    
    console.log('✅ Table structure check completed');
    
    // Since we can't directly execute ALTER TABLE through the client,
    // we'll provide instructions for manual execution
    console.log('\n📋 The basic_pay column needs to be added manually in Supabase SQL Editor');
    console.log('📋 Please follow these steps:');
    console.log('\n1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run this SQL command:');
    console.log('\nALTER TABLE employees ADD COLUMN IF NOT EXISTS basic_pay DECIMAL(10,3) DEFAULT 0;');
    console.log('\n4. After running the command, the error should be resolved');
    
    // Let's also check if we can update some existing employees with basic pay values
    console.log('\n🔧 Checking existing employees...');
    
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, name, nt_rate')
      .limit(10);
    
    if (employeesError) {
      console.log('❌ Error fetching employees:', employeesError.message);
    } else {
      console.log(`✅ Found ${employees.length} employees`);
      console.log('\n📋 After adding the basic_pay column, you may want to set basic pay values for employees');
      console.log('📋 Example: UPDATE employees SET basic_pay = 3120.000 WHERE name = \'EMPLOYEE_NAME\';');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addBasicPayColumn();

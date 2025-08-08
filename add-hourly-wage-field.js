const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addHourlyWageField() {
  try {
    console.log('🔧 Adding hourly_wage field to employees table...');
    
    // First, let's check if the field already exists
    console.log('🔍 Checking if hourly_wage field already exists...');
    
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
    console.log('\n📋 The hourly_wage field needs to be added manually in Supabase SQL Editor');
    console.log('📋 Please follow these steps:');
    console.log('\n1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run this SQL command:');
    console.log('\nALTER TABLE employees ADD COLUMN IF NOT EXISTS hourly_wage DECIMAL(10,2) DEFAULT 0;');
    console.log('\n4. After running the command, the new employee form will work correctly');
    
    // Let's also check existing employees
    console.log('\n🔧 Checking existing employees...');
    
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, name, employment_type, nt_rate')
      .limit(10);
    
    if (employeesError) {
      console.log('❌ Error fetching employees:', employeesError.message);
    } else {
      console.log(`✅ Found ${employees.length} employees`);
      
      const flexiEmployees = employees.filter(emp => emp.employment_type === 'flexi visa');
      if (flexiEmployees.length > 0) {
        console.log(`📋 Found ${flexiEmployees.length} flexi visa employees that will need hourly wage values`);
        flexiEmployees.forEach(emp => {
          console.log(`   - ${emp.name}: Current NT Rate: ${emp.nt_rate}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addHourlyWageField();

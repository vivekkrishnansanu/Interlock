const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmployeeData() {
  try {
    console.log('Checking employee data...');
    
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching employees:', error);
      return;
    }

    console.log('Employee data structure:');
    data.forEach((employee, index) => {
      console.log(`\nEmployee ${index + 1}: ${employee.name}`);
      console.log('Fields:', Object.keys(employee));
      console.log('Employment Type:', employee.employment_type);
      console.log('Salary Type:', employee.salary_type);
      console.log('Basic Pay:', employee.basic_pay);
      console.log('Hourly Wage:', employee.hourly_wage);
      console.log('NT Rate:', employee.nt_rate);
      console.log('ROT Rate:', employee.rot_rate);
      console.log('HOT Rate:', employee.hot_rate);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmployeeData();


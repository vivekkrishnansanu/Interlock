const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserProfile() {
  try {
    console.log('🔍 Checking user profiles and employees relationship...\n');

    // Check all user profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
    } else {
      console.log(`👥 Found ${profiles.length} user profiles:`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.full_name} (${profile.email}) - ID: ${profile.id}`);
        console.log(`     Role: ${profile.role}, Employee ID: ${profile.employee_id || 'None'}`);
      });
    }

    console.log('\n');

    // Check all employees
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, name, designation');

    if (empError) {
      console.error('❌ Error fetching employees:', empError);
    } else {
      console.log(`👷 Found ${employees.length} employees:`);
      employees.forEach(emp => {
        console.log(`   - ${emp.name} (${emp.designation}) - ID: ${emp.id}`);
      });
    }

    console.log('\n');

    // Check if RAVI KAMMARI has a user profile
    const raviEmployee = employees?.find(emp => emp.name === 'RAVI KAMMARI');
    if (raviEmployee) {
      console.log(`🔍 RAVI KAMMARI Employee ID: ${raviEmployee.id}`);
      
      const raviProfile = profiles?.find(profile => profile.employee_id === raviEmployee.id);
      if (raviProfile) {
        console.log(`✅ RAVI KAMMARI has a user profile: ${raviProfile.email}`);
      } else {
        console.log(`❌ RAVI KAMMARI does not have a user profile`);
        console.log(`   Need to create a profile or link existing profile to employee`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserProfile();

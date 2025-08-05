const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔧 Testing database connection...');
    
    // Test employees table
    console.log('🔧 Testing employees table...');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(5);

    if (employeesError) {
      console.log('❌ Employees table error:', employeesError.message);
    } else {
      console.log('✅ Employees table accessible!');
      console.log('📊 Employee count:', employees.length);
    }

    // Test sites table
    console.log('\n🔧 Testing sites table...');
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*')
      .limit(5);

    if (sitesError) {
      console.log('❌ Sites table error:', sitesError.message);
    } else {
      console.log('✅ Sites table accessible!');
      console.log('📊 Sites count:', sites.length);
    }

    // Test creating a sample site
    console.log('\n🔧 Testing site creation...');
    const { data: newSite, error: createError } = await supabase
      .from('sites')
      .insert([
        {
          name: 'Test Site',
          code: 'TEST001',
          location: 'Test Location',
          description: 'Test site for verification'
        }
      ])
      .select()
      .single();

    if (createError) {
      console.log('❌ Site creation error:', createError.message);
    } else {
      console.log('✅ Site created successfully!');
      console.log('📝 New site:', newSite);
      
      // Clean up test data
      await supabase
        .from('sites')
        .delete()
        .eq('id', newSite.id);
      
      console.log('✅ Test data cleaned up!');
    }

    console.log('\n🎉 Database connection test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testConnection(); 
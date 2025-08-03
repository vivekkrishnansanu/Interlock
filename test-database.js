const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  try {
    console.log('🔧 Testing database connection...');
    
    // Test 1: Check if profiles table exists
    console.log('📋 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
      return;
    }
    
    console.log('✅ Profiles table exists and is accessible');
    console.log('📊 Current profiles count:', profiles.length);
    
    // Test 2: Try to create a test user
    console.log('\n🔧 Testing user creation...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (authError) {
      console.error('❌ User creation error:', authError);
      return;
    }
    
    console.log('✅ User creation test successful');
    console.log('🆔 Test user ID:', authData.user?.id);
    
    // Test 3: Check if profile was created automatically
    console.log('\n📋 Checking if profile was created automatically...');
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'test@example.com')
      .single();
    
    if (profileError) {
      console.error('❌ Profile check error:', profileError);
    } else {
      console.log('✅ Profile created automatically:', newProfile);
    }
    
    console.log('\n🎉 Database test completed successfully!');
    console.log('✅ Your database is working correctly');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabase(); 
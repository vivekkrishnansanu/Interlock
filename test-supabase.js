const { createClient } = require('@supabase/supabase-js');

// Test with the same configuration as the .env file
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

console.log('🔧 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log('🔧 Testing authentication...');
    
    // Test sign in with invalid credentials (should fail but not crash)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    console.log('🔧 Auth test response:', { data, error });
    
    if (error) {
      console.log('✅ Expected error received:', error.message);
    } else {
      console.log('❌ Unexpected success');
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
  }
}

testAuth(); 
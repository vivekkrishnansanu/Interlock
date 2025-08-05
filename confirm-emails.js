const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function confirmEmails() {
  try {
    console.log('🔧 Confirming demo user emails...');
    
    // Try to confirm emails using SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "UPDATE auth.users SET email_confirmed_at = NOW() WHERE email IN ('leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com')"
    });
    
    if (error) {
      console.log('❌ Error confirming emails:', error.message);
      console.log('📝 Please run this SQL manually in your Supabase SQL Editor:');
      console.log('');
      console.log("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email IN ('leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com');");
      console.log('');
      console.log('🔧 After running the SQL, try logging in again.');
    } else {
      console.log('✅ Emails confirmed successfully!');
      console.log('🎉 You can now login with the demo credentials!');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('📝 Please run this SQL manually in your Supabase SQL Editor:');
    console.log('');
    console.log("UPDATE auth.users SET email_confirmed_at = NOW() WHERE email IN ('leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com');");
    console.log('');
    console.log('🔧 After running the SQL, try logging in again.');
  }
}

confirmEmails(); 
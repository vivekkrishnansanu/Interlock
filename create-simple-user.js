const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSimpleUser() {
  try {
    console.log('🔧 Creating simple admin user...');
    
    // First, let's try to sign in with existing user to see if it works
    console.log('🔧 Testing login with existing user...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@interlock.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      
      // If login fails, try to create a new user
      console.log('🔧 Creating new user...');
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@interlock.com',
        password: 'admin123',
        options: {
          data: {
            name: 'Admin User',
            role: 'admin'
          }
        }
      });

      if (error) {
        console.error('❌ Error creating user:', error);
        return;
      }

      console.log('✅ User created successfully!');
      console.log('📧 Email: admin@interlock.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: admin');
      console.log('🆔 User ID:', data.user?.id);
      console.log('⚠️ Note: Email confirmation may be required');
      
      // Create profile
      if (data.user) {
        console.log('🔧 Creating profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: data.user.id,
              name: 'Admin User',
              role: 'admin',
              email: 'admin@interlock.com'
            }
          ])
          .select()
          .single();

        if (profileError) {
          console.log('⚠️ Profile creation warning:', profileError.message);
        } else {
          console.log('✅ Profile created successfully!');
        }
      }
    } else {
      console.log('✅ Login successful!');
      console.log('📧 Email: admin@interlock.com');
      console.log('🔑 Password: admin123');
      console.log('👤 User ID:', loginData.user?.id);
      console.log('✅ User is already confirmed and working!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createSimpleUser(); 
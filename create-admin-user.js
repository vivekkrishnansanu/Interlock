const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Create user with signup
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
    
    // Try to create profile manually
    if (data.user) {
      console.log('🔧 Creating profile...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([
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
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createUser(); 
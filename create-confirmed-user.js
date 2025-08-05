const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using service role key for admin operations
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIwNjMxMCwiZXhwIjoyMDY5NzgyMzEwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createConfirmedUser() {
  try {
    console.log('🔧 Creating confirmed admin user...');
    
    // Create user with admin API (bypasses email confirmation)
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@interlock.com',
      password: 'admin123',
      email_confirm: true, // This confirms the email immediately
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error);
      return;
    }

    console.log('✅ Confirmed user created successfully!');
    console.log('📧 Email: admin@interlock.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', data.user?.id);
    console.log('✅ Email confirmed:', data.user?.email_confirmed_at);
    
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
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createConfirmedUser(); 
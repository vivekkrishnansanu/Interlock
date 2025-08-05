const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const demoUsers = [
  { email: 'leadership@interlock.com', password: 'leadership123', name: 'Leadership User', role: 'leadership' },
  { email: 'admin@interlock.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { email: 'viewer@interlock.com', password: 'viewer123', name: 'Viewer User', role: 'viewer' }
];

async function createDemoUsers() {
  try {
    console.log('🔧 Creating demo users...');
    
    for (const user of demoUsers) {
      console.log(`\n🔧 Creating ${user.role} user: ${user.email}`);
      
      // Try to sign in first to see if user exists
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (loginError) {
        console.log(`❌ Login failed for ${user.email}:`, loginError.message);
        
        // Create new user
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              name: user.name,
              role: user.role
            }
          }
        });

        if (error) {
          console.error(`❌ Error creating ${user.role} user:`, error);
          continue;
        }

        console.log(`✅ ${user.role} user created successfully!`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Password: ${user.password}`);
        console.log(`👤 Role: ${user.role}`);
        console.log(`🆔 User ID: ${data.user?.id}`);
        
        // Create profile
        if (data.user) {
          console.log(`🔧 Creating profile for ${user.role}...`);
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: data.user.id,
                name: user.name,
                role: user.role,
                email: user.email
              }
            ])
            .select()
            .single();

          if (profileError) {
            console.log(`⚠️ Profile creation warning for ${user.role}:`, profileError.message);
          } else {
            console.log(`✅ Profile created successfully for ${user.role}!`);
          }
        }
      } else {
        console.log(`✅ ${user.role} user already exists and can login!`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Password: ${user.password}`);
        console.log(`👤 User ID: ${loginData.user?.id}`);
      }
    }
    
    console.log('\n🔧 Now you need to run this SQL in Supabase to confirm all emails:');
    console.log('UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW() WHERE email IN (\'leadership@interlock.com\', \'admin@interlock.com\', \'viewer@interlock.com\');');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createDemoUsers(); 
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('\nTo get your service role key:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → API');
  console.log('4. Copy the "service_role" key');
  console.log('\nThen run: SUPABASE_SERVICE_ROLE_KEY=your_key_here node create-user-manual.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser() {
  try {
    console.log('🔧 Creating user in Supabase Auth...');
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'sajin@interlock.me',
      password: 'password@123',
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: 'Sajin'
      }
    });

    if (authError) {
      console.error('❌ Error creating user in auth:', authError);
      return;
    }

    console.log('✅ User created in auth:', authData.user.id);

    // Manually create profile in profiles table
    console.log('🔧 Creating profile in profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: 'Sajin',
          role: 'admin',
          email: 'sajin@interlock.me'
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      
      // Try to get more details about the error
      if (profileError.code === '23505') {
        console.log('💡 This might be a duplicate key error. Checking if user already exists...');
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'sajin@interlock.me')
          .single();
        
        if (existingUser) {
          console.log('✅ User already exists in profiles table');
          console.log('📧 Email:', existingUser.email);
          console.log('👤 Role:', existingUser.role);
          console.log('🆔 ID:', existingUser.id);
        }
      }
      return;
    }

    console.log('✅ Profile created successfully:', profileData);
    console.log('\n🎉 User created successfully!');
    console.log('📧 Email: sajin@interlock.me');
    console.log('🔑 Password: password@123');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', authData.user.id);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createUser(); 
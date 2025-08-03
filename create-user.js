const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser() {
  try {
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
      console.error('Error creating user in auth:', authError);
      return;
    }

    console.log('✅ User created in auth:', authData.user.id);

    // Create profile in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: 'Sajin',
          role: 'admin', // Set as admin role
          email: 'sajin@interlock.me'
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created:', profileData);
    console.log('\n🎉 User created successfully!');
    console.log('Email: sajin@interlock.me');
    console.log('Password: password@123');
    console.log('Role: admin');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createUser(); 
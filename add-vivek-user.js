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
  console.log('\nThen run: SUPABASE_SERVICE_ROLE_KEY=your_key node add-vivek-user.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createVivekUser() {
  try {
    console.log('🔧 Creating Vivek user in Supabase Auth...');
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'vivekkrishnansanu@gmail.com',
      password: 'Interlock@123',
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: 'Vivek Krishnan S'
      }
    });

    if (authError) {
      console.error('❌ Error creating user in auth:', authError);
      return;
    }

    console.log('✅ User created in auth:', authData.user.id);

    // Create profile in profiles table
    console.log('🔧 Creating profile in profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: 'Vivek Krishnan S',
          role: 'admin',
          email: 'vivekkrishnansanu@gmail.com'
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created successfully:', profileData);
    console.log('\n🎉 Vivek user created successfully!');
    console.log('📧 Email: vivekkrishnansanu@gmail.com');
    console.log('🔑 Password: Interlock@123');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', authData.user.id);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createVivekUser(); 
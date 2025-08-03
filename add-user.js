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
  console.log('\nThen run: SUPABASE_SERVICE_ROLE_KEY=your_key_here node add-user.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get user details from command line arguments
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node add-user.js <email> <password> <name> [role]');
  console.log('Example: node add-user.js john@example.com password123 "John Doe" admin');
  console.log('Roles: admin, viewer, leadership (default: viewer)');
  process.exit(1);
}

const email = args[0];
const password = args[1];
const name = args[2];
const role = args[3] || 'viewer';

// Validate role
const validRoles = ['admin', 'viewer', 'leadership'];
if (!validRoles.includes(role)) {
  console.error('Invalid role. Must be one of:', validRoles.join(', '));
  process.exit(1);
}

async function createUser() {
  try {
    console.log(`🔧 Creating user: ${name} (${email}) with role: ${role}`);
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: name
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
          name: name,
          role: role,
          email: email
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
          .eq('email', email)
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
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', name);
    console.log('🎭 Role:', role);
    console.log('🆔 User ID:', authData.user.id);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createUser(); 
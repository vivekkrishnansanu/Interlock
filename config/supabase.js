const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if we have valid Supabase credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key';

let supabase, supabaseAdmin;

if (hasValidCredentials) {
  // Client for user operations (with RLS)
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Admin client for server-side operations (bypasses RLS)
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.log('⚠️  Supabase credentials not configured. Running in demo mode.');
  
  // Create mock clients for demo mode
  supabase = {
    auth: {
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ error: { message: 'Supabase not configured' } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }),
      insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: async () => ({ error: { message: 'Supabase not configured' } })
    })
  };
  
  supabaseAdmin = {
    auth: {
      admin: {
        createUser: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        deleteUser: async () => ({ error: null })
      }
    },
    from: () => ({
      insert: async () => ({ error: { message: 'Supabase not configured' } })
    })
  };
}

module.exports = { supabase, supabaseAdmin }; 
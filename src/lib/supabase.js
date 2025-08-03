import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug logging
console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('❌ Supabase environment variables not found. Running in demo mode.')
}

// Create a mock Supabase client for demo mode
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) })
    })
  }
}

// Create Supabase client with fallback
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() 
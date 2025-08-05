import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase configuration
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E'

// Debug logging
console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 
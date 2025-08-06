-- Add Vivek as a user in the system
-- This script adds Vivek with admin privileges

-- First, insert into profiles table (this will work for demo mode)
INSERT INTO profiles (
  id,
  name,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  'vivek-user-real-id',
  'Vivek',
  'vivekkrishnansanu@gmail.com',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Note: For full functionality, you would also need to:
-- 1. Create a Supabase Auth user with this email
-- 2. Link the auth user ID to the profile
-- 
-- This can be done through the Supabase dashboard or via the admin API
-- when you're ready to move from demo mode to production mode.

-- Verify the user was added
SELECT * FROM profiles WHERE email = 'vivekkrishnansanu@gmail.com';
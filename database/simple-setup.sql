-- SIMPLE DATABASE SETUP
-- Run this in Supabase SQL Editor

-- Step 1: Clean up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Create simple profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'viewer'
);

-- Step 3: Grant permissions
GRANT ALL ON profiles TO anon, authenticated;

-- Step 4: Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Create admin user profile
-- First, get the user ID from auth.users
SELECT id, email FROM auth.users WHERE email = 'vivekkrishnansanu@gmail.com';

-- Then create the profile (replace USER_ID_HERE with the actual ID)
INSERT INTO profiles (id, name, email, role) 
VALUES (
    'USER_ID_HERE', -- Replace with actual user ID
    'Vivek Krishnan S', 
    'vivekkrishnansanu@gmail.com', 
    'admin'
);

-- Step 6: Verify
SELECT 'Setup complete!' as status;
SELECT * FROM profiles; 
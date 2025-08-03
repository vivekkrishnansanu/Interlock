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
INSERT INTO profiles (id, name, email, role) 
VALUES (
    gen_random_uuid(), 
    'Vivek Krishnan S', 
    'vivekkrishnansanu@gmail.com', 
    'admin'
);

-- Step 6: Verify
SELECT 'Setup complete!' as status;
SELECT * FROM profiles; 
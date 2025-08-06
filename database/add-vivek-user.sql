-- Add Vivek as a real user in the system
-- This script creates a complete user setup with authentication

-- Step 1: Create the user in Supabase Auth (this needs to be done via Supabase Dashboard or API)
-- Go to: Supabase Dashboard > Authentication > Users > Add User
-- Email: vivekkrishnansanu@gmail.com
-- Password: (choose a secure password)
-- Email Confirm: Yes
-- 
-- OR use the admin API (requires service role key):
-- This will be handled by the backend API endpoint we created

-- Step 2: Insert/Update profile in database
-- Note: The user ID should match the Supabase Auth user ID
-- For now, we'll use a placeholder that can be updated later

DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Generate a UUID for the user (this should be replaced with actual Supabase Auth user ID)
    user_uuid := gen_random_uuid();
    
    -- Insert into profiles table
    INSERT INTO profiles (
        id,
        name,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        'Vivek',
        'vivekkrishnansanu@gmail.com',
        'admin',
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        updated_at = NOW();
    
    -- Output the generated UUID for reference
    RAISE NOTICE 'User created with ID: %', user_uuid;
END $$;

-- Verify the user was added
SELECT 
    id,
    name,
    email,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'vivekkrishnansanu@gmail.com';

-- Grant necessary permissions (if using RLS)
-- The user will inherit permissions based on their role through the RLS policies
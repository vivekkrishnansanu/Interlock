-- EMERGENCY DATABASE FIX
-- This will completely reset and create a working database

-- Step 1: Drop everything
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS salary_advances CASCADE;
DROP TABLE IF EXISTS allowances CASCADE;
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create a very simple profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'viewer'
);

-- Step 4: Create a simple trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        'viewer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 6: Grant all permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 7: Disable RLS temporarily to avoid permission issues
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 8: Create a test admin user manually (optional)
-- Uncomment the line below and replace USER_ID with actual user ID if you create a user manually
-- INSERT INTO profiles (id, name, email, role) VALUES ('USER_ID_HERE', 'Admin User', 'admin@example.com', 'admin'); 
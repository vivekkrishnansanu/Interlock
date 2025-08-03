-- Fix the profile entry for the user
-- Replace 'USER_ID_HERE' with the actual user ID from the profiles table

-- First, let's see what's in the profiles table
SELECT * FROM profiles;

-- Update the profile with correct information
-- Replace the UUID below with the actual user ID from your profiles table
UPDATE profiles 
SET 
    name = 'Vivek Krishnan S',
    email = 'vivekkrishnansanu@gmail.com',
    role = 'admin'
WHERE id = 'USER_ID_HERE'; -- Replace with actual UUID

-- Verify the update
SELECT * FROM profiles WHERE email = 'vivekkrishnansanu@gmail.com'; 
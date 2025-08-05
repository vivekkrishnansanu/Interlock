-- Confirm admin user email
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'admin@interlock.com';

-- Verify the update
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'admin@interlock.com'; 
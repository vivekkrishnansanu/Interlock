-- Confirm all demo users' emails
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email IN ('leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com');

-- Verify the update
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users 
WHERE email IN ('leadership@interlock.com', 'admin@interlock.com', 'viewer@interlock.com'); 
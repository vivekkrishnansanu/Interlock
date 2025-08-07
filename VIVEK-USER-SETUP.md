# Adding Vivek as a Real User

This guide explains how to add Vivek (vivekkrishnansanu@gmail.com) as a real authenticated user in the system.

## 🎯 User Details
- **Name**: Vivek
- **Email**: vivekkrishnansanu@gmail.com
- **Role**: Admin (full system access)
- **Status**: Real user with database authentication

## 🚀 Setup Options

### Option 1: Via Backend API (Recommended)

1. **Login as Admin** to get authentication token:
   ```bash
   curl -X POST https://interlock-bahrain.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@interlock.com", "password": "password"}'
   ```

2. **Create Vivek's User Account**:
   ```bash
   curl -X POST https://interlock-bahrain.vercel.app/api/users \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{
       "name": "Vivek",
       "email": "vivekkrishnansanu@gmail.com", 
       "role": "admin",
       "password": "VivekSecure123!"
     }'
   ```

3. **Verify Creation**:
   ```bash
   curl -X GET https://interlock-bahrain.vercel.app/api/users \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

### Option 2: Via Supabase Dashboard

1. **Go to Supabase Dashboard**:
   - Navigate to your project at https://supabase.com
   - Go to Authentication → Users

2. **Add New User**:
   - Click "Add User"
   - Email: `vivekkrishnansanu@gmail.com`
   - Password: Choose a secure password (e.g., `VivekSecure123!`)
   - Email Confirm: ✅ Yes
   - Click "Create User"

3. **Copy User ID** from the created user

4. **Run Database Script**:
   - Connect to your PostgreSQL database
   - Run the SQL from `database/add-vivek-user.sql`
   - Update the profile with the correct Supabase user ID:
     ```sql
     UPDATE profiles 
     SET id = 'SUPABASE_USER_ID_HERE' 
     WHERE email = 'vivekkrishnansanu@gmail.com';
     ```

### Option 3: Database Only (Testing)

1. **Run SQL Script**:
   ```sql
   -- Connect to your database and run:
   \i database/add-vivek-user.sql
   ```

2. **Manual Auth Setup** (later):
   - Create Supabase auth user manually
   - Link to existing profile

## 🔐 Vivek's Password
- **Password**: `Admin@123`
- **Set by**: User request
- **Status**: Configured in Supabase

## ✅ Verification Steps

After setup, verify the user works:

1. **Login Test**:
   - Go to your app login page
   - Email: `vivekkrishnansanu@gmail.com`
   - Password: `Admin@123`

2. **Admin Access Test**:
   - Navigate to User Management
   - Should see all users including himself
   - Can create/edit/delete other users

3. **Database Check**:
   ```sql
   SELECT * FROM profiles WHERE email = 'vivekkrishnansanu@gmail.com';
   ```

## 🛡️ Security Notes

- ✅ User has **admin role** - full system access
- ✅ **Row Level Security** policies apply
- ✅ **Audit trails** will track his actions
- ✅ **Role-based permissions** enforced

## 🎯 Next Steps

After Vivek is added as a real user:
1. He can login with his credentials
2. Has full admin access to the system
3. Can manage other users, employees, sites, etc.
4. All his actions will be properly logged and secured

## 📞 Support

If you encounter any issues:
1. Check the backend API logs in Vercel
2. Verify Supabase authentication is working
3. Ensure the profile was created correctly
4. Test with the demo accounts first to isolate issues
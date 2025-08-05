# 🚨 Production Database Fix Guide

## **IMMEDIATE SOLUTION**

### **Step 1: Run the Emergency Fix Script**
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of `database/emergency-fix-production.sql`
4. Click **Run**

This script will:
- ✅ Drop all existing policies
- ✅ Disable RLS temporarily
- ✅ Create all missing tables
- ✅ Add missing columns
- ✅ Grant proper permissions
- ✅ Test data insertion
- ✅ Re-enable RLS with permissive policies

### **Step 2: Test the Application**
After running the script:
1. Go to [https://interlock-two.vercel.app/](https://interlock-two.vercel.app/)
2. Sign in with demo credentials:
   - **Leadership**: `leadership@interlock.com` / `leadership123`
   - **Admin**: `admin@interlock.com` / `admin123`
   - **Viewer**: `viewer@interlock.com` / `viewer123`
3. Try adding a site, employee, or any other data

## **If Still Not Working**

### **Step 3: Check Console Errors**
1. Open browser developer tools (F12)
2. Go to **Console** tab
3. Look for any red error messages
4. Share the errors with me

### **Step 4: Run Debug Script**
If you're still having issues:
1. Run `database/debug-production.sql` in Supabase SQL Editor
2. Share the results with me

## **Common Issues & Solutions**

### **Issue 1: "Table doesn't exist"**
**Solution**: Run the emergency fix script

### **Issue 2: "Permission denied"**
**Solution**: The emergency script grants all permissions

### **Issue 3: "RLS policy violation"**
**Solution**: The emergency script creates permissive policies

### **Issue 4: "Column doesn't exist"**
**Solution**: The emergency script adds all missing columns

### **Issue 5: "Authentication failed"**
**Solution**: 
1. Clear browser cache and cookies
2. Try signing in again with demo credentials
3. Check if you're properly authenticated

## **What the Emergency Script Does**

1. **Cleans up existing issues**: Drops conflicting policies
2. **Disables security temporarily**: Allows all operations
3. **Creates complete schema**: All tables with proper structure
4. **Grants permissions**: Full access for authenticated users
5. **Tests functionality**: Verifies data insertion works
6. **Re-enables security**: With permissive policies

## **Expected Results**

After running the emergency script, you should see:
- ✅ "SUCCESS: Database setup completed"
- ✅ "Test site created: Test Site TEST001"
- ✅ "COMPLETE: All tables created, RLS enabled with permissive policies"

## **If Nothing Works**

1. **Check Supabase Status**: Visit [status.supabase.com](https://status.supabase.com)
2. **Verify Environment Variables**: Check Vercel environment variables
3. **Contact Support**: Share the exact error messages

## **Quick Commands**

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check if you can insert data
INSERT INTO sites (name, code) VALUES ('Test', 'TEST') ON CONFLICT DO NOTHING;

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies;
```

## **Success Indicators**

✅ You can sign in with demo credentials  
✅ You can add sites without errors  
✅ You can add employees without errors  
✅ You can add daily logs without errors  
✅ No red errors in browser console  
✅ Data persists after page refresh  

---

**If you're still having issues after running the emergency script, please share:**
1. The exact error messages from browser console
2. The results of the debug script
3. What happens when you try to add data 
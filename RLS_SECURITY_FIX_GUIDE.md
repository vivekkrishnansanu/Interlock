# RLS Security Fix Guide

## Problem Summary
Your database has **Row Level Security (RLS) disabled** on several critical tables, which exposes sensitive employee and financial data to unauthorized access. This is a significant security vulnerability.

## Affected Tables
- `public.profiles` - User profile information
- `public.sites` - Work site locations
- `public.daily_logs` - Employee time tracking
- `public.allowances` - Employee allowances
- `public.salary_advances` - Salary advance records
- `public.employees` - Employee information

## What This Means
Without RLS enabled, these tables are potentially exposed through PostgREST, meaning:
- Anyone with database access could view all employee data
- Sensitive salary and timecard information could be accessed
- Data could be modified without proper authorization
- Compliance and privacy regulations may be violated

## How to Fix

### Option 1: Run the Complete Fix Script (Recommended)
```bash
# Connect to your database and run:
psql -d your_database_name -f database/fix-rls-security.sql
```

### Option 2: Manual Fix Steps

#### Step 1: Enable RLS on All Tables
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances ENABLE ROW LEVEL SECURITY;
```

#### Step 2: Create Security Policies

**Profiles Table:**
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
```

**Sites Table:**
```sql
-- All authenticated users can view sites
CREATE POLICY "All authenticated users can view sites" ON sites
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only editors and admins can modify sites
CREATE POLICY "Editors and admins can modify sites" ON sites
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    );
```

**Employees Table:**
```sql
-- All authenticated users can view employees
CREATE POLICY "All authenticated users can view employees" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only editors and admins can modify employees
CREATE POLICY "Editors and admins can modify employees" ON employees
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    );
```

**Daily Logs Table:**
```sql
-- All authenticated users can view daily logs
CREATE POLICY "All authenticated users can view daily logs" ON daily_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only editors and admins can modify daily logs
CREATE POLICY "Editors and admins can modify daily logs" ON daily_logs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
    );
```

**Allowances Table:**
```sql
-- All authenticated users can view allowances
CREATE POLICY "All authenticated users can view allowances" ON allowances
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify allowances
CREATE POLICY "Admins can modify allowances" ON allowances
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
```

**Salary Advances Table:**
```sql
-- All authenticated users can view salary advances
CREATE POLICY "All authenticated users can view salary advances" ON salary_advances
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify salary advances
CREATE POLICY "Admins can modify salary advances" ON salary_advances
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
```

### Step 3: Verify the Fix
Run the verification script:
```bash
psql -d your_database_name -f database/verify-rls-status.sql
```

## Security Policy Design

### Access Levels
- **Viewers**: Can only read data
- **Editors**: Can read and modify most data (except sensitive financial data)
- **Admins**: Full access to all data and operations

### Data Sensitivity
- **Low Sensitivity**: Sites, basic employee info
- **Medium Sensitivity**: Daily logs, time tracking
- **High Sensitivity**: Allowances, salary advances, user profiles

## Testing the Fix

### 1. Test as Regular User
- Should only see their own profile
- Should see all sites, employees, daily logs
- Should NOT be able to modify sensitive data

### 2. Test as Editor
- Should be able to modify sites, employees, daily logs
- Should NOT be able to modify allowances or salary advances

### 3. Test as Admin
- Should have full access to all tables
- Should be able to create/modify/delete any record

## Common Issues and Solutions

### Issue: "Policy already exists"
**Solution:** Drop existing policies first:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Issue: "RLS already enabled"
**Solution:** This is fine - the ALTER TABLE command will succeed even if RLS is already enabled.

### Issue: "Permission denied"
**Solution:** Ensure your database user has the necessary privileges to modify table security settings.

## Monitoring and Maintenance

### Regular Security Audits
- Run the verification script monthly
- Check for new tables that might need RLS
- Review policy effectiveness

### Policy Updates
- Update policies when adding new features
- Review access patterns and adjust as needed
- Document all policy changes

## Benefits of This Fix

1. **Data Protection**: Sensitive employee data is now properly secured
2. **Compliance**: Meets data privacy and security requirements
3. **Access Control**: Users can only access data they're authorized to see
4. **Audit Trail**: All access is logged and can be monitored
5. **Risk Reduction**: Minimizes potential data breaches

## Next Steps

1. **Immediate**: Run the fix script to secure your database
2. **Short-term**: Test the security policies with different user roles
3. **Long-term**: Implement regular security audits and monitoring

## Support

If you encounter any issues during the fix process:
1. Check the database logs for error messages
2. Verify your database user has sufficient privileges
3. Test policies with a small subset of data first
4. Consider rolling back if issues arise (though this is not recommended for security)

---

**⚠️ IMPORTANT**: This fix addresses critical security vulnerabilities. Implement it as soon as possible to protect your employee data.

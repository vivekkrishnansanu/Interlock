# 🚀 Production Deployment Guide: New Wage Calculation Logic

## 📋 **Overview**

This guide will help you safely deploy the new wage calculation logic to your production system. The new logic ensures your application matches Excel calculations exactly.

## 🎯 **What's Changing**

### **Old Logic**:
- NT Rate: `basicPay ÷ daysInMonth ÷ 8`
- ROT Rate: `hourlyRate × 1.25`
- HOT Rate: `hourlyRate × 1.5`

### **New Logic**:
- **NT Rate**: `(Basic Salary / No. of days in month) / 8`
- **ROT Rate**: `Basic Salary × 12 / 365 / 8 × 1.25`
- **HOT Rate**: `Basic Salary × 12 / 365 / 8 × 1.5`

## 🛡️ **Safety Features**

✅ **Backup Creation**: All current rates are backed up before changes  
✅ **Preview Mode**: See exactly what will change before execution  
✅ **Rollback Capability**: Can revert to previous rates if needed  
✅ **Audit Trail**: All changes are logged for compliance  
✅ **No Data Loss**: Original data is preserved in backup table  

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Environment**

1. **Ensure you have access to production database**
2. **Verify environment variables are set**:
   ```bash
   SUPABASE_URL=your_production_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
3. **Test connection to production database**

### **Step 2: Deploy Code Changes**

1. **Deploy the updated `utils/wageCalculator.js`** to production
2. **Restart your application** to load the new calculation logic
3. **Verify the application is running** with new code

### **Step 3: Run Migration Script (Preview Mode)**

```bash
# First, run in preview mode to see what will change
node migrate-production-rates.js
```

This will:
- Show you exactly which employees will be affected
- Display the old vs new rates
- **NOT make any changes** to production data

### **Step 4: Review Changes**

Carefully review the preview output:
- ✅ Verify the new rates match your Excel calculations
- ✅ Check that the right employees are being updated
- ✅ Ensure no unexpected changes

### **Step 5: Execute Migration**

```bash
# When ready, run with confirmation flag
node migrate-production-rates.js --confirm
```

This will:
- Create backup table (`employee_rates_backup`)
- Update all employee rates to new calculation logic
- Log all changes for audit trail

### **Step 6: Verify Deployment**

1. **Check application is working** with new rates
2. **Verify calculations match Excel** for sample employees
3. **Test payroll generation** with new logic
4. **Monitor for any issues**

## 🔄 **Rollback Plan (If Needed)**

If you need to revert the changes:

```bash
# Preview what will be rolled back
node rollback-production-rates.js

# Execute rollback
node rollback-production-rates.js --confirm
```

## 📊 **Expected Results**

### **For Monthly Salary Employees**:
- **NT Rate**: Will change to match new formula
- **ROT Rate**: Will change to `Basic Pay × 12 / 365 / 8 × 1.25`
- **HOT Rate**: Will change to `Basic Pay × 12 / 365 / 8 × 1.5`

### **For Hourly Wage Employees**:
- **NT Rate**: No change (remains hourly wage)
- **ROT Rate**: Will change to `NT Rate × 1.25`
- **HOT Rate**: Will change to `NT Rate × 1.5`

## ⚠️ **Important Considerations**

### **Before Deployment**:
- [ ] **Backup your production database** (additional safety)
- [ ] **Test in staging environment** if available
- [ ] **Schedule during low-traffic period**
- [ ] **Notify stakeholders** of the change

### **During Deployment**:
- [ ] **Monitor application logs** for errors
- [ ] **Verify calculations** for sample employees
- [ ] **Check payroll reports** are generating correctly

### **After Deployment**:
- [ ] **Monitor for 24-48 hours** for any issues
- [ ] **Verify Excel compatibility** is working
- [ ] **Update documentation** with new logic
- [ ] **Train users** on new calculation method

## 🧪 **Testing Checklist**

- [ ] **Daily Log Calculations**: Verify NT, ROT, HOT pay calculations
- [ ] **Monthly Summaries**: Check total pay calculations
- [ ] **Excel Export**: Ensure exported data matches Excel formulas
- [ ] **Payroll Reports**: Verify final pay amounts are correct
- [ ] **Edge Cases**: Test with zero hours, maximum hours, etc.

## 📞 **Support & Troubleshooting**

### **Common Issues**:
1. **Rates not updating**: Check if `basic_pay` field exists and has values
2. **Calculation errors**: Verify the new formula is working correctly
3. **Performance issues**: Monitor database query performance

### **If Something Goes Wrong**:
1. **Immediately run rollback script** to restore previous rates
2. **Check application logs** for error details
3. **Verify database connection** and permissions
4. **Contact development team** with error details

## 🎯 **Success Criteria**

✅ **All employee rates updated** to new calculation logic  
✅ **Excel compatibility achieved** (rates match exactly)  
✅ **Payroll calculations working** with new logic  
✅ **No data loss** (backup table created)  
✅ **Audit trail complete** (all changes logged)  
✅ **Application performance** maintained  

## 📝 **Post-Deployment Tasks**

1. **Update user documentation** with new calculation method
2. **Train payroll staff** on new logic
3. **Update Excel templates** if needed
4. **Monitor first payroll cycle** with new rates
5. **Gather user feedback** on new calculations

---

**🚀 Your production system will now calculate wages exactly like Excel!**

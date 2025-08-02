# 🧮 Updated Wage Calculation Logic

## 📊 **Calculation Logic (per employee)**

### **1. Total Normal Time Pay**
```
Total Normal Time Pay = Sum(N.T hours) × N.T Rate
```

### **2. Total Regular OT Pay**
```
Total Regular OT Pay = Sum(R.O.T hours) × R.O.T Rate
```

### **3. Total Holiday OT Pay**
```
Total Holiday OT Pay = Sum(H.O.T hours) × H.O.T Rate
```

### **4. Total Pay**
```
Total Pay = (NT + ROT + HOT)
```

### **5. Final Pay**
```
Final Pay = Total Pay + Allowance
```

### **6. Net Pay**
```
Net Pay = Final Pay - Deductions
```

### **7. Rounded Net Pay**
```
Rounded Net Pay = Round off Net Pay to nearest 1 decimal
```

## 📋 **Example Calculation**

### **Employee Details:**
- **Name**: DEEPAK KUMAR
- **N.T Rate**: 130.000 BHD
- **R.O.T Rate**: 195.000 BHD (1.5x N.T Rate)
- **H.O.T Rate**: 260.000 BHD (2x N.T Rate)
- **Allowance**: 50.000 BHD
- **Deductions**: 25.000 BHD

### **Monthly Hours:**
- **N.T Hours**: 160 hours
- **R.O.T Hours**: 20 hours
- **H.O.T Hours**: 8 hours

### **Calculation:**
1. **Total Normal Time Pay** = 160 × 130.000 = **20,800.000 BHD**
2. **Total Regular OT Pay** = 20 × 195.000 = **3,900.000 BHD**
3. **Total Holiday OT Pay** = 8 × 260.000 = **2,080.000 BHD**
4. **Total Pay** = 20,800 + 3,900 + 2,080 = **26,780.000 BHD**
5. **Final Pay** = 26,780 + 50 = **26,830.000 BHD**
6. **Net Pay** = 26,830 - 25 = **26,805.000 BHD**
7. **Rounded Net Pay** = **26,805.000 BHD**

## 🔧 **Implementation Details**

### **Database Schema Updates**
- Added `deductions` field to `employees` table
- Updated `monthly_summaries` view with new calculation fields
- All calculations now include deductions and net pay

### **Frontend Updates**
- **Employee Modal**: Added deductions input field
- **Daily Logs**: Updated calculation display to show:
  - N.T Pay, R.O.T Pay, H.O.T Pay
  - Total Pay, Allowance, Final Pay
  - Deductions, Net Pay (rounded)
- **Monthly Summaries**: Updated to use new calculation logic

### **Backend Updates**
- **Wage Calculator**: Updated with new calculation functions
- **Validation**: Added deductions validation (must be positive)
- **API**: All endpoints now handle deductions field

## 📊 **Excel Compatibility**

### **SALARY Sheet Mapping**
| Excel Column | Application Field | Description |
|--------------|------------------|-------------|
| Employee Name | `name` | Full employee name |
| CPR Number | `cpr` | Unique CPR identifier |
| N.T Rate | `nt_rate` | Normal time hourly rate |
| R.O.T Rate | `rot_rate` | Regular overtime rate |
| H.O.T Rate | `hot_rate` | Holiday overtime rate |
| Allowance | `allowance` | Additional allowance |
| **Deductions** | `deductions` | **Deductions from pay** |
| TOTAL SALARY | Calculated | Sum of all pay types |
| **FINAL PAY** | Calculated | **Total + Allowance** |
| **NET PAY** | Calculated | **Final Pay - Deductions** |

### **TIME CARD Sheet Mapping**
| Excel Column | Application Field | Description |
|--------------|------------------|-------------|
| Employee Name/CPR | `employee_id` | Employee reference |
| Date | `date` | Work date |
| N.T Hours | `nt_hours` | Normal time hours |
| R.O.T Hours | `rot_hours` | Regular overtime hours |
| H.O.T Hours | `hot_hours` | Holiday overtime hours |
| Site Reference | `site_ref` | Work site (optional) |
| Day Type | Auto-detected | Holiday/Friday/Normal |

## 🎯 **Key Features**

### **✅ Real-time Calculations**
- Instant wage previews in daily logs
- Automatic calculation updates when rates change
- Live net pay calculations with deductions

### **✅ Comprehensive Breakdown**
- Detailed breakdown of all pay components
- Clear separation of allowances and deductions
- Final net pay with proper rounding

### **✅ Data Validation**
- Positive value validation for all amounts
- Proper decimal handling
- Consistent rounding to 1 decimal place

### **✅ Export Compatibility**
- CSV exports include all calculation fields
- Excel-compatible format
- Complete wage breakdown for payroll

## 🔄 **Migration Notes**

### **For Existing Data**
- Existing employees will have `deductions = 0` by default
- All existing calculations remain valid
- New deductions field is optional

### **For New Implementations**
- All new employees can have deductions set during creation
- Calculation logic automatically handles deductions
- Net pay is always calculated and displayed

---

**🎯 The wage calculation system now fully supports the specified logic with deductions and net pay calculations!** 
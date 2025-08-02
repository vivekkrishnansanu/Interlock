# Flexi Visa Employee Implementation

## Overview
The system now supports **Flexi Visa employees** (temporary/outsourced workers) alongside permanent employees. Flexi visa employees are always on hourly basis and have different work arrangements.

## Key Features

### 1. Employment Type Classification
- **Permanent Employees**: Regular full-time employees
- **Flexi Visa Employees**: Temporary/outsourced workers

### 2. Automatic Salary Type Enforcement
- **Permanent Employees**: Can be either hourly or fixed salary
- **Flexi Visa Employees**: Always hourly (automatically enforced)

### 3. Work Type Support
- **Workshop**: Employees working in workshop facilities
- **Site**: Employees working at various project sites

## Employee Categories

### Permanent Employees
- **Supervisor**: Management level employees
- **Technician**: Skilled technical workers
- **Worker**: General laborers and workers

### Flexi Visa Employees
- **Flexi Worker**: Temporary/outsourced workers (always hourly)

## Implementation Details

### Form Fields
When adding/editing employees, the system now includes:

1. **Employment Type** (Required)
   - Permanent
   - Flexi Visa

2. **Category** (Dynamic based on employment type)
   - For Permanent: Supervisor, Technician, Worker
   - For Flexi: Flexi Worker (automatically selected)

3. **Work Type**
   - Workshop
   - Site

4. **Salary Type** (Auto-controlled)
   - For Permanent: Hourly or Fixed
   - For Flexi: Hourly (disabled, always selected)

### Data Structure
```javascript
{
  id: 'emp-20',
  name: 'AHMED KHAN',
  cpr: '678901245',
  doj: '2024-08-01',
  category: 'Flexi Worker',
  employmentType: 'flexi', // 'permanent' or 'flexi'
  workType: 'site', // 'workshop' or 'site'
  salaryType: 'hourly', // 'hourly' or 'fixed' (always 'hourly' for flexi)
  currentRate: 1.5,
  previousRate: 1.5,
  ntRate: 1.5,
  rotRate: 2.25,
  hotRate: 3.0,
  allowance: 0
}
```

## User Interface Features

### 1. Employee Form
- **Employment Type Selection**: Dropdown with Permanent/Flexi options
- **Dynamic Category Options**: Changes based on employment type
- **Auto-disabled Salary Type**: For flexi employees, salary type is locked to hourly
- **Visual Indicators**: Orange info box for flexi visa employees

### 2. Employee Table
- **Employment Type Column**: Shows "Permanent" or "Flexi Visa"
- **Color-coded Badges**: Different colors for different employment types
- **Filter Support**: Filter by employment type

### 3. Filters
- **Employment Type Filter**: Filter by Permanent or Flexi Visa
- **Work Type Filter**: Filter by Workshop or Site
- **Category Filter**: Filter by employee categories

## Business Rules

### 1. Flexi Visa Constraints
- ✅ Always hourly salary type
- ✅ Can work in workshop or site
- ✅ No fixed salary option
- ✅ Category automatically set to "Flexi Worker"

### 2. Permanent Employee Options
- ✅ Can be hourly or fixed salary
- ✅ Can work in workshop or site
- ✅ Multiple category options
- ✅ Full flexibility in salary structure

### 3. Wage Calculation
- **Normal Time**: Current rate × hours
- **Regular OT**: Current rate × 1.5 × hours
- **Holiday OT**: Current rate × 2.0 × hours
- **Advance Deductions**: Applied to net pay

## Example Scenarios

### Scenario 1: Adding a Flexi Visa Employee
1. Select "Flexi Visa" as employment type
2. Category automatically becomes "Flexi Worker"
3. Salary type is locked to "Hourly"
4. Enter hourly rate (e.g., BHD 1.5/hr)
5. Select work type (workshop or site)

### Scenario 2: Adding a Permanent Employee
1. Select "Permanent" as employment type
2. Choose category (Supervisor, Technician, Worker)
3. Select salary type (Hourly or Fixed)
4. Enter appropriate rate
5. Select work type (workshop or site)

### Scenario 3: Wage Calculation for Flexi Employee
```
Employee: Ahmed Khan (Flexi Visa)
Hourly Rate: BHD 1.5
Normal Hours: 8
Regular OT Hours: 2
Holiday OT Hours: 1

Calculation:
- Normal Pay: 8 × BHD 1.5 = BHD 12.00
- Regular OT: 2 × BHD 1.5 × 1.5 = BHD 4.50
- Holiday OT: 1 × BHD 1.5 × 2.0 = BHD 3.00
- Total Pay: BHD 19.50
```

## Benefits

1. **Clear Classification**: Distinguishes between permanent and temporary workers
2. **Compliance**: Ensures flexi visa employees follow proper regulations
3. **Flexibility**: Supports different work arrangements
4. **Transparency**: Clear visual indicators and filtering options
5. **Accuracy**: Automatic enforcement of business rules

## Integration Points

- **Daily Logs**: Flexi employees appear in employee selection
- **Monthly Summaries**: Included in reports with employment type
- **Salary Advances**: Can request advances (same as permanent employees)
- **Timecard**: Can view their work hours and site assignments
- **Export Functions**: Employment type included in CSV exports

This implementation ensures proper handling of both permanent and flexi visa employees while maintaining data integrity and business rule compliance. 
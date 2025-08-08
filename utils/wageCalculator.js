/**
 * Wage calculation utilities with monthly rate adjustment
 */

// Calculate dynamic rates based on basic pay and month
const calculateMonthlyRates = (basicPay, month, year) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyRate = basicPay / daysInMonth;
  const hourlyRate = dailyRate / 8;
  
  return {
    ntRate: hourlyRate,
    rotRate: hourlyRate * 1.25,
    hotRate: hourlyRate * 1.5
  };
};

// Calculate daily wage for an employee with dynamic rates
const calculateDailyWage = (dailyLog, employee) => {
  const { ntHours = 0, rotHours = 0, hotHours = 0 } = dailyLog;
  const { basicPay = 0, ntRate = 0, rotRate = 0, hotRate = 0, employmentType = 'permanent', hourlyWage = 0 } = employee;

  // Calculate rates based on employment type
  let rates = { ntRate: ntRate || 0, rotRate: rotRate || 0, hotRate: hotRate || 0 };
  
  if (employmentType === 'permanent' && basicPay > 0) {
    // For permanent employees, calculate dynamic rates from basic pay
    const logDate = new Date(dailyLog.date);
    const dynamicRates = calculateMonthlyRates(basicPay, logDate.getMonth(), logDate.getFullYear());
    rates = dynamicRates;
  } else if (employmentType === 'flexi visa' && hourlyWage > 0) {
    // For flexi visa employees, use hourly wage with multipliers
    rates = {
      ntRate: hourlyWage,
      rotRate: hourlyWage * 1.25,
      hotRate: hourlyWage * 1.5
    };
  }

  // Calculate pay for each type with validation
  const normalPay = (ntHours || 0) * (rates.ntRate || 0);
  const regularOTPay = (rotHours || 0) * (rates.rotRate || 0);
  const holidayOTPay = (hotHours || 0) * (rates.hotRate || 0);

  // Total daily pay
  const totalPay = normalPay + regularOTPay + holidayOTPay;

  return {
    normalPay: normalPay || 0,
    regularOTPay: regularOTPay || 0,
    holidayOTPay: holidayOTPay || 0,
    totalPay: totalPay || 0,
    rates: rates, // Include rates for transparency
    employmentType: employmentType
  };
};

// Calculate monthly summary for an employee with dynamic rates
const calculateMonthlySummary = (dailyLogs, employee, month, year) => {
  // Filter logs for the specific month
  const monthLogs = dailyLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === month && logDate.getFullYear() === year;
  });

  // Initialize totals
  let totalNt = 0;
  let totalRot = 0;
  let totalHot = 0;

  // Sum up all hours for the month
  monthLogs.forEach(log => {
    totalNt += log.ntHours || 0;
    totalRot += log.rotHours || 0;
    totalHot += log.hotHours || 0;
  });

  // Calculate rates for the month based on employment type
  let rates = { ntRate: employee.ntRate || 0, rotRate: employee.rotRate || 0, hotRate: employee.hotRate || 0 };
  
  if (employee.employmentType === 'permanent' && employee.basicPay > 0) {
    // For permanent employees, calculate dynamic rates from basic pay
    const dynamicRates = calculateMonthlyRates(employee.basicPay, month, year);
    rates = dynamicRates;
  } else if (employee.employmentType === 'flexi visa' && employee.hourlyWage > 0) {
    // For flexi visa employees, use hourly wage with multipliers
    rates = {
      ntRate: employee.hourlyWage,
      rotRate: employee.hourlyWage * 1.25,
      hotRate: employee.hourlyWage * 1.5
    };
  }

  // Calculate pay amounts using dynamic rates
  const totalNormalTimePay = totalNt * (rates.ntRate || 0);
  const totalRegularOTPay = totalRot * (rates.rotRate || 0);
  const totalHolidayOTPay = totalHot * (rates.hotRate || 0);

  // Calculate total pay
  const totalPay = totalNormalTimePay + totalRegularOTPay + totalHolidayOTPay;
  const finalPay = totalPay + (employee.allowance || 0);
  
  // Apply deductions if provided
  const deductions = employee.deductions || 0;
  const netPay = finalPay - deductions;
  
  // Round off Net Pay to nearest 1 decimal
  const roundedNetPay = Math.round((netPay || 0) * 10) / 10;

  // Get days in month for transparency
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    month: `${getMonthName(month)} ${year}`,
    totalNt: totalNt || 0,
    totalRot: totalRot || 0,
    totalHot: totalHot || 0,
    totalNormalTimePay: totalNormalTimePay || 0,
    totalRegularOTPay: totalRegularOTPay || 0,
    totalHolidayOTPay: totalHolidayOTPay || 0,
    allowance: employee.allowance || 0,
    totalPay: totalPay || 0,
    finalPay: finalPay || 0,
    deductions: deductions || 0,
    netPay: netPay || 0,
    roundedNetPay: roundedNetPay || 0,
    totalDays: monthLogs.length,
    // Add rate information for transparency
    calculatedNtRate: rates.ntRate,
    calculatedRotRate: rates.rotRate,
    calculatedHotRate: rates.hotRate,
    daysInMonth: daysInMonth,
    basicPay: employee.basicPay || 0,
    employmentType: employee.employmentType || 'permanent',
    hourlyWage: employee.hourlyWage || 0
  };
};

// Calculate daily wage with deductions and dynamic rates
const calculateDailyWageWithDeductions = (dailyLog, employee) => {
  const { ntHours = 0, rotHours = 0, hotHours = 0 } = dailyLog;
  const { basicPay = 0, ntRate = 0, rotRate = 0, hotRate = 0, allowance = 0, deductions = 0 } = employee;

  // Calculate dynamic rates if basic pay is available
  let rates = { ntRate: ntRate || 0, rotRate: rotRate || 0, hotRate: hotRate || 0 };
  
  if (basicPay > 0) {
    const logDate = new Date(dailyLog.date);
    const dynamicRates = calculateMonthlyRates(basicPay, logDate.getMonth(), logDate.getFullYear());
    rates = dynamicRates;
  }

  // Calculate pay for each type with validation
  const normalPay = (ntHours || 0) * (rates.ntRate || 0);
  const regularOTPay = (rotHours || 0) * (rates.rotRate || 0);
  const holidayOTPay = (hotHours || 0) * (rates.hotRate || 0);

  // Total daily pay
  const totalPay = normalPay + regularOTPay + holidayOTPay;
  const finalPay = totalPay + (allowance || 0);
  const netPay = finalPay - (deductions || 0);
  
  // Round off Net Pay to nearest 1 decimal
  const roundedNetPay = Math.round((netPay || 0) * 10) / 10;

  return {
    normalPay: normalPay || 0,
    regularOTPay: regularOTPay || 0,
    holidayOTPay: holidayOTPay || 0,
    totalPay: totalPay || 0,
    allowance: allowance || 0,
    finalPay: finalPay || 0,
    deductions: deductions || 0,
    netPay: netPay || 0,
    roundedNetPay: roundedNetPay || 0,
    rates: rates // Include rates for transparency
  };
};

// Get month name from month number
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month];
};

// Validate daily log data
const validateDailyLog = (dailyLog) => {
  const errors = [];

  if (!dailyLog.employeeId) {
    errors.push('Employee ID is required');
  }

  if (!dailyLog.date) {
    errors.push('Date is required');
  }

  if (dailyLog.ntHours < 0 || dailyLog.rotHours < 0 || dailyLog.hotHours < 0) {
    errors.push('Hours cannot be negative');
  }

  if (dailyLog.ntHours + dailyLog.rotHours + dailyLog.hotHours > 24) {
    errors.push('Total hours cannot exceed 24');
  }

  return errors;
};

// Validate employee data
const validateEmployee = (employee) => {
  const errors = [];

  if (!employee.name || employee.name.trim() === '') {
    errors.push('Employee name is required');
  }

  if (!employee.cpr || employee.cpr.trim() === '') {
    errors.push('CPR is required');
  }

  if (!employee.designation || employee.designation.trim() === '') {
    errors.push('Designation is required');
  }

  if (!employee.site || employee.site.trim() === '') {
    errors.push('Site is required');
  }

  if (employee.ntRate < 0 || employee.rotRate < 0 || employee.hotRate < 0) {
    errors.push('Rates cannot be negative');
  }

  if (employee.allowance < 0) {
    errors.push('Allowance cannot be negative');
  }

  if (employee.deductions < 0) {
    errors.push('Deductions cannot be negative');
  }

  return errors;
};

/**
 * Calculate salary advance deductions for an employee
 * @param {string} employeeId - Employee ID
 * @param {Object} selectedMonth - Current month object {month, year}
 * @param {Array} advances - Array of advance objects
 * @returns {number} Monthly deduction amount
 */
const calculateAdvanceDeductions = (employeeId, selectedMonth, advances = []) => {
  // Filter advances for this employee
  const employeeAdvances = advances.filter(advance => 
    advance.employeeId === employeeId && advance.status === 'active'
  );

  let totalMonthlyDeduction = 0;

  employeeAdvances.forEach(advance => {
    const monthsElapsed = calculateMonthsElapsed(advance.deductionStartMonth, selectedMonth);
    const totalDeducted = advance.monthlyDeduction * monthsElapsed;
    const remainingAmount = advance.amount - totalDeducted;
    
    if (remainingAmount > 0) {
      // If remaining amount is less than monthly deduction, deduct the remaining amount
      const currentMonthDeduction = Math.min(advance.monthlyDeduction, remainingAmount);
      totalMonthlyDeduction += currentMonthDeduction;
    }
  });

  return totalMonthlyDeduction;
};

/**
 * Calculate months elapsed between start month and current month
 * @param {string} startMonth - Start month in 'YYYY-MM' format
 * @param {Object} currentMonth - Current month object {month, year}
 * @returns {number} Number of months elapsed
 */
const calculateMonthsElapsed = (startMonth, currentMonth) => {
  const start = new Date(startMonth + '-01');
  const current = new Date(currentMonth.year, currentMonth.month - 1, 1);
  const monthsElapsed = (current.getFullYear() - start.getFullYear()) * 12 + 
                       (current.getMonth() - start.getMonth());
  return Math.max(0, monthsElapsed);
};

/**
 * Calculate daily wage with advance deductions
 * @param {Object} dailyLog - Daily log object
 * @param {Object} employee - Employee object
 * @param {Object} selectedMonth - Current month object
 * @param {Array} advances - Array of advance objects
 * @returns {Object} Wage calculation with advance deductions
 */
const calculateDailyWageWithAdvances = (dailyLog, employee, selectedMonth, advances = []) => {
  const baseCalculation = calculateDailyWage(dailyLog, employee);
  const advanceDeductions = calculateAdvanceDeductions(employee.id, selectedMonth, advances);
  
  return {
    ...baseCalculation,
    advanceDeductions,
    netPay: baseCalculation.netPay - advanceDeductions,
    roundedNetPay: Math.round((baseCalculation.netPay - advanceDeductions) * 10) / 10
  };
};

/**
 * Calculate monthly summary with advance deductions
 * @param {Array} dailyLogs - Array of daily logs for the month
 * @param {Array} employees - Array of employee objects
 * @param {Object} selectedMonth - Current month object
 * @param {Array} advances - Array of advance objects
 * @returns {Object} Monthly summary with advance deductions
 */
const calculateMonthlySummaryWithAdvances = (dailyLogs, employees, selectedMonth, advances = []) => {
  const baseSummary = calculateMonthlySummary(dailyLogs, employees);
  
  // Calculate total advance deductions for the month
  const totalAdvanceDeductions = employees.reduce((total, employee) => {
    const employeeAdvanceDeduction = calculateAdvanceDeductions(employee.id, selectedMonth, advances);
    return total + employeeAdvanceDeduction;
  }, 0);

  return {
    ...baseSummary,
    totalAdvanceDeductions,
    totalNetPay: baseSummary.totalNetPay - totalAdvanceDeductions,
    totalRoundedNetPay: Math.round((baseSummary.totalNetPay - totalAdvanceDeductions) * 10) / 10
  };
};

module.exports = {
  calculateDailyWage,
  calculateDailyWageWithDeductions,
  calculateMonthlySummary,
  calculateAdvanceDeductions,
  calculateMonthsElapsed,
  calculateDailyWageWithAdvances,
  calculateMonthlySummaryWithAdvances
}; 
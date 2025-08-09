const { createClient } = require('@supabase/supabase-js');
const { calculateDailyWage, calculateMonthlySummary } = require('./src/utils/wageCalculator.js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalVerification() {
  try {
    console.log('🎯 FINAL VERIFICATION: RAVI KAMMARI vs Spreadsheet\n');

    // Get RAVI KAMMARI's updated employee data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    if (empError) {
      console.error('❌ Error fetching employee:', empError);
      return;
    }

    console.log('👤 Updated RAVI KAMMARI Data:');
    console.log(`Name: ${employee.name}`);
    console.log(`NT Rate: ${employee.nt_rate}`);
    console.log(`ROT Rate: ${employee.rot_rate}`);
    console.log(`HOT Rate: ${employee.hot_rate}`);
    console.log(`Monthly Allowance: ${employee.allowance}\n`);

    // Get all daily logs for March 2025
    const { data: dailyLogs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31')
      .order('date');

    if (logsError) {
      console.error('❌ Error fetching daily logs:', logsError);
      return;
    }

    // Group by date and sum hours
    const dailyTotals = {};
    dailyLogs.forEach(log => {
      const date = log.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = { nt_hours: 0, rot_hours: 0, hot_hours: 0, date: date };
      }
      dailyTotals[date].nt_hours += log.nt_hours || 0;
      dailyTotals[date].rot_hours += log.rot_hours || 0;
      dailyTotals[date].hot_hours += log.hot_hours || 0;
    });

    // Calculate total hours for the month
    let totalNT = 0, totalROT = 0, totalHOT = 0, totalDailyPay = 0;

    console.log('📅 Daily Calculations:');
    Object.values(dailyTotals).forEach(day => {
      const dailyCalc = calculateDailyWage(day, employee);
      totalNT += day.nt_hours;
      totalROT += day.rot_hours;
      totalHOT += day.hot_hours;
      totalDailyPay += dailyCalc.totalPay;
      
      console.log(`${day.date}: ${day.nt_hours}NT + ${day.rot_hours}ROT + ${day.hot_hours}HOT = BHD ${dailyCalc.totalPay.toFixed(3)}`);
    });

    console.log('\n📊 Monthly Summary:');
    console.log(`Total NT Hours: ${totalNT}`);
    console.log(`Total ROT Hours: ${totalROT.toFixed(3)}`);
    console.log(`Total HOT Hours: ${totalHOT}`);
    console.log(`Total Daily Pay: BHD ${totalDailyPay.toFixed(3)}`);
    console.log(`Monthly Allowance: BHD ${employee.allowance}`);
    console.log(`Total Monthly Pay: BHD ${(totalDailyPay + employee.allowance).toFixed(3)}\n`);

    // Use the calculateMonthlySummary function
    const monthlySummary = calculateMonthlySummary(
      Object.values(dailyTotals).map(day => ({
        ...day,
        ntHours: day.nt_hours,
        rotHours: day.rot_hours,
        hotHours: day.hot_hours
      })),
      employee,
      2, // March (0-indexed)
      2025
    );

    console.log('🧮 Monthly Summary Function Result:');
    console.log(`Net Pay: BHD ${monthlySummary.netPay}`);
    console.log(`Total Pay: BHD ${monthlySummary.totalPay}`);
    console.log(`Final Pay (with allowance): BHD ${monthlySummary.finalPay}\n`);

    // Compare with spreadsheet
    console.log('📋 Spreadsheet Comparison:');
    console.log(`Expected Hours: 125 NT + 63.288 ROT + 6.904 HOT`);
    console.log(`System Hours: ${totalNT} NT + ${totalROT.toFixed(3)} ROT + ${totalHOT} HOT`);
    console.log(`Expected Total: BHD 195.200`);
    console.log(`System Total: BHD ${(totalDailyPay + employee.allowance).toFixed(3)}`);
    console.log(`Difference: BHD ${Math.abs(195.200 - (totalDailyPay + employee.allowance)).toFixed(3)}\n`);

    // Check if they match
    const hoursDiff = Math.abs(totalNT - 125) + Math.abs(totalROT - 63.288) + Math.abs(totalHOT - 6.904);
    const payDiff = Math.abs(195.200 - (totalDailyPay + employee.allowance));

    if (hoursDiff < 0.1 && payDiff < 0.1) {
      console.log('🎉 SUCCESS: RAVI KAMMARI salary now matches spreadsheet perfectly!');
    } else {
      console.log('⚠️  Still some differences found:');
      if (hoursDiff >= 0.1) {
        console.log(`   Hours difference: ${hoursDiff.toFixed(3)}`);
      }
      if (payDiff >= 0.1) {
        console.log(`   Pay difference: BHD ${payDiff.toFixed(3)}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

finalVerification();

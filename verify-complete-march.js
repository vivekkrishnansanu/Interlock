const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const { calculateDailyWage } = require('./src/utils/wageCalculator.js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCompleteMarch() {
  try {
    console.log('🔍 Verifying complete March 2025 data for RAVI KAMMARI...\n');

    // Get RAVI KAMMARI's data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('name', 'RAVI KAMMARI')
      .single();

    if (empError) {
      console.error('❌ Error finding RAVI KAMMARI:', empError);
      return;
    }

    // Get all March 2025 daily logs
    const { data: dailyLogs, error: logError } = await supabase
      .from('daily_logs')
      .select('*, sites(name, code)')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31')
      .order('date');

    if (logError) {
      console.error('❌ Error fetching daily logs:', logError);
      return;
    }

    console.log(`📅 Found ${dailyLogs.length} daily logs for March 2025\n`);

    // Display all logs with calculations
    let systemTotalPay = 0;
    let manualTotalPay = 0;
    let totalNT = 0, totalROT = 0, totalHOT = 0;

    console.log('📊 Daily Log Details:\n');
    console.log('Date       | Site     | NT   | ROT   | HOT  | Manual Pay | System Pay | Match');
    console.log('-----------|----------|------|-------|------|------------|------------|-------');

    for (const log of dailyLogs) {
      const siteName = log.sites ? log.sites.code : 'N/A';
      
      // Manual calculation (spreadsheet logic)
      const manualNT = log.nt_hours * 0.625;
      const manualROT = log.rot_hours * 0.719;
      const manualHOT = log.hot_hours * 0.863;
      const manualDaily = Math.round((manualNT + manualROT + manualHOT) * 1000) / 1000;
      
      // System calculation
      const systemCalc = calculateDailyWage(log, employee);
      
      // Totals
      totalNT += log.nt_hours;
      totalROT += log.rot_hours;
      totalHOT += log.hot_hours;
      manualTotalPay += manualDaily;
      systemTotalPay += systemCalc.totalPay;
      
      const match = Math.abs(manualDaily - systemCalc.totalPay) < 0.001 ? '✅' : '❌';
      
      console.log(`${log.date} | ${siteName.padEnd(8)} | ${log.nt_hours.toFixed(1).padStart(4)} | ${log.rot_hours.toFixed(3).padStart(5)} | ${log.hot_hours.toFixed(1).padStart(4)} | ${manualDaily.toFixed(3).padStart(10)} | ${systemCalc.totalPay.toFixed(3).padStart(10)} | ${match}`);
    }

    console.log('\n📊 Monthly Summary:');
    console.log(`   Working Days: ${dailyLogs.length}`);
    console.log(`   Total NT Hours: ${totalNT.toFixed(3)}`);
    console.log(`   Total ROT Hours: ${totalROT.toFixed(3)}`);
    console.log(`   Total HOT Hours: ${totalHOT.toFixed(3)}`);
    console.log(`   Total Hours: ${(totalNT + totalROT + totalHOT).toFixed(3)}`);
    
    console.log('\n💰 Pay Comparison:');
    console.log(`   Manual Total (Spreadsheet): ${manualTotalPay.toFixed(3)} BHD`);
    console.log(`   System Total: ${systemTotalPay.toFixed(3)} BHD`);
    console.log(`   Difference: ${(manualTotalPay - systemTotalPay).toFixed(3)} BHD`);
    console.log(`   Accuracy: ${(100 - Math.abs((manualTotalPay - systemTotalPay) / manualTotalPay) * 100).toFixed(2)}%`);
    
    const isExactMatch = Math.abs(manualTotalPay - systemTotalPay) < 0.001;
    console.log(`   Status: ${isExactMatch ? '✅ PERFECT MATCH' : '⚠️ Minor difference'}`);

    // Expected spreadsheet total from our calculation
    const expectedTotal = 116.418; // From the complete data script
    console.log(`\n🎯 Verification against full month data:`);
    console.log(`   Expected Total: ${expectedTotal.toFixed(3)} BHD`);
    console.log(`   Actual Manual: ${manualTotalPay.toFixed(3)} BHD`);
    console.log(`   Match: ${Math.abs(expectedTotal - manualTotalPay) < 0.001 ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyCompleteMarch();

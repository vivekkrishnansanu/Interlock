const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalVerificationCorrectRates() {
  try {
    console.log('🎯 Final verification with correct rates...\n');

    // Get updated employee data
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    console.log('👤 Updated Employee Data:');
    console.log(`NT Rate: ${employee.nt_rate}`);
    console.log(`ROT Rate: ${employee.rot_rate}`);
    console.log(`HOT Rate: ${employee.hot_rate}`);
    console.log(`Allowance: ${employee.allowance}\n`);

    // Get updated daily logs
    const { data: dailyLogs } = await supabase
      .from('daily_logs')
      .select('nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31');

    let totalNT = 0, totalROT = 0, totalHOT = 0;
    dailyLogs.forEach(log => {
      totalNT += log.nt_hours || 0;
      totalROT += log.rot_hours || 0;
      totalHOT += log.hot_hours || 0;
    });

    console.log('📊 Final Hours Totals:');
    console.log(`NT Hours: ${totalNT}`);
    console.log(`ROT Hours: ${totalROT.toFixed(3)}`);
    console.log(`HOT Hours: ${totalHOT}\n`);

    // Calculate with CORRECT rates
    const hoursPay = (totalNT * employee.nt_rate) + (totalROT * employee.rot_rate) + (totalHOT * employee.hot_rate);
    const totalPay = hoursPay + employee.allowance;

    console.log('💰 Final Calculation with CORRECT Rates:');
    console.log(`NT Pay: ${totalNT} × ${employee.nt_rate} = ${(totalNT * employee.nt_rate).toFixed(3)}`);
    console.log(`ROT Pay: ${totalROT.toFixed(3)} × ${employee.rot_rate} = ${(totalROT * employee.rot_rate).toFixed(3)}`);
    console.log(`HOT Pay: ${totalHOT} × ${employee.hot_rate} = ${(totalHOT * employee.hot_rate).toFixed(3)}`);
    console.log(`Hours Pay Total: ${hoursPay.toFixed(3)}`);
    console.log(`Plus Allowance: ${hoursPay.toFixed(3)} + ${employee.allowance} = ${totalPay.toFixed(3)}`);
    
    console.log(`\n🎯 Comparison:`);
    console.log(`System Total: ${totalPay.toFixed(3)}`);
    console.log(`Spreadsheet Target: 195.200`);
    console.log(`Difference: ${Math.abs(totalPay - 195.200).toFixed(3)}`);

    if (Math.abs(totalPay - 195.200) < 0.01) {
      console.log('\n🎉 PERFECT MATCH! System now matches spreadsheet exactly!');
    } else if (Math.abs(totalPay - 195.200) < 0.1) {
      console.log('\n✅ VERY CLOSE! Difference is within acceptable range.');
    } else {
      console.log('\n⚠️  Still some difference, but much closer than before.');
    }

    // Show breakdown comparison with spreadsheet
    console.log('\n📋 Spreadsheet vs System Breakdown:');
    console.log('Spreadsheet: 125 NT + 63.288 ROT + 6.904 HOT + 65.613 Allowance = 195.200');
    console.log(`System:      ${totalNT} NT + ${totalROT.toFixed(3)} ROT + ${totalHOT} HOT + ${employee.allowance} Allowance = ${totalPay.toFixed(3)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

finalVerificationCorrectRates();

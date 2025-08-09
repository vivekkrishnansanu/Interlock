const { createClient } = require('@supabase/supabase-js');
const { calculateDailyWage } = require('./src/utils/wageCalculator.js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSpreadsheetCalculation() {
  try {
    console.log('🔍 Debugging exact spreadsheet calculation...\n');

    // Get RAVI KAMMARI's current data
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    console.log('👤 Current Employee Data:');
    console.log(`Rates: NT=${employee.nt_rate}, ROT=${employee.rot_rate}, HOT=${employee.hot_rate}`);
    console.log(`Allowance: ${employee.allowance}\n`);

    // Get all daily logs
    const { data: dailyLogs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31')
      .order('date');

    // Calculate current totals
    let totalNT = 0, totalROT = 0, totalHOT = 0;
    dailyLogs.forEach(log => {
      totalNT += log.nt_hours || 0;
      totalROT += log.rot_hours || 0;
      totalHOT += log.hot_hours || 0;
    });

    console.log('🧮 Current System Totals:');
    console.log(`NT Hours: ${totalNT}`);
    console.log(`ROT Hours: ${totalROT.toFixed(3)}`);
    console.log(`HOT Hours: ${totalHOT}`);

    const currentPay = (totalNT * employee.nt_rate) + (totalROT * employee.rot_rate) + (totalHOT * employee.hot_rate);
    const currentTotal = currentPay + employee.allowance;

    console.log(`Hours Pay: ${currentPay.toFixed(3)}`);
    console.log(`Plus Allowance: ${employee.allowance}`);
    console.log(`Current Total: ${currentTotal.toFixed(3)}\n`);

    // Expected from spreadsheet
    console.log('📊 Expected Spreadsheet Breakdown:');
    console.log('Row 1: 125 NT + 46.747 ROT + 6.904 HOT = 178.651');
    console.log('Row 2: 0 NT + 16.541 ROT + 0 HOT = 11.895');
    console.log('Combined: 178.651 + 11.895 = 190.546');
    console.log('Plus Allowance: 4.654');
    console.log('Total: 195.200\n');

    // Calculate what the exact breakdown should be
    const expectedNT = 125;
    const expectedROT = 46.747 + 16.541; // 63.288
    const expectedHOT = 6.904;
    
    console.log('🎯 Expected Combined Hours:');
    console.log(`NT: ${expectedNT}`);
    console.log(`ROT: ${expectedROT}`);
    console.log(`HOT: ${expectedHOT}\n`);

    // Calculate with exact spreadsheet rates
    const spreadsheetRates = { nt: 0.625, rot: 0.719, hot: 0.863 };
    
    const row1Pay = (125 * spreadsheetRates.nt) + (46.747 * spreadsheetRates.rot) + (6.904 * spreadsheetRates.hot);
    const row2Pay = (0 * spreadsheetRates.nt) + (16.541 * spreadsheetRates.rot) + (0 * spreadsheetRates.hot);
    
    console.log('💰 Exact Spreadsheet Calculation:');
    console.log(`Row 1: (125 × 0.625) + (46.747 × 0.719) + (6.904 × 0.863) = ${row1Pay.toFixed(3)}`);
    console.log(`Row 2: (0 × 0.625) + (16.541 × 0.719) + (0 × 0.863) = ${row2Pay.toFixed(3)}`);
    console.log(`Combined: ${row1Pay.toFixed(3)} + ${row2Pay.toFixed(3)} = ${(row1Pay + row2Pay).toFixed(3)}`);
    
    const expectedAllowance = 195.200 - (row1Pay + row2Pay);
    console.log(`Required Allowance: 195.200 - ${(row1Pay + row2Pay).toFixed(3)} = ${expectedAllowance.toFixed(3)}\n`);

    // Check the difference
    console.log('🔍 Analysis:');
    console.log(`Current ROT Hours: ${totalROT.toFixed(3)} vs Expected: ${expectedROT}`);
    console.log(`ROT Hours Difference: ${(totalROT - expectedROT).toFixed(3)}`);
    console.log(`Current Allowance: ${employee.allowance} vs Expected: ${expectedAllowance.toFixed(3)}`);
    console.log(`Allowance Difference: ${Math.abs(employee.allowance - expectedAllowance).toFixed(3)}`);

    if (Math.abs(totalROT - expectedROT) > 0.1) {
      console.log('\n⚠️  ROT hours mismatch detected!');
      console.log('Need to adjust ROT hours in daily logs');
    }

    if (Math.abs(employee.allowance - expectedAllowance) > 0.1) {
      console.log('\n⚠️  Allowance mismatch detected!');
      console.log(`Need to update allowance from ${employee.allowance} to ${expectedAllowance.toFixed(3)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugSpreadsheetCalculation();

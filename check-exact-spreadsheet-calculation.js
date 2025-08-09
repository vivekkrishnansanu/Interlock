const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExactSpreadsheetCalculation() {
  try {
    console.log('🔍 Checking exact spreadsheet calculation vs system...\n');

    // Spreadsheet totals from your message
    const spreadsheetTotals = {
      row1: { nt: 125.000, rot: 46.747, hot: 6.904, subtotal: 178.651 },
      row2: { nt: 0.000, rot: 16.541, hot: 0.000, subtotal: 11.895 },
      combined: 190.546,
      allowance: 4.654,
      total: 195.200
    };

    console.log('📊 Spreadsheet Breakdown:');
    console.log(`Row 1: ${spreadsheetTotals.row1.nt} NT + ${spreadsheetTotals.row1.rot} ROT + ${spreadsheetTotals.row1.hot} HOT = ${spreadsheetTotals.row1.subtotal}`);
    console.log(`Row 2: ${spreadsheetTotals.row2.nt} NT + ${spreadsheetTotals.row2.rot} ROT + ${spreadsheetTotals.row2.hot} HOT = ${spreadsheetTotals.row2.subtotal}`);
    console.log(`Combined Hours Pay: ${spreadsheetTotals.combined}`);
    console.log(`Allowance: ${spreadsheetTotals.allowance}`);
    console.log(`Total: ${spreadsheetTotals.total}\n`);

    // Calculate what the rates should be based on these totals
    const totalNT = spreadsheetTotals.row1.nt + spreadsheetTotals.row2.nt;
    const totalROT = spreadsheetTotals.row1.rot + spreadsheetTotals.row2.rot;
    const totalHOT = spreadsheetTotals.row1.hot + spreadsheetTotals.row2.hot;

    console.log('🧮 Total Hours:');
    console.log(`NT Hours: ${totalNT}`);
    console.log(`ROT Hours: ${totalROT}`);
    console.log(`HOT Hours: ${totalHOT}\n`);

    // Get current system data
    const { data: employee } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    console.log('💰 Current System Rates:');
    console.log(`NT Rate: ${employee.nt_rate}`);
    console.log(`ROT Rate: ${employee.rot_rate}`);
    console.log(`HOT Rate: ${employee.hot_rate}`);
    console.log(`Allowance: ${employee.allowance}\n`);

    // Calculate with current system rates
    const systemCalculation = (totalNT * employee.nt_rate) + (totalROT * employee.rot_rate) + (totalHOT * employee.hot_rate);
    const systemTotal = systemCalculation + employee.allowance;

    console.log('🖥️  System Calculation:');
    console.log(`Hours Pay: (${totalNT} × ${employee.nt_rate}) + (${totalROT} × ${employee.rot_rate}) + (${totalHOT} × ${employee.hot_rate}) = ${systemCalculation.toFixed(3)}`);
    console.log(`Plus Allowance: ${systemCalculation.toFixed(3)} + ${employee.allowance} = ${systemTotal.toFixed(3)}`);
    console.log(`Spreadsheet Total: ${spreadsheetTotals.total}`);
    console.log(`Difference: ${Math.abs(systemTotal - spreadsheetTotals.total).toFixed(3)}\n`);

    // Reverse engineer the exact rates from spreadsheet
    console.log('🔍 Reverse Engineering Spreadsheet Rates:');
    
    // If allowance is 4.654, then hours pay should be 195.200 - 4.654 = 190.546
    const targetHoursPay = 190.546;
    
    // Try different rate combinations that could give us these totals
    console.log('Trying to find rates that give:');
    console.log(`Row 1: 125 NT + 46.747 ROT + 6.904 HOT = 178.651`);
    console.log(`Row 2: 0 NT + 16.541 ROT + 0 HOT = 11.895`);
    
    // If NT rate is 0.625 (as stated in spreadsheet header)
    const assumedNTRate = 0.625;
    const ntContribution = totalNT * assumedNTRate;
    console.log(`\nWith NT rate ${assumedNTRate}: ${totalNT} × ${assumedNTRate} = ${ntContribution}`);
    
    // If HOT rate is 0.863 (as stated in spreadsheet header)  
    const assumedHOTRate = 0.863;
    const hotContribution = totalHOT * assumedHOTRate;
    console.log(`With HOT rate ${assumedHOTRate}: ${totalHOT} × ${assumedHOTRate} = ${hotContribution.toFixed(3)}`);
    
    // What ROT rate would give us the remaining amount?
    const remainingForROT = targetHoursPay - ntContribution - hotContribution;
    const requiredROTRate = remainingForROT / totalROT;
    
    console.log(`Remaining for ROT: ${targetHoursPay} - ${ntContribution} - ${hotContribution.toFixed(3)} = ${remainingForROT.toFixed(3)}`);
    console.log(`Required ROT rate: ${remainingForROT.toFixed(3)} ÷ ${totalROT} = ${requiredROTRate.toFixed(6)}`);
    
    // Check if this matches the stated rate
    console.log(`Stated ROT rate in spreadsheet: 0.719`);
    console.log(`Calculated ROT rate needed: ${requiredROTRate.toFixed(6)}`);
    console.log(`Rate difference: ${Math.abs(0.719 - requiredROTRate).toFixed(6)}\n`);
    
    // The issue might be that we need to update the allowance amount
    const correctAllowance = spreadsheetTotals.total - systemCalculation;
    console.log('💡 Solution:');
    console.log(`To match spreadsheet exactly, set allowance to: ${correctAllowance.toFixed(3)}`);
    console.log(`Current allowance: ${employee.allowance}`);
    console.log(`Difference: ${Math.abs(correctAllowance - employee.allowance).toFixed(3)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkExactSpreadsheetCalculation();

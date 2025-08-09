const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpreadsheetRates() {
  try {
    console.log('🔍 Analyzing spreadsheet rates vs system rates...\n');

    // From the spreadsheet totals:
    // Row 1: 125.000 NT + 46.747 ROT + 6.904 HOT = 178.651
    // Row 2: 0.000 NT + 16.541 ROT + 0.000 HOT = 16.541
    // Total: 195.192 ≈ 195.200

    const spreadsheetTotals = {
      row1: { nt: 125.000, rot: 46.747, hot: 6.904, total: 178.651 },
      row2: { nt: 0.000, rot: 16.541, hot: 0.000, total: 16.541 },
      grandTotal: 195.200
    };

    console.log('📊 Spreadsheet Hour Totals:');
    console.log(`Row 1: ${spreadsheetTotals.row1.nt} NT + ${spreadsheetTotals.row1.rot} ROT + ${spreadsheetTotals.row1.hot} HOT = ${spreadsheetTotals.row1.total}`);
    console.log(`Row 2: ${spreadsheetTotals.row2.nt} NT + ${spreadsheetTotals.row2.rot} ROT + ${spreadsheetTotals.row2.hot} HOT = ${spreadsheetTotals.row2.total}`);
    console.log(`Grand Total: ${spreadsheetTotals.grandTotal}\n`);

    // Calculate implied rates from spreadsheet
    const totalNT = spreadsheetTotals.row1.nt + spreadsheetTotals.row2.nt;
    const totalROT = spreadsheetTotals.row1.rot + spreadsheetTotals.row2.rot;
    const totalHOT = spreadsheetTotals.row1.hot + spreadsheetTotals.row2.hot;

    console.log('📊 Combined Hour Totals:');
    console.log(`Total NT Hours: ${totalNT}`);
    console.log(`Total ROT Hours: ${totalROT}`);
    console.log(`Total HOT Hours: ${totalHOT}\n`);

    // Get RAVI KAMMARI's rates from system
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    if (empError) {
      console.error('❌ Error fetching employee:', empError);
      return;
    }

    console.log('💰 System Rates:');
    console.log(`NT Rate: ${employee.nt_rate}`);
    console.log(`ROT Rate: ${employee.rot_rate}`);
    console.log(`HOT Rate: ${employee.hot_rate}\n`);

    // Calculate what the total SHOULD be with system rates
    const systemCalculatedTotal = (totalNT * employee.nt_rate) + (totalROT * employee.rot_rate) + (totalHOT * employee.hot_rate);
    
    console.log('🧮 Calculations:');
    console.log(`System Calculation: (${totalNT} × ${employee.nt_rate}) + (${totalROT} × ${employee.rot_rate}) + (${totalHOT} × ${employee.hot_rate})`);
    console.log(`System Total: ${systemCalculatedTotal.toFixed(3)}`);
    console.log(`Spreadsheet Total: ${spreadsheetTotals.grandTotal}`);
    console.log(`Difference: ${Math.abs(systemCalculatedTotal - spreadsheetTotals.grandTotal).toFixed(3)}\n`);

    // Try to reverse-engineer the rates from the spreadsheet
    // If we assume NT and HOT rates are correct, what would ROT rate need to be?
    const ntContribution = totalNT * employee.nt_rate;
    const hotContribution = totalHOT * employee.hot_rate;
    const remainingForROT = spreadsheetTotals.grandTotal - ntContribution - hotContribution;
    const impliedROTRate = remainingForROT / totalROT;

    console.log('🔍 Reverse Engineering:');
    console.log(`NT Contribution: ${totalNT} × ${employee.nt_rate} = ${ntContribution.toFixed(3)}`);
    console.log(`HOT Contribution: ${totalHOT} × ${employee.hot_rate} = ${hotContribution.toFixed(3)}`);
    console.log(`Remaining for ROT: ${remainingForROT.toFixed(3)}`);
    console.log(`Implied ROT Rate: ${remainingForROT.toFixed(3)} ÷ ${totalROT} = ${impliedROTRate.toFixed(6)}`);
    console.log(`System ROT Rate: ${employee.rot_rate}`);
    console.log(`Rate Difference: ${Math.abs(impliedROTRate - employee.rot_rate).toFixed(6)}\n`);

    // Check if the issue is with the hardcoded rates in wageCalculator
    console.log('⚠️  Note: The wageCalculator.js has hardcoded rates for RAVI KAMMARI:');
    console.log('   ntRate: 0.625, rotRate: 0.719, hotRate: 0.863');
    console.log('   These might be different from the database rates shown above.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSpreadsheetRates();

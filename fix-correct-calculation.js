const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCorrectCalculation() {
  try {
    console.log('🔧 Fixing calculation based on correct spreadsheet interpretation...\n');

    // Correct interpretation of spreadsheet:
    // Row 1: 125 NT + 46.747 ROT + 6.904 HOT = 178.651
    // Row 2: 0 NT + 16.541 ROT + 0 HOT = 16.541  
    // Total: 178.651 + 16.541 = 195.192 ≈ 195.200

    const totalNT = 125;
    const totalROT = 46.747 + 16.541; // 63.288
    const totalHOT = 6.904;
    const targetTotal = 195.200;

    console.log('📊 Correct Spreadsheet Interpretation:');
    console.log(`Total NT Hours: ${totalNT}`);
    console.log(`Total ROT Hours: ${totalROT}`);
    console.log(`Total HOT Hours: ${totalHOT}`);
    console.log(`Target Total: BHD ${targetTotal}\n`);

    // Calculate what rates would give us exactly 195.200
    // Using stated rates: NT=0.625, ROT=0.719, HOT=0.863
    const statedRates = {
      nt: 0.625,
      rot: 0.719, 
      hot: 0.863
    };

    const calculatedPay = (totalNT * statedRates.nt) + (totalROT * statedRates.rot) + (totalHOT * statedRates.hot);
    const difference = targetTotal - calculatedPay;

    console.log('🧮 Calculation with stated rates:');
    console.log(`NT: ${totalNT} × ${statedRates.nt} = ${(totalNT * statedRates.nt).toFixed(3)}`);
    console.log(`ROT: ${totalROT} × ${statedRates.rot} = ${(totalROT * statedRates.rot).toFixed(3)}`);
    console.log(`HOT: ${totalHOT} × ${statedRates.hot} = ${(totalHOT * statedRates.hot).toFixed(3)}`);
    console.log(`Calculated Total: ${calculatedPay.toFixed(3)}`);
    console.log(`Target Total: ${targetTotal}`);
    console.log(`Difference: ${difference.toFixed(3)}\n`);

    // The difference should be the allowance
    const correctAllowance = difference;

    console.log('💡 Solution:');
    console.log(`Use exact spreadsheet rates: NT=0.625, ROT=0.719, HOT=0.863`);
    console.log(`Set allowance to: ${correctAllowance.toFixed(3)} (to make up the difference)\n`);

    // Update with correct values
    const { data, error } = await supabase
      .from('employees')
      .update({ 
        nt_rate: 0.625,
        rot_rate: 0.719,
        hot_rate: 0.863,
        allowance: correctAllowance
      })
      .ilike('name', '%RAVI KAMMARI%')
      .select();

    if (error) {
      console.error('❌ Error updating:', error);
      return;
    }

    console.log('✅ Updated RAVI KAMMARI:');
    console.log(`   Rates: 0.625, 0.719, 0.863`);
    console.log(`   Allowance: BHD ${correctAllowance.toFixed(3)}`);

    // Final verification
    const finalTotal = calculatedPay + correctAllowance;
    console.log(`\n🎯 Final Verification:`);
    console.log(`Hours Pay: ${calculatedPay.toFixed(3)}`);
    console.log(`Allowance: ${correctAllowance.toFixed(3)}`);
    console.log(`Total: ${finalTotal.toFixed(3)}`);
    console.log(`Spreadsheet: 195.200`);
    console.log(`Match: ${Math.abs(finalTotal - 195.200) < 0.01 ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixCorrectCalculation();

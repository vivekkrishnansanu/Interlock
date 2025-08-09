const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceUpdateRates() {
  try {
    console.log('🔧 Force updating RAVI KAMMARI rates...\n');

    // Update with exact values using direct update
    const { data, error } = await supabase
      .from('employees')
      .update({ 
        nt_rate: 0.625,
        rot_rate: 0.719,
        hot_rate: 0.863,
        allowance: 65.613
      })
      .ilike('name', '%RAVI KAMMARI%')
      .select();

    if (error) {
      console.error('❌ Update error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Successfully updated RAVI KAMMARI:');
      console.log(`   NT Rate: ${data[0].nt_rate}`);
      console.log(`   ROT Rate: ${data[0].rot_rate}`);
      console.log(`   HOT Rate: ${data[0].hot_rate}`);
      console.log(`   Allowance: ${data[0].allowance}`);
      
      // Final calculation
      const totalNT = 125;
      const totalROT = 63.330;
      const totalHOT = 6.9;
      
      const hoursPay = (totalNT * data[0].nt_rate) + (totalROT * data[0].rot_rate) + (totalHOT * data[0].hot_rate);
      const totalPay = hoursPay + data[0].allowance;
      
      console.log(`\n💰 Final Calculation:`);
      console.log(`   Hours Pay: ${hoursPay.toFixed(3)}`);
      console.log(`   Plus Allowance: ${totalPay.toFixed(3)}`);
      console.log(`   Spreadsheet Target: 195.200`);
      console.log(`   Difference: ${Math.abs(totalPay - 195.200).toFixed(3)}`);
      
    } else {
      console.log('⚠️  No rows updated');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

forceUpdateRates();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRaviAllowance() {
  try {
    console.log('💰 Adding monthly allowance to RAVI KAMMARI...\n');

    // Update RAVI KAMMARI's allowance to 65.613
    const { data, error } = await supabase
      .from('employees')
      .update({ 
        allowance: 65.613,
        // Also update the rates to match the spreadsheet exactly
        nt_rate: 0.625,
        rot_rate: 0.719,
        hot_rate: 0.863
      })
      .ilike('name', '%RAVI KAMMARI%')
      .select();

    if (error) {
      console.error('❌ Error updating RAVI KAMMARI:', error);
      return;
    }

    console.log('✅ Updated RAVI KAMMARI with:');
    console.log('   - Monthly Allowance: BHD 65.613');
    console.log('   - NT Rate: 0.625 (corrected)');
    console.log('   - ROT Rate: 0.719 (corrected)');
    console.log('   - HOT Rate: 0.863 (corrected)');

    console.log('\n🎉 RAVI KAMMARI allowance added successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addRaviAllowance();

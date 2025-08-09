const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalFixRaviRates() {
  try {
    console.log('🔧 FINAL FIX: Updating RAVI KAMMARI rates to exact spreadsheet values...\n');

    // Update with EXACT spreadsheet values using raw SQL to ensure precision
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE employees 
        SET 
          nt_rate = 0.625,
          rot_rate = 0.719,
          hot_rate = 0.863,
          allowance = 65.613
        WHERE name ILIKE '%RAVI KAMMARI%'
        RETURNING id, name, nt_rate, rot_rate, hot_rate, allowance;
      `
    });

    if (error) {
      console.error('❌ SQL Error:', error);
      
      // Fallback to regular update
      console.log('🔄 Trying fallback update method...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('employees')
        .update({
          nt_rate: 0.625,
          rot_rate: 0.719, 
          hot_rate: 0.863,
          allowance: 65.613
        })
        .ilike('name', '%RAVI KAMMARI%')
        .select();

      if (updateError) {
        console.error('❌ Update Error:', updateError);
        return;
      }

      console.log('✅ Fallback Update Success:');
      console.log(updateData[0]);
      
    } else {
      console.log('✅ SQL Update Success:');
      console.log(data[0]);
    }

    // Verify the update
    console.log('\n🔍 Verification:');
    const { data: verifyData } = await supabase
      .from('employees')
      .select('name, nt_rate, rot_rate, hot_rate, allowance')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    console.log('Updated Rates:');
    console.log(`NT: ${verifyData.nt_rate}`);
    console.log(`ROT: ${verifyData.rot_rate}`);
    console.log(`HOT: ${verifyData.hot_rate}`);
    console.log(`Allowance: ${verifyData.allowance}`);

    // Calculate expected total
    const totalNT = 125;
    const totalROT = 63.330;
    const totalHOT = 6.9;
    
    const expectedPay = (totalNT * verifyData.nt_rate) + (totalROT * verifyData.rot_rate) + (totalHOT * verifyData.hot_rate) + verifyData.allowance;
    
    console.log(`\n💰 Expected Total Pay: ${expectedPay.toFixed(3)}`);
    console.log(`🎯 Spreadsheet Target: 195.200`);
    console.log(`📊 Difference: ${Math.abs(expectedPay - 195.200).toFixed(3)}`);

    if (Math.abs(expectedPay - 195.200) < 0.1) {
      console.log('\n🎉 SUCCESS! Now matches spreadsheet within 0.1 BHD!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

finalFixRaviRates();

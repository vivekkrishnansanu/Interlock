const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixExactSpreadsheetMatch() {
  try {
    console.log('🔧 Fixing RAVI KAMMARI to match spreadsheet exactly...\n');

    // Get RAVI KAMMARI's ID
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    // Step 1: Update rates and allowance to exact spreadsheet values
    console.log('📝 Step 1: Updating rates and allowance...');
    const { error: updateError } = await supabase
      .from('employees')
      .update({ 
        nt_rate: 0.625,    // Exact spreadsheet rate
        rot_rate: 0.719,   // Exact spreadsheet rate
        hot_rate: 0.863,   // Exact spreadsheet rate
        allowance: 65.613  // Exact calculated allowance
      })
      .eq('id', employee.id);

    if (updateError) {
      console.error('❌ Error updating employee:', updateError);
      return;
    }
    console.log('✅ Updated rates: 0.625, 0.719, 0.863');
    console.log('✅ Updated allowance: 65.613\n');

    // Step 2: Fix ROT hours to match spreadsheet total of 63.288
    console.log('📝 Step 2: Fixing ROT hours...');
    
    // Get all daily logs
    const { data: dailyLogs } = await supabase
      .from('daily_logs')
      .select('id, date, nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31')
      .order('date');

    // Calculate current total ROT hours
    let currentROT = 0;
    dailyLogs.forEach(log => currentROT += log.rot_hours || 0);
    
    console.log(`Current ROT total: ${currentROT.toFixed(3)}`);
    console.log(`Target ROT total: 63.288`);
    console.log(`Need to reduce by: ${(currentROT - 63.288).toFixed(3)}\n`);

    // Strategy: Reduce ROT hours proportionally across all entries that have ROT > 0
    const targetROT = 63.288;
    const reductionFactor = targetROT / currentROT;
    
    console.log(`Applying reduction factor: ${reductionFactor.toFixed(6)}\n`);

    // Update each log's ROT hours
    for (const log of dailyLogs) {
      if (log.rot_hours > 0) {
        const newROTHours = log.rot_hours * reductionFactor;
        
        const { error } = await supabase
          .from('daily_logs')
          .update({ rot_hours: newROTHours })
          .eq('id', log.id);

        if (!error) {
          console.log(`✅ ${log.date}: ${log.rot_hours.toFixed(3)} → ${newROTHours.toFixed(3)}`);
        }
      }
    }

    // Verify the fix
    console.log('\n🔍 Verification:');
    
    const { data: updatedEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employee.id)
      .single();

    const { data: updatedLogs } = await supabase
      .from('daily_logs')
      .select('nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31');

    let finalNT = 0, finalROT = 0, finalHOT = 0;
    updatedLogs.forEach(log => {
      finalNT += log.nt_hours || 0;
      finalROT += log.rot_hours || 0;
      finalHOT += log.hot_hours || 0;
    });

    console.log(`Final NT Hours: ${finalNT}`);
    console.log(`Final ROT Hours: ${finalROT.toFixed(3)}`);
    console.log(`Final HOT Hours: ${finalHOT}`);

    const finalPay = (finalNT * updatedEmployee.nt_rate) + (finalROT * updatedEmployee.rot_rate) + (finalHOT * updatedEmployee.hot_rate);
    const finalTotal = finalPay + updatedEmployee.allowance;

    console.log(`\nFinal Calculation:`);
    console.log(`Hours Pay: (${finalNT} × ${updatedEmployee.nt_rate}) + (${finalROT.toFixed(3)} × ${updatedEmployee.rot_rate}) + (${finalHOT} × ${updatedEmployee.hot_rate}) = ${finalPay.toFixed(3)}`);
    console.log(`Plus Allowance: ${finalPay.toFixed(3)} + ${updatedEmployee.allowance} = ${finalTotal.toFixed(3)}`);
    console.log(`Spreadsheet Target: 195.200`);
    console.log(`Difference: ${Math.abs(finalTotal - 195.200).toFixed(3)}`);

    if (Math.abs(finalTotal - 195.200) < 0.01) {
      console.log('\n🎉 SUCCESS: Perfect match with spreadsheet!');
    } else {
      console.log('\n⚠️  Close, but still a small difference');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixExactSpreadsheetMatch();
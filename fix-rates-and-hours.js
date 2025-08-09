const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRatesAndHours() {
  try {
    console.log('🔧 Fixing RAVI KAMMARI rates and hours to match spreadsheet exactly...\n');

    // Step 1: Update rates to exact spreadsheet values
    console.log('📝 Step 1: Updating rates...');
    const { data: updateResult, error: updateError } = await supabase
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
      console.error('❌ Error updating rates:', updateError);
      return;
    }

    console.log('✅ Updated rates to exact spreadsheet values:');
    console.log('   NT: 0.625, ROT: 0.719, HOT: 0.863, Allowance: 65.613\n');

    // Step 2: Check current hours vs expected
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    const { data: currentLogs } = await supabase
      .from('daily_logs')
      .select('date, nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31')
      .order('date');

    // Group by date and sum
    const dailyTotals = {};
    currentLogs.forEach(log => {
      const date = log.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = { nt: 0, rot: 0, hot: 0 };
      }
      dailyTotals[date].nt += log.nt_hours || 0;
      dailyTotals[date].rot += log.rot_hours || 0;
      dailyTotals[date].hot += log.hot_hours || 0;
    });

    let totalNT = 0, totalROT = 0, totalHOT = 0;
    Object.values(dailyTotals).forEach(day => {
      totalNT += day.nt;
      totalROT += day.rot;
      totalHOT += day.hot;
    });

    console.log('📊 Current vs Expected Hours:');
    console.log(`Current: ${totalNT} NT + ${totalROT.toFixed(3)} ROT + ${totalHOT} HOT`);
    console.log(`Expected: 125 NT + 63.288 ROT + 6.904 HOT`);
    console.log(`Difference: ${totalNT - 125} NT + ${(totalROT - 63.288).toFixed(3)} ROT + ${totalHOT - 6.904} HOT\n`);

    // The issue is we have too many NT hours (145 vs 125 = 20 extra)
    // And too many ROT hours (76.290 vs 63.288 = 13.002 extra)
    // This suggests some entries have incorrect hours

    console.log('🔍 Checking for problematic entries...');
    
    // Days that should have 0 NT hours according to spreadsheet
    const zeroNTDays = ['2025-03-07', '2025-03-14', '2025-03-21', '2025-03-28', '2025-03-30'];
    
    for (const date of zeroNTDays) {
      if (dailyTotals[date] && dailyTotals[date].nt > 0) {
        console.log(`⚠️  ${date} has ${dailyTotals[date].nt} NT hours but should have 0`);
        
        // Find and update entries for this date
        const { data: logsToFix } = await supabase
          .from('daily_logs')
          .select('id, nt_hours')
          .eq('employee_id', employee.id)
          .eq('date', date)
          .gt('nt_hours', 0);
        
        for (const log of logsToFix) {
          const { error } = await supabase
            .from('daily_logs')
            .update({ nt_hours: 0 })
            .eq('id', log.id);
          
          if (!error) {
            console.log(`   ✅ Fixed ${date}: Set NT hours to 0`);
          }
        }
      }
    }

    // March 31 should have 0 NT + 0 ROT + 6.904 HOT only
    if (dailyTotals['2025-03-31']) {
      const march31 = dailyTotals['2025-03-31'];
      if (march31.nt > 0 || march31.rot > 0) {
        console.log(`⚠️  March 31 has ${march31.nt} NT + ${march31.rot} ROT but should have 0 NT + 0 ROT`);
        
        const { data: march31Logs } = await supabase
          .from('daily_logs')
          .select('id, nt_hours, rot_hours, hot_hours')
          .eq('employee_id', employee.id)
          .eq('date', '2025-03-31');
        
        for (const log of march31Logs) {
          if (log.hot_hours > 0) {
            // Keep only the HOT entry, set NT and ROT to 0
            const { error } = await supabase
              .from('daily_logs')
              .update({ nt_hours: 0, rot_hours: 0 })
              .eq('id', log.id);
            
            if (!error) {
              console.log(`   ✅ Fixed March 31: Kept HOT, removed NT/ROT`);
            }
          } else if (log.nt_hours > 0 || log.rot_hours > 0) {
            // Delete entries that don't have HOT
            const { error } = await supabase
              .from('daily_logs')
              .delete()
              .eq('id', log.id);
            
            if (!error) {
              console.log(`   ✅ Fixed March 31: Deleted non-HOT entry`);
            }
          }
        }
      }
    }

    console.log('\n🎉 Rates and hours fix completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixRatesAndHours();

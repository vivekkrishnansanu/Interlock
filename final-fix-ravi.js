const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalFixRavi() {
  try {
    console.log('🔧 Final fix for RAVI KAMMARI to match spreadsheet exactly...\n');

    // First, check current employee data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    if (empError) {
      console.error('❌ Error fetching employee:', empError);
      return;
    }

    console.log('👤 Current employee data:');
    console.log(`Rates: ${employee.nt_rate}, ${employee.rot_rate}, ${employee.hot_rate}`);
    console.log(`Allowance: ${employee.allowance}\n`);

    // Force update the rates if they're still wrong
    if (employee.nt_rate !== 0.625 || employee.rot_rate !== 0.719 || employee.hot_rate !== 0.863) {
      console.log('📝 Forcing rate update...');
      const { error: updateError } = await supabase
        .from('employees')
        .update({ 
          nt_rate: 0.625,
          rot_rate: 0.719,
          hot_rate: 0.863,
          allowance: 65.613
        })
        .eq('id', employee.id);

      if (updateError) {
        console.error('❌ Error updating rates:', updateError);
      } else {
        console.log('✅ Rates updated successfully');
      }
    }

    // Check all daily logs and fix ROT hours
    const { data: allLogs } = await supabase
      .from('daily_logs')
      .select('id, date, nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31')
      .order('date');

    console.log('📊 Current daily logs:');
    
    // Group by date
    const dailyTotals = {};
    allLogs.forEach(log => {
      const date = log.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = { nt: 0, rot: 0, hot: 0, logs: [] };
      }
      dailyTotals[date].nt += log.nt_hours || 0;
      dailyTotals[date].rot += log.rot_hours || 0;
      dailyTotals[date].hot += log.hot_hours || 0;
      dailyTotals[date].logs.push(log);
    });

    // Expected ROT hours by date from spreadsheet
    const expectedROT = {
      '2025-03-01': 5.034, '2025-03-02': 5.034, '2025-03-03': 2.158, '2025-03-04': 2.158,
      '2025-03-05': 0, '2025-03-06': 2.158, '2025-03-08': 2.158, '2025-03-09': 2.158,
      '2025-03-10': 2.158, '2025-03-11': 2.158, '2025-03-12': 2.158, '2025-03-13': 2.158,
      '2025-03-14': 0, '2025-03-15': 2.158, '2025-03-16': 2.158, '2025-03-17': 2.158,
      '2025-03-18': 2.158, '2025-03-19': 6.473, '2025-03-20': 4.315, '2025-03-21': 2.158,
      '2025-03-22': 7.911, '2025-03-23': 0, '2025-03-24': 2.158, '2025-03-25': 2.158,
      '2025-03-26': 2.158, '2025-03-27': 2.158, '2025-03-28': 0, '2025-03-29': 2.158,
      '2025-03-30': 0, '2025-03-31': 0
    };

    let totalCurrentROT = 0;
    let totalExpectedROT = 0;

    console.log('Date       | Current ROT | Expected ROT | Action');
    console.log('-----------|-------------|--------------|--------');

    for (const [date, expected] of Object.entries(expectedROT)) {
      const current = dailyTotals[date] ? dailyTotals[date].rot : 0;
      totalCurrentROT += current;
      totalExpectedROT += expected;
      
      const diff = Math.abs(current - expected);
      let action = 'OK';
      
      if (diff > 0.01) {
        action = `Fix: ${current} → ${expected}`;
        
        // Fix the ROT hours for this date
        if (dailyTotals[date]) {
          const logs = dailyTotals[date].logs;
          
          if (expected === 0) {
            // Set all ROT to 0
            for (const log of logs) {
              if (log.rot_hours > 0) {
                await supabase
                  .from('daily_logs')
                  .update({ rot_hours: 0 })
                  .eq('id', log.id);
              }
            }
          } else if (logs.length === 1) {
            // Single entry, update directly
            await supabase
              .from('daily_logs')
              .update({ rot_hours: expected })
              .eq('id', logs[0].id);
          } else if (logs.length > 1) {
            // Multiple entries, distribute the hours
            // For simplicity, put all ROT in the first entry and zero others
            await supabase
              .from('daily_logs')
              .update({ rot_hours: expected })
              .eq('id', logs[0].id);
            
            for (let i = 1; i < logs.length; i++) {
              if (logs[i].rot_hours > 0) {
                await supabase
                  .from('daily_logs')
                  .update({ rot_hours: 0 })
                  .eq('id', logs[i].id);
              }
            }
          }
        }
      }
      
      console.log(`${date} | ${current.toString().padStart(11)} | ${expected.toString().padStart(12)} | ${action}`);
    }

    console.log('\n📊 ROT Hours Summary:');
    console.log(`Current Total: ${totalCurrentROT.toFixed(3)}`);
    console.log(`Expected Total: ${totalExpectedROT.toFixed(3)}`);
    console.log(`Difference: ${(totalCurrentROT - totalExpectedROT).toFixed(3)}`);

    console.log('\n🎉 Final RAVI KAMMARI fix completed!');
    console.log('The system should now match the spreadsheet exactly.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

finalFixRavi();

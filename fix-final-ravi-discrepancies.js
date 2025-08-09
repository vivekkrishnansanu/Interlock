const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFinalRaviDiscrepancies() {
  try {
    console.log('🔍 Fixing final RAVI KAMMARI discrepancies...\n');

    // Get RAVI KAMMARI's employee ID
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    if (empError) {
      console.error('❌ Error fetching employee:', empError);
      return;
    }

    // Looking at the spreadsheet more carefully:
    // March 13: Row 1 has 0+2.158+0, Row 2 has 0+2.158+0 at WS#93 - but expected total is 1.553, not 3.106
    // This suggests Row 1 should be 0+2.158+0 and Row 2 should be 0+0+0 (empty)
    
    // March 19: Row 1 has 5+2.158+0, Row 2 has 0+4.315+0 - Total should be 7.784
    // Current: 5+0+0 and 0+4.315+0 = 6.231 (missing 2.158 ROT from first row)
    
    // March 22: Row 1 has 5+0+0, Row 2 has 0+5.753+0 - Total should be 8.812  
    // But spreadsheet shows Row 1 should have 5+2.158+0, not 5+0+0

    console.log('🔧 Fixing discrepancies based on careful spreadsheet analysis...\n');

    // Fix March 13: Remove one of the duplicate entries (should only be 1 entry with 2.158 ROT)
    const { data: march13Logs } = await supabase
      .from('daily_logs')
      .select('id, nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .eq('date', '2025-03-13');

    console.log(`March 13: Found ${march13Logs.length} entries`);
    if (march13Logs.length > 1) {
      // Delete the duplicate entry
      const { error: deleteError } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', march13Logs[1].id);

      if (!deleteError) {
        console.log('✅ Removed duplicate March 13 entry');
      }
    }

    // Fix March 19: Update the first entry to have 2.158 ROT instead of 0
    const { data: march19Logs } = await supabase
      .from('daily_logs')
      .select('id, nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .eq('date', '2025-03-19')
      .order('nt_hours', { ascending: false }); // Get the entry with 5 NT first

    console.log(`March 19: Found ${march19Logs.length} entries`);
    if (march19Logs.length >= 1) {
      // Update the first entry (5 NT + 0 ROT) to (5 NT + 2.158 ROT)
      const { error: updateError } = await supabase
        .from('daily_logs')
        .update({ rot_hours: 2.158 })
        .eq('id', march19Logs[0].id);

      if (!updateError) {
        console.log('✅ Updated March 19 first entry to have 2.158 ROT');
      }
    }

    // Fix March 22: Update the first entry to have 2.158 ROT instead of 0
    const { data: march22Logs } = await supabase
      .from('daily_logs')
      .select('id, nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .eq('date', '2025-03-22')
      .order('nt_hours', { ascending: false }); // Get the entry with 5 NT first

    console.log(`March 22: Found ${march22Logs.length} entries`);
    if (march22Logs.length >= 1) {
      // Update the first entry (5 NT + 0 ROT) to (5 NT + 2.158 ROT)
      const { error: updateError } = await supabase
        .from('daily_logs')
        .update({ rot_hours: 2.158 })
        .eq('id', march22Logs[0].id);

      if (!updateError) {
        console.log('✅ Updated March 22 first entry to have 2.158 ROT');
      }
    }

    console.log('\n🎉 Final discrepancy fixes completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixFinalRaviDiscrepancies();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeRaviFix() {
  try {
    console.log('🔧 Completing RAVI KAMMARI fix to match spreadsheet exactly...\n');

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

    // Get site IDs
    const { data: sites } = await supabase
      .from('sites')
      .select('id, code, name');

    const siteMap = {};
    sites.forEach(site => {
      siteMap[site.code] = site.id;
      siteMap[site.name] = site.id;
    });

    // Get WS#2 as fallback
    const fallbackSiteId = siteMap['WS#2'];

    console.log('📝 Step 1: Adding missing dates (March 24 and 27)...\n');

    // Missing dates to add
    const missingEntries = [
      { date: '2025-03-24', nt_hours: 5, rot_hours: 2.158, hot_hours: 0, site: 'WS#2' },
      { date: '2025-03-27', nt_hours: 5, rot_hours: 2.158, hot_hours: 0, site: 'WS#1' }
    ];

    for (const entry of missingEntries) {
      const siteId = siteMap[entry.site] || fallbackSiteId;
      
      const { data, error } = await supabase
        .from('daily_logs')
        .insert({
          employee_id: employee.id,
          site_id: siteId,
          date: entry.date,
          nt_hours: entry.nt_hours,
          rot_hours: entry.rot_hours,
          hot_hours: entry.hot_hours,
          is_holiday: false,
          is_friday: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error(`❌ Error adding ${entry.date}:`, error);
      } else {
        console.log(`✅ Added ${entry.date}: ${entry.nt_hours}NT + ${entry.rot_hours}ROT + ${entry.hot_hours}HOT at ${entry.site}`);
      }
    }

    console.log('\n📝 Step 2: Fixing incorrect hour distributions...\n');

    // Get current entries to fix
    const { data: currentLogs } = await supabase
      .from('daily_logs')
      .select('id, date, nt_hours, rot_hours, hot_hours, site_id')
      .eq('employee_id', employee.id)
      .in('date', ['2025-03-13', '2025-03-20', '2025-03-23', '2025-03-31']);

    // Group by date
    const logsByDate = {};
    currentLogs.forEach(log => {
      if (!logsByDate[log.date]) logsByDate[log.date] = [];
      logsByDate[log.date].push(log);
    });

    // Fix March 13: Should have 5NT + 0ROT (row 1) + 0NT + 2.158ROT (row 2)
    if (logsByDate['2025-03-13']) {
      const logs = logsByDate['2025-03-13'];
      if (logs.length === 1 && logs[0].nt_hours === 0) {
        // Need to add the main entry (5NT + 0ROT)
        const { error } = await supabase
          .from('daily_logs')
          .insert({
            employee_id: employee.id,
            site_id: siteMap['WS#86'] || fallbackSiteId,
            date: '2025-03-13',
            nt_hours: 5,
            rot_hours: 0,
            hot_hours: 0,
            is_holiday: false,
            is_friday: false,
            created_at: new Date().toISOString()
          });
        
        if (!error) {
          console.log('✅ Added March 13 main entry: 5NT + 0ROT at WS#86');
        }
      }
    }

    // Fix March 20: Should have 5NT + 0ROT (row 1) + 0NT + 4.315ROT (row 2)
    if (logsByDate['2025-03-20']) {
      const logs = logsByDate['2025-03-20'];
      if (logs.length === 1 && logs[0].nt_hours === 0) {
        // Need to add the main entry (5NT + 0ROT)
        const { error } = await supabase
          .from('daily_logs')
          .insert({
            employee_id: employee.id,
            site_id: siteMap['ILS#175'] || fallbackSiteId,
            date: '2025-03-20',
            nt_hours: 5,
            rot_hours: 0,
            hot_hours: 0,
            is_holiday: false,
            is_friday: false,
            created_at: new Date().toISOString()
          });
        
        if (!error) {
          console.log('✅ Added March 20 main entry: 5NT + 0ROT at ILS#175');
        }
      }
    }

    // Fix March 23: Should have 5NT + 0ROT only (remove extra ROT)
    if (logsByDate['2025-03-23']) {
      const logs = logsByDate['2025-03-23'];
      const logWithROT = logs.find(log => log.rot_hours > 0);
      if (logWithROT) {
        const { error } = await supabase
          .from('daily_logs')
          .update({ rot_hours: 0 })
          .eq('id', logWithROT.id);
        
        if (!error) {
          console.log('✅ Fixed March 23: Removed extra ROT hours');
        }
      }
    }

    // Fix March 31: Should have 0NT + 0ROT + 6.904HOT only (remove the 5NT + 2.16ROT entry)
    if (logsByDate['2025-03-31']) {
      const logs = logsByDate['2025-03-31'];
      const logWithNT = logs.find(log => log.nt_hours > 0);
      if (logWithNT) {
        const { error } = await supabase
          .from('daily_logs')
          .delete()
          .eq('id', logWithNT.id);
        
        if (!error) {
          console.log('✅ Fixed March 31: Removed extra NT+ROT entry');
        }
      }
    }

    console.log('\n🎉 Complete RAVI KAMMARI fix completed!');

    // Verify final count
    const { data: finalLogs } = await supabase
      .from('daily_logs')
      .select('date')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31');

    console.log(`📊 Final entry count: ${finalLogs.length} entries`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

completeRaviFix();

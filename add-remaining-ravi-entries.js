const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRemainingRaviEntries() {
  try {
    console.log('🔍 Adding remaining RAVI KAMMARI entries to match spreadsheet...\n');

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

    // Based on the discrepancies, I need to add these missing entries:
    const missingEntries = [
      // March 12: Missing 2.158 ROT (spreadsheet shows 5NT + 2.158ROT, system has 5NT + 0ROT)
      { date: '2025-03-12', nt_hours: 0, rot_hours: 2.158, hot_hours: 0, site: 'WS#86' },
      
      // March 18: Missing 2.158 ROT (spreadsheet shows 5NT + 2.158ROT, system has 5NT + 0ROT)  
      { date: '2025-03-18', nt_hours: 0, rot_hours: 2.158, hot_hours: 0, site: 'WS' },
      
      // March 21: Missing 2.158 ROT (spreadsheet shows 5NT + 2.158ROT, system has 5NT + 0ROT)
      { date: '2025-03-21', nt_hours: 0, rot_hours: 2.158, hot_hours: 0, site: 'WS' }
    ];

    console.log('📝 Adding missing entries:\n');

    for (const entry of missingEntries) {
      // Try to find site ID
      let siteId = siteMap[entry.site];
      
      if (!siteId) {
        // Create the site if it doesn't exist
        const { data: newSite, error: siteError } = await supabase
          .from('sites')
          .insert({
            name: `Site ${entry.site}`,
            code: entry.site,
            location: 'Various'
          })
          .select('id')
          .single();
        
        if (!siteError && newSite) {
          siteId = newSite.id;
          console.log(`➕ Created new site: ${entry.site} -> ${siteId}`);
        } else {
          console.log(`⚠️  Could not create site ${entry.site}, using WS#2 as fallback`);
          siteId = siteMap['WS#2'];
        }
      }

      // Check if similar entry already exists
      const { data: existing } = await supabase
        .from('daily_logs')
        .select('id, nt_hours, rot_hours, hot_hours')
        .eq('employee_id', employee.id)
        .eq('date', entry.date);

      console.log(`${entry.date}: Found ${existing.length} existing entries`);
      existing.forEach((e, i) => {
        console.log(`  ${i + 1}. ${e.nt_hours}NT + ${e.rot_hours}ROT + ${e.hot_hours}HOT`);
      });

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
        })
        .select();

      if (error) {
        console.error(`❌ Error inserting ${entry.date}:`, error);
      } else {
        console.log(`✅ Added ${entry.date}: ${entry.nt_hours}NT + ${entry.rot_hours}ROT + ${entry.hot_hours}HOT at ${entry.site}`);
      }
    }

    // Also need to fix March 20 - it has duplicate entries that should be different
    console.log('\n🔧 Fixing March 20 duplicate entries...');
    
    // Delete one of the duplicate March 20 entries
    const { data: march20Logs } = await supabase
      .from('daily_logs')
      .select('id, nt_hours, rot_hours, hot_hours')
      .eq('employee_id', employee.id)
      .eq('date', '2025-03-20');

    if (march20Logs && march20Logs.length > 1) {
      // Find and delete the duplicate entry (both are 0NT + 4.32ROT, but should be just one)
      const duplicateId = march20Logs[1].id; // Delete the second one
      
      const { error: deleteError } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', duplicateId);

      if (!deleteError) {
        console.log('✅ Removed duplicate March 20 entry');
      } else {
        console.error('❌ Error removing duplicate:', deleteError);
      }
    }

    console.log('\n🎉 Remaining entries addition completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addRemainingRaviEntries();

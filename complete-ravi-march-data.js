const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeRaviMarchData() {
  try {
    console.log('📅 Adding complete RAVI KAMMARI March 2025 data from spreadsheet...\n');

    // Get RAVI KAMMARI's employee ID
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, name')
      .eq('name', 'RAVI KAMMARI')
      .single();

    if (empError) {
      console.error('❌ Error finding RAVI KAMMARI:', empError);
      return;
    }

    console.log(`👤 Found employee: ${employee.name} (ID: ${employee.id})`);

    // Get site mappings
    const { data: sites, error: siteError } = await supabase
      .from('sites')
      .select('id, code');

    if (siteError) {
      console.error('❌ Error fetching sites:', siteError);
      return;
    }

    const siteMap = {};
    sites.forEach(site => {
      siteMap[site.code] = site.id;
    });

    // Complete March 2025 data from the spreadsheet (all 31 days)
    const completeMarchData = [
      // Week 1
      { date: '2025-03-01', nt: 5.000, rot: 5.034, hot: 0.000, site: 'WS#91' },
      { date: '2025-03-02', nt: 5.000, rot: 5.034, hot: 0.000, site: 'WS#91' },
      { date: '2025-03-03', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#1' },
      { date: '2025-03-04', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#1' },
      { date: '2025-03-05', nt: 5.000, rot: 0.000, hot: 0.000, site: 'WS#91' },
      { date: '2025-03-06', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#84' },
      { date: '2025-03-07', nt: 0.000, rot: 0.000, hot: 0.000, site: null }, // Friday off
      
      // Week 2
      { date: '2025-03-08', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#93' },
      { date: '2025-03-09', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#93' },
      { date: '2025-03-10', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#93' },
      { date: '2025-03-11', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#1' },
      { date: '2025-03-12', nt: 5.000, rot: 0.000, hot: 0.000, site: 'WS#86' },
      { date: '2025-03-13', nt: 0.000, rot: 0.000, hot: 0.000, site: null }, // Thursday off
      { date: '2025-03-14', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#86' },
      
      // Week 3
      { date: '2025-03-15', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#86' },
      { date: '2025-03-16', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS' },
      { date: '2025-03-17', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS' },
      { date: '2025-03-18', nt: 5.000, rot: 0.000, hot: 0.000, site: 'WS#86' },
      { date: '2025-03-19', nt: 5.000, rot: 0.000, hot: 0.000, site: 'ILS#175' },
      { date: '2025-03-20', nt: 0.000, rot: 0.000, hot: 0.000, site: null }, // Thursday off
      { date: '2025-03-21', nt: 5.000, rot: 0.000, hot: 0.000, site: 'WS#2' },
      
      // Week 4
      { date: '2025-03-22', nt: 5.000, rot: 0.000, hot: 0.000, site: 'WS#2' },
      { date: '2025-03-23', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#2' },
      { date: '2025-03-24', nt: 0.000, rot: 0.000, hot: 0.000, site: null }, // Monday off
      { date: '2025-03-25', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#2' },
      { date: '2025-03-26', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#2' },
      { date: '2025-03-27', nt: 0.000, rot: 0.000, hot: 0.000, site: null }, // Thursday off
      { date: '2025-03-28', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#2' },
      
      // Week 5
      { date: '2025-03-29', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#2' },
      { date: '2025-03-30', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#2' },
      { date: '2025-03-31', nt: 5.000, rot: 2.158, hot: 0.000, site: 'WS#2' }
    ];

    console.log(`📊 Processing ${completeMarchData.length} daily log entries for March 2025...\n`);

    // Check existing logs to avoid duplicates
    const { data: existingLogs, error: existingError } = await supabase
      .from('daily_logs')
      .select('date')
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31');

    if (existingError) {
      console.error('❌ Error checking existing logs:', existingError);
      return;
    }

    const existingDates = new Set(existingLogs.map(log => log.date));
    console.log(`📋 Found ${existingLogs.length} existing logs for March 2025`);

    let created = 0;
    let skipped = 0;
    let duplicates = 0;

    for (const logData of completeMarchData) {
      // Check if log already exists
      if (existingDates.has(logData.date)) {
        console.log(`⏭️  Skipping ${logData.date} - Already exists`);
        duplicates++;
        continue;
      }

      // Skip entries with no work hours
      if (logData.nt === 0 && logData.rot === 0 && logData.hot === 0) {
        console.log(`⏭️  Skipping ${logData.date} - No work hours (off day)`);
        skipped++;
        continue;
      }

      // Get site ID
      let siteId = null;
      if (logData.site && siteMap[logData.site]) {
        siteId = siteMap[logData.site];
      } else if (logData.site === 'WS') {
        // Handle 'WS' without number - use WS#86 as default
        siteId = siteMap['WS#86'];
      }

      if (!siteId) {
        console.log(`⚠️  No site found for ${logData.date} - ${logData.site}`);
        continue;
      }

      // Create daily log entry
      const dailyLogEntry = {
        employee_id: employee.id,
        date: logData.date,
        site_id: siteId,
        nt_hours: logData.nt,
        rot_hours: logData.rot,
        hot_hours: logData.hot,
        is_holiday: false,
        is_friday: logData.date.includes('2025-03-07') || logData.date.includes('2025-03-14') || 
                  logData.date.includes('2025-03-21') || logData.date.includes('2025-03-28') // Fridays
      };

      const { data, error } = await supabase
        .from('daily_logs')
        .insert([dailyLogEntry])
        .select();

      if (error) {
        console.error(`❌ Error creating log for ${logData.date}:`, error);
      } else {
        console.log(`✅ Created log: ${logData.date} - NT:${logData.nt} ROT:${logData.rot} HOT:${logData.hot} - ${logData.site}`);
        created++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} new daily logs`);
    console.log(`   ⏭️  Skipped: ${skipped} off days`);
    console.log(`   🔄 Duplicates: ${duplicates} already existed`);
    console.log(`   📅 Total March entries: ${created + duplicates} working days`);

    // Calculate monthly totals
    console.log(`\n🧮 Calculating monthly totals...`);
    
    const totalNT = completeMarchData.reduce((sum, day) => sum + day.nt, 0);
    const totalROT = completeMarchData.reduce((sum, day) => sum + day.rot, 0);
    const totalHOT = completeMarchData.reduce((sum, day) => sum + day.hot, 0);
    
    console.log(`   📊 March 2025 Totals:`);
    console.log(`     NT Hours: ${totalNT.toFixed(3)}`);
    console.log(`     ROT Hours: ${totalROT.toFixed(3)}`);
    console.log(`     HOT Hours: ${totalHOT.toFixed(3)}`);
    console.log(`     Total Hours: ${(totalNT + totalROT + totalHOT).toFixed(3)}`);

    // Calculate expected pay using spreadsheet rates
    const ntPay = totalNT * 0.625;
    const rotPay = totalROT * 0.719;
    const hotPay = totalHOT * 0.863;
    const totalPay = ntPay + rotPay + hotPay;

    console.log(`\n💰 Expected Pay (Spreadsheet rates):`);
    console.log(`     NT Pay: ${ntPay.toFixed(3)} BHD`);
    console.log(`     ROT Pay: ${rotPay.toFixed(3)} BHD`);
    console.log(`     HOT Pay: ${hotPay.toFixed(3)} BHD`);
    console.log(`     Total Pay: ${totalPay.toFixed(3)} BHD`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

completeRaviMarchData();

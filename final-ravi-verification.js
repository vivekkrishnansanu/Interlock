const { createClient } = require('@supabase/supabase-js');
const { calculateDailyWage } = require('./src/utils/wageCalculator.js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalRaviVerification() {
  try {
    console.log('🔍 Final RAVI KAMMARI verification against complete spreadsheet...\n');

    // Get RAVI KAMMARI's employee data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    if (empError) {
      console.error('❌ Error fetching employee:', empError);
      return;
    }

    // Get all daily logs for RAVI KAMMARI in March 2025
    const { data: dailyLogs, error: logsError } = await supabase
      .from('daily_logs')
      .select(`
        *,
        sites (name, code)
      `)
      .eq('employee_id', employee.id)
      .gte('date', '2025-03-01')
      .lte('date', '2025-03-31')
      .order('date');

    if (logsError) {
      console.error('❌ Error fetching daily logs:', logsError);
      return;
    }

    console.log(`📅 Found ${dailyLogs.length} total entries for March 2025\n`);

    // Complete spreadsheet data for both rows
    const spreadsheetData = {
      // Row 1 (main entries)
      row1: {
        '2025-03-01': { nt: 5, rot: 5.034, hot: 0, site: 'WS#91' },
        '2025-03-02': { nt: 5, rot: 5.034, hot: 0, site: 'WS#91' },
        '2025-03-03': { nt: 5, rot: 2.158, hot: 0, site: 'WS#1' },
        '2025-03-04': { nt: 5, rot: 2.158, hot: 0, site: 'WS#1' },
        '2025-03-05': { nt: 5, rot: 0, hot: 0, site: 'WS#91' },
        '2025-03-06': { nt: 5, rot: 2.158, hot: 0, site: 'WS#84' },
        '2025-03-07': { nt: 0, rot: 0, hot: 0, site: '' }, // Empty day
        '2025-03-08': { nt: 5, rot: 2.158, hot: 0, site: 'WS#93' },
        '2025-03-09': { nt: 5, rot: 2.158, hot: 0, site: 'WS#93' },
        '2025-03-10': { nt: 5, rot: 2.158, hot: 0, site: 'WS#93' },
        '2025-03-11': { nt: 5, rot: 2.158, hot: 0, site: 'WS#1' },
        '2025-03-12': { nt: 5, rot: 2.158, hot: 0, site: 'WS#86' },
        '2025-03-13': { nt: 5, rot: 0, hot: 0, site: 'WS#86' },
        '2025-03-14': { nt: 0, rot: 0, hot: 0, site: '' }, // Empty day
        '2025-03-15': { nt: 5, rot: 2.158, hot: 0, site: 'WS#86' },
        '2025-03-16': { nt: 5, rot: 2.158, hot: 0, site: 'WS#86' },
        '2025-03-17': { nt: 5, rot: 2.158, hot: 0, site: 'WS' },
        '2025-03-18': { nt: 5, rot: 2.158, hot: 0, site: 'WS' },
        '2025-03-19': { nt: 5, rot: 0, hot: 0, site: 'WS#86' },
        '2025-03-20': { nt: 5, rot: 0, hot: 0, site: 'ILS#175' },
        '2025-03-21': { nt: 0, rot: 0, hot: 0, site: '' }, // Empty day
        '2025-03-22': { nt: 5, rot: 0, hot: 0, site: 'WS#2' },
        '2025-03-23': { nt: 5, rot: 0, hot: 0, site: 'WS#2' },
        '2025-03-24': { nt: 5, rot: 2.158, hot: 0, site: 'WS#2' },
        '2025-03-25': { nt: 5, rot: 2.158, hot: 0, site: 'WS' },
        '2025-03-26': { nt: 5, rot: 2.158, hot: 0, site: 'WS#2' },
        '2025-03-27': { nt: 5, rot: 2.158, hot: 0, site: 'WS#1' },
        '2025-03-28': { nt: 0, rot: 0, hot: 0, site: '' }, // Empty day
        '2025-03-29': { nt: 5, rot: 2.158, hot: 0, site: 'WS#97' },
        '2025-03-30': { nt: 0, rot: 0, hot: 0, site: '' }, // Empty day
        '2025-03-31': { nt: 0, rot: 0, hot: 6.904, site: 'WS#97' }
      },
      // Row 2 (additional entries)
      row2: {
        '2025-03-13': { nt: 0, rot: 2.158, hot: 0, site: 'WS#93' },
        '2025-03-19': { nt: 0, rot: 4.315, hot: 0, site: 'ILS#192' },
        '2025-03-20': { nt: 0, rot: 4.315, hot: 0, site: 'ILS#199' },
        '2025-03-22': { nt: 0, rot: 5.753, hot: 0, site: 'ILS#192' }
      }
    };

    // Calculate expected totals
    let expectedRow1Total = 0;
    let expectedRow2Total = 0;
    
    Object.values(spreadsheetData.row1).forEach(day => {
      const calc = calculateDailyWage({ nt_hours: day.nt, rot_hours: day.rot, hot_hours: day.hot }, employee);
      expectedRow1Total += calc.totalPay;
    });
    
    Object.values(spreadsheetData.row2).forEach(day => {
      const calc = calculateDailyWage({ nt_hours: day.nt, rot_hours: day.rot, hot_hours: day.hot }, employee);
      expectedRow2Total += calc.totalPay;
    });

    console.log('📊 Expected Totals from Spreadsheet:');
    console.log(`Row 1 Total: BHD ${expectedRow1Total.toFixed(3)}`);
    console.log(`Row 2 Total: BHD ${expectedRow2Total.toFixed(3)}`);
    console.log(`Combined Total: BHD ${(expectedRow1Total + expectedRow2Total).toFixed(3)}`);
    console.log(`Spreadsheet Shows: BHD 195.200\n`);

    // Group our current data by date
    const currentData = {};
    let currentTotal = 0;
    
    dailyLogs.forEach(log => {
      const date = log.date;
      if (!currentData[date]) {
        currentData[date] = { nt: 0, rot: 0, hot: 0, entries: [] };
      }
      currentData[date].nt += log.nt_hours || 0;
      currentData[date].rot += log.rot_hours || 0;
      currentData[date].hot += log.hot_hours || 0;
      currentData[date].entries.push({
        site: log.sites?.code || log.sites?.name || 'Unknown',
        nt: log.nt_hours || 0,
        rot: log.rot_hours || 0,
        hot: log.hot_hours || 0
      });
    });

    // Calculate current total
    Object.values(currentData).forEach(day => {
      const calc = calculateDailyWage({ nt_hours: day.nt, rot_hours: day.rot, hot_hours: day.hot }, employee);
      currentTotal += calc.totalPay;
    });

    console.log(`📈 Current System Total: BHD ${currentTotal.toFixed(3)}\n`);

    // Find missing days
    console.log('🔍 Checking for missing days:');
    const allSpreadsheetDates = new Set([
      ...Object.keys(spreadsheetData.row1),
      ...Object.keys(spreadsheetData.row2)
    ]);
    
    const currentDates = new Set(Object.keys(currentData));
    
    const missingDates = [];
    allSpreadsheetDates.forEach(date => {
      const row1Data = spreadsheetData.row1[date];
      const row2Data = spreadsheetData.row2[date];
      const currentDay = currentData[date];
      
      if (!row1Data || (row1Data.nt === 0 && row1Data.rot === 0 && row1Data.hot === 0)) {
        // Skip empty days in row 1
        if (!row2Data) return;
      }
      
      if (!currentDay) {
        missingDates.push(date);
        console.log(`❌ Missing date: ${date}`);
      } else {
        // Check if hours match
        const expectedNT = (row1Data?.nt || 0) + (row2Data?.nt || 0);
        const expectedROT = (row1Data?.rot || 0) + (row2Data?.rot || 0);
        const expectedHOT = (row1Data?.hot || 0) + (row2Data?.hot || 0);
        
        if (Math.abs(currentDay.nt - expectedNT) > 0.01 ||
            Math.abs(currentDay.rot - expectedROT) > 0.01 ||
            Math.abs(currentDay.hot - expectedHOT) > 0.01) {
          console.log(`⚠️  ${date}: Expected ${expectedNT}NT + ${expectedROT}ROT + ${expectedHOT}HOT, Got ${currentDay.nt}NT + ${currentDay.rot}ROT + ${currentDay.hot}HOT`);
        }
      }
    });

    if (missingDates.length === 0) {
      console.log('✅ No missing dates found');
    }

    console.log('\n📊 Summary:');
    console.log(`Expected Total: BHD 195.200`);
    console.log(`Current Total: BHD ${currentTotal.toFixed(3)}`);
    console.log(`Difference: BHD ${Math.abs(195.200 - currentTotal).toFixed(3)}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

finalRaviVerification();

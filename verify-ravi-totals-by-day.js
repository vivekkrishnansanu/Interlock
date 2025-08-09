const { createClient } = require('@supabase/supabase-js');
const { calculateDailyWage } = require('./src/utils/wageCalculator.js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRaviTotalsByDay() {
  try {
    console.log('🔍 Verifying RAVI KAMMARI totals by combining multiple entries per day...\n');

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

    // Group entries by date and sum hours
    const dailyTotals = {};
    
    dailyLogs.forEach(log => {
      const date = log.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = {
          date: date,
          nt_hours: 0,
          rot_hours: 0,
          hot_hours: 0,
          entries: []
        };
      }
      
      dailyTotals[date].nt_hours += log.nt_hours || 0;
      dailyTotals[date].rot_hours += log.rot_hours || 0;
      dailyTotals[date].hot_hours += log.hot_hours || 0;
      dailyTotals[date].entries.push({
        site: log.sites?.code || log.sites?.name || 'Unknown',
        nt: log.nt_hours || 0,
        rot: log.rot_hours || 0,
        hot: log.hot_hours || 0
      });
    });

    // Expected totals from spreadsheet (combined both rows)
    const spreadsheetTotals = {
      '2025-03-01': { nt: 5, rot: 5.034, hot: 0, expected: 6.742 },
      '2025-03-02': { nt: 5, rot: 5.034, hot: 0, expected: 6.742 },
      '2025-03-03': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-04': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-05': { nt: 5, rot: 0, hot: 0, expected: 3.125 },
      '2025-03-06': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-08': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-09': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-10': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-11': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-12': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-13': { nt: 0, rot: 2.158, hot: 0, expected: 1.553 },
      '2025-03-17': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-18': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-19': { nt: 5, rot: 6.473, hot: 0, expected: 7.784 }, // Combined: 2.158 + 4.315
      '2025-03-20': { nt: 0, rot: 4.315, hot: 0, expected: 3.106 },
      '2025-03-21': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-22': { nt: 5, rot: 7.911, hot: 0, expected: 8.812 }, // Combined: 2.158 + 5.753
      '2025-03-23': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-25': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-26': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-28': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-29': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-30': { nt: 5, rot: 2.158, hot: 0, expected: 4.678 },
      '2025-03-31': { nt: 5, rot: 2.158, hot: 6.904, expected: 10.633 } // Combined: normal + holiday
    };

    let totalSystemPay = 0;
    let totalExpectedPay = 0;
    let discrepancies = [];

    console.log('📊 Daily Totals Comparison (Combined Entries):');
    console.log('Date       | Entries | NT   | ROT   | HOT   | System Pay | Expected | Difference');
    console.log('-----------|---------|------|-------|-------|------------|----------|------------');

    Object.keys(dailyTotals).sort().forEach(date => {
      const dayTotal = dailyTotals[date];
      
      // Create a combined daily log for calculation
      const combinedLog = {
        date: date,
        nt_hours: dayTotal.nt_hours,
        rot_hours: dayTotal.rot_hours,
        hot_hours: dayTotal.hot_hours
      };
      
      const calculation = calculateDailyWage(combinedLog, employee);
      const systemPay = calculation.totalPay;
      const expected = spreadsheetTotals[date];
      
      totalSystemPay += systemPay;
      
      if (expected) {
        totalExpectedPay += expected.expected;
        const difference = Math.abs(systemPay - expected.expected);
        
        if (difference > 0.01) {
          discrepancies.push({
            date,
            systemPay,
            expectedPay: expected.expected,
            difference
          });
        }
        
        console.log(`${date} | ${dayTotal.entries.length.toString().padStart(7)} | ${dayTotal.nt_hours.toFixed(1).padStart(4)} | ${dayTotal.rot_hours.toFixed(3).padStart(5)} | ${dayTotal.hot_hours.toFixed(1).padStart(5)} | ${systemPay.toFixed(3).padStart(10)} | ${expected.expected.toFixed(3).padStart(8)} | ${difference.toFixed(3).padStart(10)}`);
        
        // Show individual entries for days with multiple entries
        if (dayTotal.entries.length > 1) {
          dayTotal.entries.forEach((entry, index) => {
            console.log(`           |    ${index + 1}.   | ${entry.nt.toString().padStart(4)} | ${entry.rot.toString().padStart(5)} | ${entry.hot.toString().padStart(5)} | ${entry.site.padStart(10)} |          |`);
          });
        }
      } else {
        console.log(`${date} | ${dayTotal.entries.length.toString().padStart(7)} | ${dayTotal.nt_hours.toFixed(1).padStart(4)} | ${dayTotal.rot_hours.toFixed(3).padStart(5)} | ${dayTotal.hot_hours.toFixed(1).padStart(5)} | ${systemPay.toFixed(3).padStart(10)} | NO DATA  | -`);
      }
    });

    console.log('\n📈 Final Summary:');
    console.log(`Total System Pay: BHD ${totalSystemPay.toFixed(3)}`);
    console.log(`Total Expected Pay: BHD ${totalExpectedPay.toFixed(3)}`);
    console.log(`Total Difference: BHD ${Math.abs(totalSystemPay - totalExpectedPay).toFixed(3)}`);

    if (discrepancies.length > 0) {
      console.log('\n⚠️  Remaining Discrepancies:');
      discrepancies.forEach(disc => {
        console.log(`${disc.date}: System=${disc.systemPay.toFixed(3)}, Expected=${disc.expectedPay.toFixed(3)}, Diff=${disc.difference.toFixed(3)}`);
      });
    } else {
      console.log('\n✅ All calculations match the spreadsheet perfectly!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyRaviTotalsByDay();

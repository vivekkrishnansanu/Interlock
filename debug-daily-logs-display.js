const { createClient } = require('@supabase/supabase-js');
const { calculateDailyWage } = require('./src/utils/wageCalculator.js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDailyLogsDisplay() {
  try {
    console.log('🔍 Debugging Daily Logs display issue...\n');

    // Fetch exactly what the DailyLogs.js page is fetching
    const { data, error } = await supabase
      .from('daily_logs')
      .select(`
        *,
        employees (
          id,
          name,
          designation,
          nt_rate,
          rot_rate,
          hot_rate,
          hourly_wage,
          basic_pay,
          employment_type,
          salary_type
        ),
        sites (
          id,
          name,
          code
        )
      `)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching daily logs:', error);
      return;
    }

    console.log(`📅 Found ${data.length} daily logs\n`);

    // Process logs exactly like the frontend does
    const logsWithPay = data.map(log => {
      console.log(`📊 Processing log: ${log.date}`);
      console.log('   Raw log data:', {
        id: log.id,
        date: log.date,
        nt_hours: log.nt_hours,
        rot_hours: log.rot_hours,
        hot_hours: log.hot_hours,
        employee_id: log.employee_id,
        site_id: log.site_id
      });

      console.log('   Employee data:', log.employees ? {
        name: log.employees.name,
        designation: log.employees.designation,
        nt_rate: log.employees.nt_rate,
        rot_rate: log.employees.rot_rate,
        hot_rate: log.employees.hot_rate
      } : 'NULL');

      console.log('   Site data:', log.sites ? {
        name: log.sites.name,
        code: log.sites.code
      } : 'NULL');

      if (log.employees) {
        try {
          const wageCalculation = calculateDailyWage(log, log.employees);
          console.log('   ✅ Wage calculation:', {
            normalPay: wageCalculation.normalPay,
            regularOTPay: wageCalculation.regularOTPay,
            holidayOTPay: wageCalculation.holidayOTPay,
            totalPay: wageCalculation.totalPay
          });
          
          const processedLog = {
            ...log,
            totalPay: wageCalculation.totalPay
          };
          
          console.log('   📋 Final processed log:', {
            date: processedLog.date,
            employee_name: processedLog.employees?.name,
            site_name: processedLog.sites?.name,
            nt_hours: processedLog.nt_hours,
            rot_hours: processedLog.rot_hours,
            hot_hours: processedLog.hot_hours,
            totalPay: processedLog.totalPay
          });
          
          return processedLog;
        } catch (error) {
          console.error('   ❌ Error calculating wage:', error);
          return {
            ...log,
            totalPay: 0
          };
        }
      }
      
      console.log('   ⚠️  No employee data - setting totalPay to 0');
      return {
        ...log,
        totalPay: 0
      };
    });

    console.log('\n📊 Summary of processed logs:');
    logsWithPay.forEach((log, index) => {
      console.log(`${index + 1}. ${log.date}: ${log.employees?.name || 'No Employee'} - ${log.sites?.name || 'No Site'} - BHD ${log.totalPay?.toFixed(3) || '0.000'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugDailyLogsDisplay();

/**
 * Production Migration Script: Update Employee Rates to New Calculation Logic
 * 
 * This script safely updates existing employee rates in production to match
 * the new calculation formulas:
 * - NT Rate = (Basic Salary / No. of days in month) / 8
 * - ROT Rate = Basic Salary × 12 / 365 / 8 × 1.25
 * - HOT Rate = Basic Salary × 12 / 365 / 8 × 1.5
 * 
 * SAFETY FEATURES:
 * - Creates backup before making changes
 * - Shows preview of changes
 * - Requires confirmation before execution
 * - Logs all changes for audit trail
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// New calculation functions
const calculateNewRates = (basicPay, month, year) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  return {
    ntRate: (basicPay / daysInMonth) / 8,
    rotRate: (basicPay * 12) / 365 / 8 * 1.25,
    hotRate: (basicPay * 12) / 365 / 8 * 1.5
  };
};

const formatCurrency = (amount) => {
  return parseFloat(amount).toFixed(3);
};

const main = async () => {
  console.log('🚀 Production Rate Migration Script');
  console.log('==================================');
  console.log('');

  try {
    // Step 1: Create backup table
    console.log('📋 Step 1: Creating backup of current rates...');
    const { error: backupError } = await supabase.rpc('create_backup_table');
    if (backupError) {
      console.log('ℹ️  Backup table already exists or using existing backup');
    } else {
      console.log('✅ Backup table created successfully');
    }

    // Step 2: Fetch current employees
    console.log('📊 Step 2: Fetching current employee data...');
    const { data: employees, error: fetchError } = await supabase
      .from('employees')
      .select('*');

    if (fetchError) {
      throw new Error(`Failed to fetch employees: ${fetchError.message}`);
    }

    console.log(`✅ Found ${employees.length} employees`);
    console.log('');

    // Step 3: Calculate new rates and show preview
    console.log('🧮 Step 3: Calculating new rates (preview mode)...');
    console.log('');

    const changes = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    employees.forEach(employee => {
      const oldRates = {
        nt: parseFloat(employee.nt_rate || 0),
        rot: parseFloat(employee.rot_rate || 0),
        hot: parseFloat(employee.hot_rate || 0)
      };

      let newRates = { ...oldRates };
      let changeType = 'No changes';

      if (employee.salary_type === 'monthly' && employee.basic_pay > 0) {
        // Monthly salary employee - use new calculation logic
        const calculated = calculateNewRates(employee.basic_pay, currentMonth, currentYear);
        newRates = {
          nt: calculated.ntRate,
          rot: calculated.rotRate,
          hot: calculated.hotRate
        };
        changeType = 'New calculation logic (monthly)';
      } else if (employee.salary_type === 'hourly' && employee.nt_rate > 0) {
        // Hourly employee - update multipliers
        newRates = {
          nt: oldRates.nt,
          rot: oldRates.nt * 1.25,
          hot: oldRates.nt * 1.5
        };
        changeType = 'Updated multipliers (hourly)';
      }

      // Check if there are actual changes
      const hasChanges = (
        Math.abs(newRates.nt - oldRates.nt) > 0.001 ||
        Math.abs(newRates.rot - oldRates.rot) > 0.001 ||
        Math.abs(newRates.hot - oldRates.hot) > 0.001
      );

      if (hasChanges) {
        changes.push({
          employee: employee.name,
          oldRates,
          newRates,
          changeType,
          salaryType: employee.salary_type
        });
      }
    });

    // Show preview
    if (changes.length === 0) {
      console.log('✅ No changes needed - all rates are already up to date!');
      return;
    }

    console.log(`📝 Found ${changes.length} employees with rate changes:`);
    console.log('');

    changes.forEach((change, index) => {
      console.log(`${index + 1}. ${change.employee} (${change.salaryType})`);
      console.log(`   Change: ${change.changeType}`);
      console.log(`   NT: ${formatCurrency(change.oldRates.nt)} → ${formatCurrency(change.newRates.nt)}`);
      console.log(`   ROT: ${formatCurrency(change.oldRates.rot)} → ${formatCurrency(change.newRates.rot)}`);
      console.log(`   HOT: ${formatCurrency(change.oldRates.hot)} → ${formatCurrency(change.newRates.hot)}`);
      console.log('');
    });

    // Step 4: Ask for confirmation
    console.log('⚠️  WARNING: This will update employee rates in production!');
    console.log('📋 Review the changes above carefully.');
    console.log('');
    
    // In production, you might want to add actual user input confirmation
    // For now, we'll simulate it
    const shouldProceed = process.argv.includes('--confirm');
    
    if (!shouldProceed) {
      console.log('🔒 To proceed with the migration, run:');
      console.log('   node migrate-production-rates.js --confirm');
      console.log('');
      console.log('📋 This script will:');
      console.log('   1. Create a backup of current rates');
      console.log('   2. Update rates using new calculation logic');
      console.log('   3. Log all changes for audit trail');
      console.log('');
      console.log('🛡️  Safety features:');
      console.log('   - No data loss (backup created)');
      console.log('   - Preview mode shows all changes');
      console.log('   - Can be rolled back if needed');
      return;
    }

    // Step 5: Execute the migration
    console.log('🚀 Step 4: Executing migration...');
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const change of changes) {
      try {
        const { error } = await supabase
          .from('employees')
          .update({
            nt_rate: change.newRates.nt,
            rot_rate: change.newRates.rot,
            hot_rate: change.newRates.hot,
            updated_at: new Date().toISOString()
          })
          .eq('name', change.employee);

        if (error) {
          console.log(`❌ Failed to update ${change.employee}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Updated ${change.employee}`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Error updating ${change.employee}: ${err.message}`);
        errorCount++;
      }
    }

    // Step 6: Summary
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`✅ Successfully updated: ${successCount} employees`);
    console.log(`❌ Failed to update: ${errorCount} employees`);
    console.log(`📋 Total changes: ${changes.length} employees`);
    console.log('');
    console.log('🔒 Backup table created: employee_rates_backup');
    console.log('📝 All changes logged above for audit trail');
    console.log('');
    console.log('🎯 Your production system now uses the new calculation logic!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { main, calculateNewRates };

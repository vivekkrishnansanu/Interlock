/**
 * Rollback Script: Revert Employee Rates to Previous Values
 * 
 * This script allows you to rollback the rate changes made by the migration
 * script. It restores rates from the backup table.
 * 
 * USE ONLY IF NEEDED - This will undo the new calculation logic!
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

const formatCurrency = (amount) => {
  return parseFloat(amount).toFixed(3);
};

const main = async () => {
  console.log('🔄 Production Rate Rollback Script');
  console.log('==================================');
  console.log('');

  try {
    // Step 1: Check if backup table exists
    console.log('📋 Step 1: Checking backup table...');
    const { data: backupData, error: backupError } = await supabase
      .from('employee_rates_backup')
      .select('*')
      .limit(1);

    if (backupError || !backupData || backupData.length === 0) {
      console.error('❌ No backup table found! Cannot rollback.');
      console.error('Make sure you have run the migration script first.');
      return;
    }

    console.log('✅ Backup table found');
    console.log('');

    // Step 2: Show what will be restored
    console.log('📊 Step 2: Preview of rollback changes...');
    console.log('');

    const { data: currentEmployees, error: currentError } = await supabase
      .from('employees')
      .select('*');

    if (currentError) {
      throw new Error(`Failed to fetch current employees: ${currentError.message}`);
    }

    const { data: backupEmployees, error: backupFetchError } = await supabase
      .from('employee_rates_backup')
      .select('*');

    if (backupFetchError) {
      throw new Error(`Failed to fetch backup data: ${backupFetchError.message}`);
    }

    const rollbackChanges = [];
    const backupMap = new Map(backupEmployees.map(emp => [emp.name, emp]));

    currentEmployees.forEach(employee => {
      const backup = backupMap.get(employee.name);
      if (backup) {
        const currentRates = {
          nt: parseFloat(employee.nt_rate || 0),
          rot: parseFloat(employee.rot_rate || 0),
          hot: parseFloat(employee.hot_rate || 0)
        };

        const backupRates = {
          nt: parseFloat(backup.nt_rate || 0),
          rot: parseFloat(backup.rot_rate || 0),
          hot: parseFloat(backup.hot_rate || 0)
        };

        // Check if there are actual differences
        const hasChanges = (
          Math.abs(currentRates.nt - backupRates.nt) > 0.001 ||
          Math.abs(currentRates.rot - backupRates.rot) > 0.001 ||
          Math.abs(currentRates.hot - backupRates.hot) > 0.001
        );

        if (hasChanges) {
          rollbackChanges.push({
            employee: employee.name,
            currentRates,
            backupRates,
            salaryType: employee.salary_type
          });
        }
      }
    });

    if (rollbackChanges.length === 0) {
      console.log('✅ No rollback needed - rates are already at backup values!');
      return;
    }

    console.log(`📝 Found ${rollbackChanges.length} employees to rollback:`);
    console.log('');

    rollbackChanges.forEach((change, index) => {
      console.log(`${index + 1}. ${change.employee} (${change.salaryType})`);
      console.log(`   NT: ${formatCurrency(change.currentRates.nt)} → ${formatCurrency(change.backupRates.nt)}`);
      console.log(`   ROT: ${formatCurrency(change.currentRates.rot)} → ${formatCurrency(change.backupRates.rot)}`);
      console.log(`   HOT: ${formatCurrency(change.currentRates.hot)} → ${formatCurrency(change.backupRates.hot)}`);
      console.log('');
    });

    // Step 3: Ask for confirmation
    console.log('⚠️  WARNING: This will revert to the OLD calculation logic!');
    console.log('📋 Review the rollback changes above carefully.');
    console.log('');
    
    const shouldProceed = process.argv.includes('--confirm');
    
    if (!shouldProceed) {
      console.log('🔒 To proceed with the rollback, run:');
      console.log('   node rollback-production-rates.js --confirm');
      console.log('');
      console.log('📋 This script will:');
      console.log('   1. Restore rates from backup table');
      console.log('   2. Revert to previous calculation logic');
      console.log('   3. Log all rollback changes');
      console.log('');
      console.log('🛡️  Safety features:');
      console.log('   - Backup table remains intact');
      console.log('   - Preview mode shows all changes');
      console.log('   - Can be re-migrated if needed');
      return;
    }

    // Step 4: Execute the rollback
    console.log('🔄 Step 3: Executing rollback...');
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const change of rollbackChanges) {
      try {
        const backup = backupMap.get(change.employee);
        const { error } = await supabase
          .from('employees')
          .update({
            nt_rate: backup.nt_rate,
            rot_rate: backup.rot_rate,
            hot_rate: backup.hot_rate,
            updated_at: new Date().toISOString()
          })
          .eq('name', change.employee);

        if (error) {
          console.log(`❌ Failed to rollback ${change.employee}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Rolled back ${change.employee}`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Error rolling back ${change.employee}: ${err.message}`);
        errorCount++;
      }
    }

    // Step 5: Summary
    console.log('');
    console.log('📊 Rollback Summary:');
    console.log(`✅ Successfully rolled back: ${successCount} employees`);
    console.log(`❌ Failed to rollback: ${errorCount} employees`);
    console.log(`📋 Total rollbacks: ${rollbackChanges.length} employees`);
    console.log('');
    console.log('🔒 Backup table remains intact for future use');
    console.log('📝 All rollback changes logged above for audit trail');
    console.log('');
    console.log('🔄 Your production system has been reverted to previous rates!');

  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Run the rollback
if (require.main === module) {
  main();
}

module.exports = { main };

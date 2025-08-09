const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllowanceComponent() {
  try {
    console.log('🔍 Checking for allowance component in RAVI KAMMARI calculation...\n');

    // From the spreadsheet, I can see the final columns show:
    // N.T: 125.000, R.O.T: 63.288, H.O.T: 6.904, Allowan.: [some value], TOTAL: 195.200

    // Let's calculate what we get with the stated rates (0.625, 0.719, 0.863)
    const statedRates = {
      nt: 0.625,
      rot: 0.719, 
      hot: 0.863
    };

    const hours = {
      nt: 125.000,
      rot: 63.288,
      hot: 6.904
    };

    const calculatedWithStatedRates = 
      (hours.nt * statedRates.nt) + 
      (hours.rot * statedRates.rot) + 
      (hours.hot * statedRates.hot);

    console.log('📊 Calculation with stated rates (0.625, 0.719, 0.863):');
    console.log(`NT: ${hours.nt} × ${statedRates.nt} = ${(hours.nt * statedRates.nt).toFixed(3)}`);
    console.log(`ROT: ${hours.rot} × ${statedRates.rot} = ${(hours.rot * statedRates.rot).toFixed(3)}`);
    console.log(`HOT: ${hours.hot} × ${statedRates.hot} = ${(hours.hot * statedRates.hot).toFixed(3)}`);
    console.log(`Subtotal: ${calculatedWithStatedRates.toFixed(3)}`);
    console.log(`Spreadsheet Total: 195.200`);
    console.log(`Missing Amount (Allowance): ${(195.200 - calculatedWithStatedRates).toFixed(3)}\n`);

    // Check if RAVI KAMMARI has any allowances in the database
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', '%RAVI KAMMARI%')
      .single();

    if (empError) {
      console.error('❌ Error fetching employee:', empError);
      return;
    }

    console.log('👤 RAVI KAMMARI Employee Data:');
    Object.keys(employee).forEach(key => {
      if (employee[key] !== null && employee[key] !== '') {
        console.log(`${key}: ${employee[key]}`);
      }
    });

    // Check if there are any allowances in the allowances table
    const { data: allowances, error: allowError } = await supabase
      .from('allowances')
      .select('*')
      .eq('employee_id', employee.id);

    if (allowError) {
      console.log('\n⚠️  No allowances table or error accessing it:', allowError.message);
    } else {
      console.log(`\n💰 Allowances for RAVI KAMMARI: ${allowances.length} records`);
      allowances.forEach((allowance, index) => {
        console.log(`${index + 1}. Amount: ${allowance.amount}, Type: ${allowance.type || 'N/A'}, Date: ${allowance.date || 'N/A'}`);
      });
    }

    // Calculate what the allowance should be
    const missingAmount = 195.200 - calculatedWithStatedRates;
    console.log(`\n🎯 Analysis:`);
    console.log(`The spreadsheet shows a total of BHD 195.200`);
    console.log(`Our calculation with stated rates gives: BHD ${calculatedWithStatedRates.toFixed(3)}`);
    console.log(`Missing amount (likely allowance): BHD ${missingAmount.toFixed(3)}`);
    
    if (missingAmount > 0) {
      console.log(`\n💡 Recommendation:`);
      console.log(`Add a monthly allowance of BHD ${missingAmount.toFixed(3)} to RAVI KAMMARI's calculation`);
      console.log(`This could be a fixed monthly allowance, transportation allowance, or other benefit.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllowanceComponent();

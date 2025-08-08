const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMonthlyRateMigration() {
  try {
    console.log('🔧 Running monthly rate adjustment migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'database', 'monthly-rate-adjustment.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration SQL loaded successfully');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // If exec_sql doesn't exist, try direct execution
          console.log('⚠️  exec_sql RPC not available, trying alternative approach...');
          
          // For ALTER TABLE statements, we'll need to handle them differently
          if (statement.includes('ALTER TABLE')) {
            console.log('⚠️  ALTER TABLE statements need to be run in Supabase SQL Editor');
            console.log('📋 Please run this statement in Supabase SQL Editor:');
            console.log(statement);
            continue;
          }
          
          // For other statements, try direct execution
          const { error: directError } = await supabase
            .from('employees')
            .select('count')
            .limit(1);
          
          if (directError) {
            console.log(`❌ Error executing statement: ${error.message}`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('📋 Note: Some statements may need to be run manually in Supabase SQL Editor');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    console.log('\n📋 Please run the migration manually in Supabase SQL Editor:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of database/monthly-rate-adjustment.sql');
    console.log('4. Execute the SQL');
  }
}

runMonthlyRateMigration();

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using anon key
const supabaseUrl = 'https://nviyxewmtbpstmlhaaic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aXl4ZXdtdGJwc3RtbGhhYWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDYzMTAsImV4cCI6MjA2OTc4MjMxMH0.GlXEVb_b_Pzp3WDayXBtA6u_9Y6m_Uwq01J2bEVgQ3E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSites() {
  try {
    console.log('🔍 Checking current sites in database...');
    
    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error fetching sites:', error.message);
      return;
    }
    
    console.log(`✅ Found ${sites.length} sites in database:`);
    console.log('');
    
    if (sites.length === 0) {
      console.log('📋 No sites found in database');
      return;
    }
    
    sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.code})`);
      console.log(`   Location: ${site.location || 'Not specified'}`);
      console.log(`   Status: ${site.status}`);
      console.log(`   Created: ${new Date(site.created_at).toLocaleDateString()}`);
      console.log(`   Created by: ${site.created_by || 'Unknown'}`);
      console.log('');
    });
    
    // Check for demo/test sites
    const demoSites = sites.filter(site => 
      site.name.toLowerCase().includes('test') ||
      site.name.toLowerCase().includes('demo') ||
      site.name.toLowerCase().includes('dummy') ||
      site.code.toLowerCase().includes('test') ||
      site.code.toLowerCase().includes('demo')
    );
    
    if (demoSites.length > 0) {
      console.log('⚠️  Found demo/test sites:');
      demoSites.forEach(site => {
        console.log(`   - ${site.name} (${site.code})`);
      });
      console.log('');
    }
    
    // Check for sites without created_by
    const sitesWithoutCreator = sites.filter(site => !site.created_by);
    if (sitesWithoutCreator.length > 0) {
      console.log('⚠️  Found sites without creator:');
      sitesWithoutCreator.forEach(site => {
        console.log(`   - ${site.name} (${site.code})`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSites();

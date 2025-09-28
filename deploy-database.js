const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://vjdsijuyzhhlofmlzexe.supabase.co';
const supabaseKey = 'sb_publishable_GWjtMLOizuTEiRMn9Kn3eg_blxgSnB2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployDatabase() {
  try {
    console.log('🚀 Starting database deployment...');

    // Read migration files
    const migrationDir = path.join(__dirname, 'Supabase', 'Migration');
    const migrationFiles = [
      '001_initial_schema.sql',
      '002_sample_data.sql',
      '003_user_tables.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Reading ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              console.log(`  Executing: ${statement.substring(0, 50)}...`);
              const { error } = await supabase.rpc('exec_sql', { sql: statement });
              if (error) {
                console.error(`  ❌ Error executing statement:`, error);
                // Continue with other statements
              } else {
                console.log(`  ✅ Statement executed successfully`);
              }
            } catch (err) {
              console.error(`  ❌ Error executing statement:`, err);
              // Continue with other statements
            }
          }
        }
      } else {
        console.log(`⚠️  File ${file} not found, skipping...`);
      }
    }

    console.log('✅ Database deployment completed!');
    console.log('🔗 You can now view your database at: https://supabase.com/dashboard/project/vjdsijuyzhhlofmlzexe');

  } catch (error) {
    console.error('❌ Database deployment failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function deployDatabaseDirect() {
  try {
    console.log('🚀 Starting direct database deployment...');

    // Read and execute the complete deployment script
    const deployPath = path.join(__dirname, 'Supabase', 'Migration', 'deploy.sql');
    if (fs.existsSync(deployPath)) {
      const sql = fs.readFileSync(deployPath, 'utf8');
      console.log('📄 Executing deployment script...');
      
      // Note: This is a simplified approach. In practice, you would need to
      // execute each SQL statement individually or use Supabase's migration system
      console.log('⚠️  Note: Direct SQL execution requires Supabase CLI or manual execution');
      console.log('📋 Please copy the SQL from the migration files and execute them in your Supabase dashboard');
      console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/vjdsijuyzhhlofmlzexe');
    }

  } catch (error) {
    console.error('❌ Database deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
if (require.main === module) {
  deployDatabaseDirect();
}

module.exports = { deployDatabase, deployDatabaseDirect };






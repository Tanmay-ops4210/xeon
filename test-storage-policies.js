import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vjdsijuyzhhlofmlzexe.supabase.co';
const supabaseAnonKey = 'sb_publishable_GWjtMLOizuTEiRMn9Kn3eg_blxgSnB2';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStoragePolicies() {
  console.log('🔍 Testing Supabase Storage Policies...\n');

  const buckets = ['event-images', 'profile-pictures', 'banners', 'documents'];
  
  for (const bucket of buckets) {
    console.log(`📦 Testing bucket: ${bucket}`);
    
    try {
      // Test 1: Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.log(`❌ Error accessing storage: ${listError.message}`);
        continue;
      }

      const bucketExists = buckets?.some(b => b.name === bucket);
      if (!bucketExists) {
        console.log(`❌ Bucket '${bucket}' does not exist`);
        continue;
      }

      console.log(`✅ Bucket '${bucket}' exists`);

      // Test 2: Try to list files (tests read policy)
      const { data: files, error: listFilesError } = await supabase.storage
        .from(bucket)
        .list('', { limit: 1 });

      if (listFilesError) {
        console.log(`❌ Read policy issue: ${listFilesError.message}`);
      } else {
        console.log(`✅ Read policy working (found ${files?.length || 0} files)`);
      }

      // Test 3: Try to get public URL (tests public access)
      const testPath = 'test-file.jpg';
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(testPath);
      
      if (urlData?.publicUrl) {
        console.log(`✅ Public URL generation working`);
      } else {
        console.log(`❌ Public URL generation failed`);
      }

    } catch (error) {
      console.log(`❌ Unexpected error testing ${bucket}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }

  // Test 4: Check RLS status
  console.log('🔒 Checking Row Level Security status...');
  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('rowsecurity')
      .eq('tablename', 'objects')
      .eq('schemaname', 'storage');

    if (error) {
      console.log(`❌ Could not check RLS status: ${error.message}`);
    } else if (data && data.length > 0) {
      const rlsEnabled = data[0].rowsecurity;
      console.log(`✅ RLS is ${rlsEnabled ? 'enabled' : 'disabled'} on storage.objects`);
    }
  } catch (error) {
    console.log(`❌ Error checking RLS: ${error.message}`);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. If buckets don\'t exist, create them in Supabase dashboard');
  console.log('2. If read policies fail, run the setup-storage-policies.sql script');
  console.log('3. If RLS is disabled, enable it in Supabase dashboard');
  console.log('4. Test file uploads in your application');
}

// Run the test
testStoragePolicies().catch(console.error);


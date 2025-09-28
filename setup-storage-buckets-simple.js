import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vjdsijuyzhhlofmlzexe.supabase.co';
const supabaseAnonKey = 'sb_publishable_GWjtMLOizuTEiRMn9Kn3eg_blxgSnB2';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStorageBuckets() {
  console.log('🔍 Checking Supabase storage buckets...\n');

  try {
    // List existing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error accessing storage:', error.message);
      console.log('\n📋 Manual Setup Required:');
      console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vjdsijuyzhhlofmlzexe');
      console.log('2. Navigate to Storage section');
      console.log('3. Create the following buckets:');
      console.log('   - event-images (public)');
      console.log('   - profile-pictures (public)');
      console.log('   - banners (public)');
      console.log('   - documents (public)');
      return;
    }

    console.log('📦 Existing buckets:');
    buckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public})`);
    });

    // Check for required buckets
    const requiredBuckets = ['event-images', 'profile-pictures', 'banners', 'documents'];
    const existingBucketNames = buckets?.map(b => b.name) || [];
    
    console.log('\n🔍 Checking for required buckets:');
    const missingBuckets = [];
    
    requiredBuckets.forEach(bucketName => {
      if (existingBucketNames.includes(bucketName)) {
        console.log(`✅ ${bucketName} - exists`);
      } else {
        console.log(`❌ ${bucketName} - missing`);
        missingBuckets.push(bucketName);
      }
    });

    if (missingBuckets.length > 0) {
      console.log('\n📋 Manual Setup Required:');
      console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vjdsijuyzhhlofmlzexe');
      console.log('2. Navigate to Storage section');
      console.log('3. Create the following missing buckets:');
      missingBuckets.forEach(bucket => {
        console.log(`   - ${bucket} (make it public)`);
      });
      console.log('\n4. For each bucket, set the following policies:');
      console.log('   - Allow public read access');
      console.log('   - Allow authenticated users to upload');
    } else {
      console.log('\n🎉 All required storage buckets exist!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkStorageBuckets().catch(console.error);


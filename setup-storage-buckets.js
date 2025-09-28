import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vjdsijuyzhhlofmlzexe.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZHNpanV5emhobG9mbWx6ZXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzQ0MCwiZXhwIjoyMDUwMTczNDQwfQ.YourServiceKeyHere'; // Replace with your actual service key

// Create Supabase client with service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage buckets to create
const buckets = [
  {
    name: 'event-images',
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    name: 'profile-pictures',
    public: true,
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    name: 'banners',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    name: 'documents',
    public: true,
    fileSizeLimit: 20971520, // 20MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
];

async function createStorageBuckets() {
  console.log('🚀 Setting up Supabase storage buckets...\n');

  for (const bucket of buckets) {
    try {
      console.log(`Creating bucket: ${bucket.name}`);
      
      // Check if bucket already exists
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`Error listing buckets: ${listError.message}`);
        continue;
      }

      const bucketExists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (bucketExists) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        continue;
      }

      // Create the bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });

      if (error) {
        console.error(`❌ Error creating bucket '${bucket.name}': ${error.message}`);
      } else {
        console.log(`✅ Successfully created bucket '${bucket.name}'`);
      }
    } catch (error) {
      console.error(`❌ Unexpected error creating bucket '${bucket.name}':`, error);
    }
  }

  console.log('\n🎉 Storage bucket setup complete!');
}

// Run the setup
createStorageBuckets().catch(console.error);

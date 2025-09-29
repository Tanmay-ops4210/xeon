// Debug script to test signup and profile creation
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vjdsijuyzhhlofmlzexe.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZHNpanV5emhobG9mbWx6ZXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzcwNDQsImV4cCI6MjA3MTQ1MzA0NH0.T7pK7N0whtHSkXIXcttNFfyQMqtHlIQbVhYAe7s6UrM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSignup() {
  console.log('🔍 Starting signup debug process...\n');
  
  try {
    // Test 1: Check if user_profiles table exists and is accessible
    console.log('1. Testing user_profiles table access...');
    const { data: tableTest, error: tableError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ user_profiles table access failed:', tableError.message);
      console.log('💡 Solution: Run the fix_user_creation.sql migration');
      return;
    } else {
      console.log('✅ user_profiles table is accessible');
    }

    // Test 2: Check RLS policies
    console.log('\n2. Testing RLS policies...');
    const { data: policyTest, error: policyError } = await supabase
      .rpc('check_user_policies');
    
    if (policyError) {
      console.log('⚠️ RLS policy check failed (this is expected):', policyError.message);
    }

    // Test 3: Test user registration
    console.log('\n3. Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    console.log(`Attempting to register: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'attendee'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Registration failed:', signUpError.message);
      
      if (signUpError.message.includes('relation "user_profiles" does not exist')) {
        console.log('💡 Solution: The user_profiles table is missing. Run the database migration.');
      } else if (signUpError.message.includes('permission denied')) {
        console.log('💡 Solution: RLS policies are blocking user creation. Check the policies.');
      } else if (signUpError.message.includes('trigger')) {
        console.log('💡 Solution: The profile creation trigger is missing or broken.');
      }
      
      return;
    } else {
      console.log('✅ Registration successful');
      console.log('User ID:', signUpData.user?.id);
      console.log('User email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
    }

    // Test 4: Wait and check if profile was created
    console.log('\n4. Waiting for profile creation...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    
    if (signUpData.user?.id) {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message);
        console.log('Error code:', profileError.code);
        console.log('Error details:', profileError.details);
        
        if (profileError.code === 'PGRST116') {
          console.log('💡 Solution: Profile was not created by trigger. Check trigger function.');
        } else if (profileError.message.includes('permission denied')) {
          console.log('💡 Solution: RLS policies are blocking profile access.');
        }
        
        // Try manual profile creation
        console.log('\n5. Attempting manual profile creation...');
        const { data: manualProfile, error: manualError } = await supabase
          .from('user_profiles')
          .insert({
            id: signUpData.user.id,
            email: signUpData.user.email,
            full_name: 'Test User',
            role: 'attendee'
          })
          .select()
          .single();
        
        if (manualError) {
          console.error('❌ Manual profile creation failed:', manualError.message);
          console.log('This confirms RLS or table structure issues');
        } else {
          console.log('✅ Manual profile creation successful:', manualProfile);
        }
      } else {
        console.log('✅ Profile created successfully by trigger:', profileData);
      }
    }

    console.log('\n🎉 Debug complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error during debug:', error);
  }
}

// Run the debug
debugSignup().catch(console.error);
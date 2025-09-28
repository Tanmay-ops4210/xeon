import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vjdsijuyzhhlofmlzexe.supabase.co';
const supabaseKey = 'sb_publishable_GWjtMLOizuTEiRMn9Kn3eg_blxgSnB2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection by fetching from a table
    const { data, error } = await supabase
      .from('events')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }

    console.log('✅ Database connection successful!');
    
    // Test fetching events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(5);

    if (eventsError) {
      console.error('❌ Error fetching events:', eventsError);
      return false;
    }

    console.log(`📊 Found ${events?.length || 0} events in database`);
    
    // Test fetching speakers
    const { data: speakers, error: speakersError } = await supabase
      .from('speakers')
      .select('*')
      .limit(5);

    if (speakersError) {
      console.error('❌ Error fetching speakers:', speakersError);
      return false;
    }

    console.log(`👥 Found ${speakers?.length || 0} speakers in database`);

    // Test fetching blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(5);

    if (blogError) {
      console.error('❌ Error fetching blog posts:', blogError);
      return false;
    }

    console.log(`📝 Found ${blogPosts?.length || 0} blog posts in database`);

    console.log('✅ All database tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Run the test
testDatabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});

export { testDatabaseConnection };

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
  throw new Error('Missing required Supabase environment variables. Please check your .env file or Vercel environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable OAuth URL detection
    flowType: 'pkce', // Use PKCE flow for better security
    debug: import.meta.env.DEV // Enable debug mode in development
  }
})

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('Supabase Configuration:');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing');
}

// Database types (will be updated as we create tables)
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          location: string
          category: string
          status: 'draft' | 'published' | 'cancelled'
          created_at: string
          updated_at: string
          organizer_id?: string
          max_attendees?: number
          price: number
          image_url?: string
          venue_name?: string
          venue_address?: string
          is_online: boolean
          online_link?: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_date: string
          end_date: string
          location: string
          category: string
          status?: 'draft' | 'published' | 'cancelled'
          created_at?: string
          updated_at?: string
          organizer_id?: string
          max_attendees?: number
          price: number
          image_url?: string
          venue_name?: string
          venue_address?: string
          is_online?: boolean
          online_link?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          location?: string
          category?: string
          status?: 'draft' | 'published' | 'cancelled'
          created_at?: string
          updated_at?: string
          organizer_id?: string
          max_attendees?: number
          price?: number
          image_url?: string
          venue_name?: string
          venue_address?: string
          is_online?: boolean
          online_link?: string
        }
      }
      speakers: {
        Row: {
          id: string
          name: string
          bio: string
          title: string
          company: string
          image_url?: string
          social_linkedin?: string
          social_twitter?: string
          social_website?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          bio: string
          title: string
          company: string
          image_url?: string
          social_linkedin?: string
          social_twitter?: string
          social_website?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          bio?: string
          title?: string
          company?: string
          image_url?: string
          social_linkedin?: string
          social_twitter?: string
          social_website?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_speakers: {
        Row: {
          id: string
          event_id: string
          speaker_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          speaker_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          speaker_id?: string
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          author: string
          published_at: string
          created_at: string
          updated_at: string
          image_url?: string
          slug: string
          status: 'draft' | 'published'
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          author: string
          published_at?: string
          created_at?: string
          updated_at?: string
          image_url?: string
          slug: string
          status?: 'draft' | 'published'
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          author?: string
          published_at?: string
          created_at?: string
          updated_at?: string
          image_url?: string
          slug?: string
          status?: 'draft' | 'published'
        }
      }
      sponsors: {
        Row: {
          id: string
          name: string
          logo_url: string
          website_url?: string
          description?: string
          tier: 'platinum' | 'gold' | 'silver' | 'bronze'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url: string
          website_url?: string
          description?: string
          tier: 'platinum' | 'gold' | 'silver' | 'bronze'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string
          website_url?: string
          description?: string
          tier?: 'platinum' | 'gold' | 'silver' | 'bronze'
          created_at?: string
          updated_at?: string
        }
      }
      event_sponsors: {
        Row: {
          id: string
          event_id: string
          sponsor_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          sponsor_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          sponsor_id?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description?: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Typed Supabase client
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)


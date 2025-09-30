import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseConfig';
import { User, Session } from '@supabase/supabase-js';

// Define the user profile shape to match your 'profiles' database table
interface UserProfile {
  id: string;
  full_name: string; // Corrected to match your database schema
  avatar_url: string;
  role: 'attendee' | 'organizer' | 'admin';
}

// Define all the functions and state values the context will provide
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role?: 'attendee' | 'organizer' | 'admin') => Promise<void>;
  register: (email: string, password: string, fullName: string, role: 'attendee' | 'organizer' | 'admin', company?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The provider component that will wrap your app and provide auth state
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an active session when the application first loads
    const getInitialSession = async () => {
      try {
        console.log('Checking initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // If a user is logged in, fetch their profile data
          console.log('Fetching user profile for:', session.user.id);
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError.message);
            console.log('Profile error details:', profileError);
          }
          
          if (userProfile) {
            console.log('User profile loaded:', userProfile);
            setProfile(userProfile);
          } else {
            console.warn('No user profile found for user:', session.user.id);
            console.log('This might indicate a trigger or RLS issue');
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('Auth state change - fetching profile for:', session.user.id);
        
        // If this is a new signup, wait a bit longer for the trigger
        if (event === 'SIGNED_UP') {
          console.log('New signup detected, waiting for profile creation...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile after auth change:', profileError.message);
          console.log('Profile error details:', profileError);
          
          // If profile doesn't exist and this is a signup, try to create it manually
          if (event === 'SIGNED_UP' && profileError.code === 'PGRST116') {
            console.log('Profile not found after signup, attempting manual creation...');
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || '',
                  role: session.user.user_metadata?.role || 'attendee'
                })
                .select()
                .single();
              
              if (createError) {
                console.error('Manual profile creation failed:', createError);
              } else {
                console.log('Manual profile creation successful:', newProfile);
                setProfile(newProfile);
                
                // Also create user role
                await supabase
                  .from('user_roles')
                  .insert({
                    user_id: session.user.id,
                    role: session.user.user_metadata?.role || 'attendee'
                  });
              }
            } catch (manualError) {
              console.error('Manual profile creation error:', manualError);
            }
          }
        }
        
        if (userProfile) {
          console.log('Profile loaded after auth change:', userProfile);
          setProfile(userProfile);
        } else {
          console.warn('No user profile found after auth change for user:', session.user.id);
        }
      } else {
        console.log('No session, clearing profile');
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role?: 'attendee' | 'organizer' | 'admin') => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName: string, role: 'attendee' | 'organizer' | 'admin', company?: string) => {
    try {
      console.log('Starting registration process...', { email, fullName, role });
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            company: company || ''
          }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
        throw error;
      }
      
      console.log('Registration successful, waiting for profile creation...');
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    session,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
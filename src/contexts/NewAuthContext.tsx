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
        
        if (session?.user) {
          // If a user is logged in, fetch their profile data
          console.log('Fetching user profile for:', session.user.id);
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          // --- THIS IS THE FIX ---
          // If there's an error or no profile, the user state is inconsistent.
          // Log them out to prevent an infinite loading loop.
          if (profileError || !userProfile) {
            console.error('Profile not found or error fetching profile. Logging out.', profileError?.message);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setProfile(null);
          } else {
            console.log('User profile loaded:', userProfile);
            setSession(session);
            setUser(session.user);
            setProfile(userProfile);
          }
        } else {
            // No user session found
            setSession(null);
            setUser(null);
            setProfile(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // Ensure loading stops even on unexpected errors
        setSession(null);
        setUser(null);
        setProfile(null);
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
        
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile after auth change:', profileError.message);
          setProfile(null); // Clear profile on error
        } else if (userProfile) {
          console.log('Profile loaded after auth change:', userProfile);
          setProfile(userProfile);
        } else {
          console.warn('No user profile found after auth change for user:', session.user.id);
          setProfile(null);
        }
      } else {
        console.log('No session, clearing profile');
        setProfile(null);
      }
      // Ensure loading is false after any auth change
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role?: 'attendee' | 'organizer' | 'admin') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false); // Stop loading on error
      throw error;
    }
    // setLoading will be handled by onAuthStateChange
  };

  const register = async (email: string, password: string, fullName: string, role: 'attendee' | 'organizer' | 'admin', company?: string) => {
    try {
      setLoading(true);
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
      
      console.log('Registration successful, waiting for auth state change...');
      
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false); // Stop loading on error
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
    isAuthenticated: !!user && !!profile, // Make sure both exist to be authenticated
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

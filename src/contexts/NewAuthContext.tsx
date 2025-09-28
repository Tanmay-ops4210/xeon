import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase'; // Correct path from src/contexts to src/lib
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
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // If a user is logged in, fetch their profile data
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for authentication events (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    
    // Clean up the listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- REAL AUTHENTICATION FUNCTIONS ---

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, fullName: string, role: 'attendee' | 'organizer' | 'admin') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass user metadata to be used by the database trigger
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // --- END AUTHENTICATION FUNCTIONS ---

  const value = {
    user,
    profile,
    session,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for easy access to auth state in your components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

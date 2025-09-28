import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Define the shape of the user profile to match your 'profiles' table
interface UserProfile {
  id: string;
  full_name: string; // Corrected from 'username' to match your database schema
  avatar_url: string;
  role: 'attendee' | 'organizer' | 'admin';
}

// Define the shape of all the functions and state in the context
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

// The provider component that makes auth available to the whole app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Checks for an active session when the app loads
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetches the user's profile if they are logged in
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

    // Listens for login/logout events
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
    
    // Cleanup listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- ADDED REAL AUTH FUNCTIONS ---

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, fullName: string, role: 'attendee' | 'organizer' | 'admin') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // This data is used by the database trigger
          role: role,
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // --- END ADDED FUNCTIONS ---

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

// Custom hook for easy access to the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

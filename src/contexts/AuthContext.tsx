import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication context provider that manages user state and auth operations
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Ensure a user profile exists in the database after authentication
  const ensureProfileExists = async (user: User) => {
    if (!user) return;

    try {
      console.log('AuthContext: Checking if profile exists for user:', user.id);
      // Check if profile already exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('AuthContext: Profile does not exist, creating...');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
          });
        if (insertError) {
          console.error('AuthContext: Error creating profile:', insertError);
        } else {
          console.log('AuthContext: Profile created successfully');
        }
      } else if (error) {
        console.error('AuthContext: Error checking profile:', error);
      } else {
        console.log('AuthContext: Profile already exists');
      }
    } catch (err) {
      console.error('AuthContext: Unexpected error in ensureProfileExists:', err);
    }
  };

  // Initialize authentication state and set up auth state listener
  useEffect(() => {
    // Get initial session on app load
    const getSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthContext: Error getting session:', error);
          setLoading(false);
          return;
        }
        console.log('AuthContext: Session retrieved:', session ? 'authenticated' : 'no session');
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('AuthContext: Ensuring profile exists for user:', session.user.id);
          await ensureProfileExists(session.user);
        }
        setLoading(false);
        console.log('AuthContext: Loading set to false');
      } catch (err) {
        console.error('AuthContext: Unexpected error in getSession:', err);
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state change:', _event, 'user:', session?.user?.id);
        setUser(session?.user ?? null);
        if (session?.user) {
          await ensureProfileExists(session.user);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign up with email, password, and full name
  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectTo = (import.meta as any).env.VITE_SITE_URL || 'http://localhost:5173';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) {
      if (error.status === 429) {
        throw new Error('Too many sign-up attempts. Please wait a few minutes before trying again.');
      } else {
        throw error;
      }
    }

    return data;
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) throw error;
    return data;
  };

  // Sign out current user
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
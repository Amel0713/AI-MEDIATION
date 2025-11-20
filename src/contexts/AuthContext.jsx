import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication context provider that manages user state and auth operations
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ensure a user profile exists in the database after authentication
  const ensureProfileExists = async (user) => {
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
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign up with email, password, and full name
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
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
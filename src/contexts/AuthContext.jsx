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

    // Check if profile already exists
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist (PGRST116 = no rows), create it
    if (error && error.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
        });
      if (insertError) console.error('Error creating profile:', insertError);
    }
  };

  // Initialize authentication state and set up auth state listener
  useEffect(() => {
    // Get initial session on app load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await ensureProfileExists(session.user);
      }
      setLoading(false);
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
    const redirectTo = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        redirectTo,
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
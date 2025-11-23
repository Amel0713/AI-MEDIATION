/* eslint-disable @typescript-eslint/no-explicit-any, curly, react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { logger } from '../utils/logger';

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

    logger.debug('Starting ensureProfileExists', { userId: user.id });

    try {
      // Check if profile already exists
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist (PGRST116 = no rows), create it
      if (error && error.code === 'PGRST116') {
        logger.debug('Profile not found, creating new profile', { userId: user.id });
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
          })
          .select();
        if (insertError) {
          logger.error('Failed to create user profile', { userId: user.id, error: insertError.message });
        } else {
          logger.info('User profile created successfully', { userId: user.id });
        }
      } else if (!error) {
        logger.debug('User profile already exists', { userId: user.id });
      } else {
        logger.warn('Unexpected error checking profile', { userId: user.id, error: error.message });
      }
    } catch (err) {
      logger.error('Exception in ensureProfileExists', { userId: user.id, error: err });
    }
  };

  // Initialize authentication state and set up auth state listener
  useEffect(() => {
    // Get initial session on app load
    const getSession = async () => {
      logger.debug('Getting initial session');
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        logger.debug('Ensuring profile exists for session user', { userId: session.user.id });
        await ensureProfileExists(session.user);
      }
      setLoading(false);
      logger.info('Initial session loaded', { hasUser: !!session?.user });
    };

    getSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        logger.info('Auth state changed', { event: _event, hasSession: !!session, userId: session?.user?.id });
        setUser(session?.user ?? null);
        if (session?.user) {
          logger.debug('Ensuring profile exists for auth state change', { userId: session.user.id });
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
    logger.info('Sign in attempt', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      logger.info('Sign in successful', { userId: data?.user?.id, email });
      return data;
    } catch (error) {
      logger.error('Sign in failed', { email, error: (error as Error).message });
      throw error;
    }
  };

  // Sign up with email, password, and full name
  const signUp = async (email: string, password: string, fullName: string) => {
    logger.info('Sign up attempt', { email, fullName });
    try {
      const redirectTo = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
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
      logger.info('Sign up successful', { userId: data?.user?.id, email, fullName });
      return data;
    } catch (error) {
      logger.error('Sign up failed', { email, fullName, error: (error as Error).message });
      throw error;
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    logger.info('Google sign in attempt');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      logger.info('Google sign in initiated successfully');
      return data;
    } catch (error) {
      logger.error('Google sign in failed', { error: (error as Error).message });
      throw error;
    }
  };

  // Sign out current user
  const signOut = async () => {
    logger.info('Sign out attempt', { userId: user?.id });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      logger.info('Sign out successful', { userId: user?.id });
    } catch (error) {
      logger.error('Sign out failed', { userId: user?.id, error: (error as Error).message });
      throw error;
    }
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
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

    console.log({
      timestamp: new Date().toISOString(),
      userId: user.id,
      operation: 'ensureProfileExists',
      status: 'start',
    });

    console.log({
      timestamp: new Date().toISOString(),
      userId: user.id,
      operation: 'ensureProfileExists',
      status: 'beforeProfileSelect',
    });
    const startTime = Date.now();
    // Check if profile already exists
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    const endTime = Date.now();
    console.log({
      timestamp: new Date().toISOString(),
      userId: user.id,
      operation: 'ensureProfileExists',
      status: 'afterProfileSelect',
      duration: endTime - startTime,
      error: error?.message,
      errorCode: error?.code,
    });

    // If profile doesn't exist (PGRST116 = no rows), create it
    if (error && error.code === 'PGRST116') {
      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'ensureProfileExists',
        status: 'beforeProfileInsert',
      });
      const insertStart = Date.now();
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
        });
      const insertEnd = Date.now();
      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'ensureProfileExists',
        status: 'afterProfileInsert',
        duration: insertEnd - insertStart,
        insertError: insertError?.message,
      });
      if (insertError) {
        console.log({
          timestamp: new Date().toISOString(),
          userId: user.id,
          operation: 'ensureProfileExists',
          status: 'error',
          error: insertError.message,
        });
      }
    } else {
      console.log({
        timestamp: new Date().toISOString(),
        userId: user.id,
        operation: 'ensureProfileExists',
        status: 'profileExists',
        error: error?.message,
      });
    }

    console.log({
      timestamp: new Date().toISOString(),
      userId: user.id,
      operation: 'ensureProfileExists',
      status: 'end',
    });
  };

  // Initialize authentication state and set up auth state listener
  useEffect(() => {
    // Get initial session on app load
    const getSession = async () => {
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'getSession',
        status: 'start',
        loading: loading,
      });
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log({
          timestamp: new Date().toISOString(),
          operation: 'getSession',
          status: 'beforeEnsureProfile',
          loading: loading,
        });
        await ensureProfileExists(session.user);
        console.log({
          timestamp: new Date().toISOString(),
          operation: 'getSession',
          status: 'afterEnsureProfile',
          loading: loading,
        });
      }
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'getSession',
        status: 'beforeSetLoadingFalse',
        loading: loading,
      });
      setLoading(false);
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'getSession',
        status: 'afterSetLoadingFalse',
        loading: false,
      });
    };

    getSession();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log({
          timestamp: new Date().toISOString(),
          userId: session?.user?.id,
          operation: 'authStateChange',
          event: _event,
          hasSession: !!session,
          loading: loading,
        });
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log({
            timestamp: new Date().toISOString(),
            userId: session?.user?.id,
            operation: 'authStateChange',
            status: 'beforeEnsureProfile',
            loading: loading,
          });
          await ensureProfileExists(session.user);
          console.log({
            timestamp: new Date().toISOString(),
            userId: session?.user?.id,
            operation: 'authStateChange',
            status: 'afterEnsureProfile',
            loading: loading,
          });
        }
        console.log({
          timestamp: new Date().toISOString(),
          userId: session?.user?.id,
          operation: 'authStateChange',
          status: 'beforeSetLoadingFalse',
          loading: loading,
        });
        setLoading(false);
        console.log({
          timestamp: new Date().toISOString(),
          userId: session?.user?.id,
          operation: 'authStateChange',
          status: 'afterSetLoadingFalse',
          loading: false,
        });
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    console.log({
      timestamp: new Date().toISOString(),
      operation: 'signIn',
      status: 'attempt',
      email: email, // Note: email is not sensitive, but password is not logged
    });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      console.log({
        timestamp: new Date().toISOString(),
        userId: data?.user?.id,
        operation: 'signIn',
        status: 'success',
        email: email,
      });
      return data;
    } catch (error) {
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'signIn',
        status: 'failure',
        email: email,
        error: error.message,
      });
      throw error;
    }
  };

  // Sign up with email, password, and full name
  const signUp = async (email, password, fullName) => {
    console.log({
      timestamp: new Date().toISOString(),
      operation: 'signUp',
      status: 'attempt',
      email: email,
      fullName: fullName,
    });
    try {
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
      console.log({
        timestamp: new Date().toISOString(),
        userId: data?.user?.id,
        operation: 'signUp',
        status: 'success',
        email: email,
        fullName: fullName,
      });
      return data;
    } catch (error) {
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'signUp',
        status: 'failure',
        email: email,
        fullName: fullName,
        error: error.message,
      });
      throw error;
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    console.log({
      timestamp: new Date().toISOString(),
      operation: 'signInWithGoogle',
      status: 'attempt',
    });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'signInWithGoogle',
        status: 'success',
      });
      return data;
    } catch (error) {
      console.log({
        timestamp: new Date().toISOString(),
        operation: 'signInWithGoogle',
        status: 'failure',
        error: error.message,
      });
      throw error;
    }
  };

  // Sign out current user
  const signOut = async () => {
    console.log({
      timestamp: new Date().toISOString(),
      userId: user?.id,
      operation: 'signOut',
      status: 'attempt',
    });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log({
        timestamp: new Date().toISOString(),
        userId: user?.id,
        operation: 'signOut',
        status: 'success',
      });
    } catch (error) {
      console.log({
        timestamp: new Date().toISOString(),
        userId: user?.id,
        operation: 'signOut',
        status: 'failure',
        error: error.message,
      });
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
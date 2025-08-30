import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import SupabaseService from '../services/supabaseService';

/**
 * Custom hook for Supabase authentication and data
 * @returns {Object} Supabase authentication and data methods
 */
export const useSupabase = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Set up auth state listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        setError(error);
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  /**
   * Sign in with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Auth response
   */
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      setError(error);
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} Auth response
   */
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      setError(error);
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
    } catch (error) {
      setError(error);
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password for a user
   * @param {string} email - User's email
   * @returns {Promise<Object>} Reset response
   */
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      setError(error);
      console.error('Error resetting password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update the current user's password
   * @param {string} password - New password
   * @returns {Promise<Object>} Update response
   */
  const updatePassword = async (password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      setError(error);
      console.error('Error updating password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update the current user's profile
   * @param {Object} profile - Profile data to update
   * @returns {Promise<Object>} Update response
   */
  const updateProfile = async (profile) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) throw new Error('User not authenticated');
      
      // Update auth metadata if needed
      if (profile.email || profile.password) {
        const { error } = await supabase.auth.updateUser({
          email: profile.email,
          password: profile.password,
          data: {
            full_name: profile.full_name,
          },
        });
        
        if (error) throw error;
      }
      
      // Update profile in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          location: profile.location,
          preferences: profile.preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      setError(error);
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get the current user's profile
   * @returns {Promise<Object>} User profile
   */
  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      setError(error);
      console.error('Error getting profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    getProfile,
    // Include SupabaseService methods
    ...SupabaseService,
  };
};

export default useSupabase;


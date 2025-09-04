import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} The user object or null if not authenticated
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} The authentication response
 */
export const signInWithEmail = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} The authentication response
 */
export const signUpWithEmail = async (email, password) => {
  return await supabase.auth.signUp({
    email,
    password,
  });
};

/**
 * Sign out the current user
 * @returns {Promise<Object>} The sign out response
 */
export const signOut = async () => {
  return await supabase.auth.signOut();
};

/**
 * Update the current user's profile
 * @param {Object} profile - The profile data to update
 * @returns {Promise<Object>} The update response
 */
export const updateUserProfile = async (profile) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');
  
  return await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    });
};

export default supabase;


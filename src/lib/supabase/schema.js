/**
 * Supabase Database Schema
 * 
 * This file documents the database schema used in the application.
 * It can be used as a reference for creating tables in Supabase.
 */

/**
 * SQL for creating the profiles table
 * Stores user profile information
 */
export const profilesTableSQL = `
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
`;

/**
 * SQL for creating the locations table
 * Stores information about places (restaurants, bars, etc.)
 */
export const locationsTableSQL = `
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  rating NUMERIC,
  price_level INTEGER,
  hours JSONB,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Locations are viewable by everyone"
  ON locations FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert locations"
  ON locations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update locations"
  ON locations FOR UPDATE
  USING (auth.role() = 'authenticated');
`;

/**
 * SQL for creating the recommendations table
 * Stores curated recommendations from social media
 */
export const recommendationsTableSQL = `
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  vibe TEXT,
  tags TEXT[],
  rating NUMERIC,
  trending BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Recommendations are viewable by everyone"
  ON recommendations FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update recommendations"
  ON recommendations FOR UPDATE
  USING (auth.role() = 'authenticated');
`;

/**
 * SQL for creating the sources table
 * Stores original social media posts that generated recommendations
 */
export const sourcesTableSQL = `
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  platform_id TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT,
  author_username TEXT,
  content TEXT,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(platform, platform_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Sources are viewable by everyone"
  ON sources FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert sources"
  ON sources FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update sources"
  ON sources FOR UPDATE
  USING (auth.role() = 'authenticated');
`;

/**
 * SQL for creating the user_favorites table
 * Stores user favorite recommendations
 */
export const userFavoritesTableSQL = `
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recommendation_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);
`;

/**
 * SQL for creating the user_history table
 * Stores user view history
 */
export const userHistoryTableSQL = `
CREATE TABLE user_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own history"
  ON user_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
  ON user_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own history"
  ON user_history FOR DELETE
  USING (auth.uid() = user_id);
`;

/**
 * Complete database schema as a single string
 * This can be used to initialize the database
 */
export const completeSchema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

${profilesTableSQL}

${locationsTableSQL}

${sourcesTableSQL}

${recommendationsTableSQL}

${userFavoritesTableSQL}

${userHistoryTableSQL}
`;

export default {
  profilesTableSQL,
  locationsTableSQL,
  recommendationsTableSQL,
  sourcesTableSQL,
  userFavoritesTableSQL,
  userHistoryTableSQL,
  completeSchema
};


# Database Schema

This document describes the database schema used in the LocalVibe AI application.

## Tables

### profiles

Stores user profile information.

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key, references auth.users(id) |
| username | TEXT | Unique username |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | URL to user's avatar image |
| location | TEXT | User's location |
| preferences | JSONB | User preferences as JSON |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `username`

**Row Level Security (RLS):**
- Public profiles are viewable by everyone
- Users can insert their own profile
- Users can update their own profile

### locations

Stores information about places (restaurants, bars, etc.).

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key |
| name | TEXT | Name of the location |
| type | TEXT | Type of location (restaurant, bar, cafe, etc.) |
| latitude | NUMERIC | Latitude coordinate |
| longitude | NUMERIC | Longitude coordinate |
| address | TEXT | Street address |
| city | TEXT | City |
| state | TEXT | State or province |
| country | TEXT | Country |
| postal_code | TEXT | Postal code |
| phone | TEXT | Phone number |
| website | TEXT | Website URL |
| rating | NUMERIC | Average rating |
| price_level | INTEGER | Price level (1-4) |
| hours | JSONB | Opening hours as JSON |
| photos | TEXT[] | Array of photo URLs |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `type`
- Index on `(latitude, longitude)`

**Row Level Security (RLS):**
- Locations are viewable by everyone
- Only authenticated users can insert locations
- Only authenticated users can update locations

### sources

Stores original social media posts that generated recommendations.

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key |
| platform | TEXT | Social media platform (e.g., farcaster) |
| platform_id | TEXT | ID of the post on the platform |
| author_id | TEXT | ID of the author on the platform |
| author_name | TEXT | Name of the author |
| author_username | TEXT | Username of the author |
| content | TEXT | Content of the post |
| url | TEXT | URL to the original post |
| published_at | TIMESTAMP WITH TIME ZONE | Publication timestamp |
| metadata | JSONB | Additional metadata as JSON |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `(platform, platform_id)`
- Index on `author_id`
- Index on `published_at`

**Row Level Security (RLS):**
- Sources are viewable by everyone
- Only authenticated users can insert sources
- Only authenticated users can update sources

### recommendations

Stores curated recommendations from social media.

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key |
| location_id | UUID | References locations(id) |
| source_id | UUID | References sources(id) |
| user_id | UUID | References auth.users(id) |
| title | TEXT | Title of the recommendation |
| description | TEXT | Description of the recommendation |
| vibe | TEXT | Atmosphere or vibe |
| tags | TEXT[] | Array of tags |
| rating | NUMERIC | Rating (1-5) |
| trending | BOOLEAN | Whether the recommendation is trending |
| verified | BOOLEAN | Whether the recommendation is verified |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `location_id`
- Foreign key index on `source_id`
- Foreign key index on `user_id`
- Index on `trending`
- Index on `tags`

**Row Level Security (RLS):**
- Recommendations are viewable by everyone
- Only authenticated users can insert recommendations
- Only authenticated users can update recommendations

### user_favorites

Stores user favorite recommendations.

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key |
| user_id | UUID | References auth.users(id) |
| recommendation_id | UUID | References recommendations(id) |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Foreign key index on `recommendation_id`
- Unique index on `(user_id, recommendation_id)`

**Row Level Security (RLS):**
- Users can view their own favorites
- Users can insert their own favorites
- Users can delete their own favorites

### user_history

Stores user view history.

| Column | Type | Description |
| ------ | ---- | ----------- |
| id | UUID | Primary key |
| user_id | UUID | References auth.users(id) |
| recommendation_id | UUID | References recommendations(id) |
| viewed_at | TIMESTAMP WITH TIME ZONE | Timestamp when viewed |

**Indexes:**
- Primary key on `id`
- Foreign key index on `user_id`
- Foreign key index on `recommendation_id`
- Index on `viewed_at`

**Row Level Security (RLS):**
- Users can view their own history
- Users can insert their own history
- Users can delete their own history

## Relationships

- `profiles` has a one-to-one relationship with `auth.users`
- `recommendations` has a many-to-one relationship with `locations`
- `recommendations` has a many-to-one relationship with `sources`
- `recommendations` has a many-to-one relationship with `auth.users`
- `user_favorites` has a many-to-one relationship with `auth.users`
- `user_favorites` has a many-to-one relationship with `recommendations`
- `user_history` has a many-to-one relationship with `auth.users`
- `user_history` has a many-to-one relationship with `recommendations`

## Triggers

### updated_at Trigger

A trigger is set up on all tables to automatically update the `updated_at` column whenever a row is updated.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Similar triggers for other tables
```

## Functions

### get_recommendations_by_location

A function to get recommendations near a specific location.

```sql
CREATE OR REPLACE FUNCTION get_recommendations_by_location(
  lat NUMERIC,
  lng NUMERIC,
  radius NUMERIC DEFAULT 5000,
  limit_count INTEGER DEFAULT 20
)
RETURNS SETOF recommendations AS $$
BEGIN
  RETURN QUERY
  SELECT r.*
  FROM recommendations r
  JOIN locations l ON r.location_id = l.id
  WHERE ST_DWithin(
    ST_MakePoint(l.longitude, l.latitude)::geography,
    ST_MakePoint(lng, lat)::geography,
    radius
  )
  ORDER BY
    r.trending DESC,
    r.rating DESC,
    r.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### search_recommendations

A function to search for recommendations by keyword.

```sql
CREATE OR REPLACE FUNCTION search_recommendations(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20
)
RETURNS SETOF recommendations AS $$
BEGIN
  RETURN QUERY
  SELECT r.*
  FROM recommendations r
  JOIN locations l ON r.location_id = l.id
  LEFT JOIN sources s ON r.source_id = s.id
  WHERE
    to_tsvector('english', l.name || ' ' || r.title || ' ' || r.description || ' ' || COALESCE(s.content, '')) @@ to_tsquery('english', search_query)
    OR l.name ILIKE '%' || search_query || '%'
    OR r.title ILIKE '%' || search_query || '%'
    OR r.description ILIKE '%' || search_query || '%'
    OR search_query = ANY(r.tags)
  ORDER BY
    r.trending DESC,
    r.rating DESC,
    r.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

## Indexes

In addition to the indexes mentioned in the table descriptions, the following indexes are created to improve query performance:

```sql
-- Full-text search indexes
CREATE INDEX recommendations_title_description_idx ON recommendations USING GIN (to_tsvector('english', title || ' ' || description));
CREATE INDEX locations_name_idx ON locations USING GIN (to_tsvector('english', name));
CREATE INDEX sources_content_idx ON sources USING GIN (to_tsvector('english', content));

-- Spatial index for location queries
CREATE INDEX locations_geom_idx ON locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
```

## Policies

Row Level Security (RLS) policies are implemented to ensure data security. Here are some examples:

```sql
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Recommendations
CREATE POLICY "Recommendations are viewable by everyone"
  ON recommendations FOR SELECT
  USING (true);

CREATE POLICY "Only authenticated users can insert recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update recommendations"
  ON recommendations FOR UPDATE
  USING (auth.role() = 'authenticated');

-- User Favorites
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);
```


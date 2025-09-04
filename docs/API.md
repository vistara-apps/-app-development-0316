# API Documentation

This document provides information about the external APIs used in the LocalVibe AI application.

## Table of Contents

1. [OpenRouter LLM API](#openrouter-llm-api)
2. [Farcaster Neynar API](#farcaster-neynar-api)
3. [Supabase API](#supabase-api)

## OpenRouter LLM API

OpenRouter provides access to various large language models (LLMs) through a unified API.

### Authentication

OpenRouter requires an API key for authentication. The API key should be set in the environment variable `VITE_OPENROUTER_API_KEY`.

### Base URL

```
https://openrouter.ai/api/v1
```

### Endpoints

#### Text Completion

```
POST /completions
```

Generate text completions from a prompt.

**Request Body:**

```json
{
  "model": "anthropic/claude-3-opus",
  "prompt": "Extract location information from this text: ...",
  "max_tokens": 1000,
  "temperature": 0.7,
  "headers": {
    "HTTP-Referer": "https://yourdomain.com",
    "X-Title": "LocalVibe AI"
  }
}
```

**Response:**

```json
{
  "id": "completion-id",
  "object": "completion",
  "created": 1625097587,
  "model": "anthropic/claude-3-opus",
  "choices": [
    {
      "text": "Generated text...",
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

#### Chat Completion

```
POST /chat/completions
```

Generate chat completions from a series of messages.

**Request Body:**

```json
{
  "model": "anthropic/claude-3-opus",
  "messages": [
    {
      "role": "system",
      "content": "You are a location extraction assistant..."
    },
    {
      "role": "user",
      "content": "Extract location information from this text: ..."
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7,
  "headers": {
    "HTTP-Referer": "https://yourdomain.com",
    "X-Title": "LocalVibe AI"
  }
}
```

**Response:**

```json
{
  "id": "chat-completion-id",
  "object": "chat.completion",
  "created": 1625097587,
  "model": "anthropic/claude-3-opus",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Generated response..."
      },
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Implementation

The OpenRouter API is implemented in the `src/services/openRouterService.js` file. The service provides methods for generating completions and chat completions, as well as specialized methods for extracting location information and analyzing social media posts.

## Farcaster Neynar API

Neynar provides access to Farcaster data through a REST API.

### Authentication

Neynar requires an API key for authentication. The API key should be set in the environment variable `VITE_NEYNAR_API_KEY`.

### Base URL

```
https://api.neynar.com/v2
```

### Endpoints

#### Fetch Feed

```
GET /feed
```

Fetch a feed of casts based on various criteria.

**Query Parameters:**

- `feed_type`: Type of feed to fetch (e.g., `filter`)
- `filter_type`: Type of filter to apply (e.g., `trending_24h`)
- `limit`: Maximum number of casts to return
- `cursor`: Cursor for pagination

**Response:**

```json
{
  "casts": [
    {
      "hash": "cast-hash",
      "text": "Cast text...",
      "timestamp": "2023-01-01T00:00:00Z",
      "author": {
        "fid": "user-fid",
        "username": "username",
        "displayName": "Display Name"
      },
      "reactions": {
        "count": 10
      },
      "replies": {
        "count": 5
      },
      "recasts": {
        "count": 3
      }
    }
  ],
  "next": {
    "cursor": "next-cursor"
  }
}
```

#### Search Casts

```
GET /search/casts
```

Search for casts based on a query.

**Query Parameters:**

- `q`: Search query
- `limit`: Maximum number of casts to return
- `cursor`: Cursor for pagination

**Response:**

```json
{
  "casts": [
    {
      "hash": "cast-hash",
      "text": "Cast text...",
      "timestamp": "2023-01-01T00:00:00Z",
      "author": {
        "fid": "user-fid",
        "username": "username",
        "displayName": "Display Name"
      }
    }
  ],
  "next": {
    "cursor": "next-cursor"
  }
}
```

#### Fetch User Casts

```
GET /user-casts
```

Fetch casts from a specific user.

**Query Parameters:**

- `fid`: Farcaster user ID
- `limit`: Maximum number of casts to return
- `cursor`: Cursor for pagination

**Response:**

```json
{
  "casts": [
    {
      "hash": "cast-hash",
      "text": "Cast text...",
      "timestamp": "2023-01-01T00:00:00Z",
      "author": {
        "fid": "user-fid",
        "username": "username",
        "displayName": "Display Name"
      }
    }
  ],
  "next": {
    "cursor": "next-cursor"
  }
}
```

### Implementation

The Neynar API is implemented in the `src/services/neynarService.js` file. The service provides methods for fetching casts, searching for casts, and filtering casts for local recommendations.

## Supabase API

Supabase provides a PostgreSQL database with a REST API and real-time capabilities.

### Authentication

Supabase requires a URL and an anonymous key for authentication. These should be set in the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Database Schema

The database schema is defined in the `src/lib/supabase/schema.js` file. The schema includes tables for users, locations, recommendations, sources, user favorites, and user history.

### Endpoints

Supabase provides a REST API for interacting with the database. The API is automatically generated based on the database schema.

#### Authentication

```
POST /auth/v1/token
```

Sign in with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "access_token": "access-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

#### Database

Supabase provides a REST API for each table in the database. For example:

```
GET /rest/v1/recommendations
```

Fetch recommendations.

**Query Parameters:**

- `select`: Fields to select
- `order`: Order by field
- `limit`: Maximum number of records to return
- `offset`: Offset for pagination

**Response:**

```json
[
  {
    "id": "recommendation-id",
    "location_id": "location-id",
    "source_id": "source-id",
    "title": "Recommendation title",
    "description": "Recommendation description",
    "vibe": "Recommendation vibe",
    "tags": ["tag1", "tag2"],
    "rating": 4.5,
    "trending": true,
    "verified": false,
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Real-time

Supabase provides real-time capabilities through WebSockets. The real-time API allows subscribing to changes in the database.

```javascript
const subscription = supabase
  .channel('recommendations-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'recommendations'
    },
    (payload) => {
      // Handle changes
    }
  )
  .subscribe();
```

### Implementation

The Supabase API is implemented in the `src/lib/supabase/client.js` and `src/services/supabaseService.js` files. The service provides methods for authentication, data fetching, and real-time updates.


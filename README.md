# LocalVibe AI

LocalVibe AI is an application that uses AI to monitor social media for local recommendations. The app processes data from Farcaster using the Neynar API, analyzes it with OpenRouter LLM APIs, and stores curated data in Supabase.

## Features

- Real-time social media monitoring for local recommendations
- AI-powered analysis of social media posts to extract location information
- Interactive map interface to explore recommendations
- Filtering by category (restaurants, bars, cafes, etc.)
- User authentication and saved preferences

## Tech Stack

- React + Vite for the frontend
- Tailwind CSS for styling
- Supabase for database and authentication
- OpenRouter LLM APIs for AI processing
- Neynar API for Farcaster data

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- OpenRouter API key
- Neynar API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_OPENROUTER_API_KEY`: Your OpenRouter API key
- `VITE_OPENROUTER_MODEL`: Your preferred OpenRouter model
- `VITE_NEYNAR_API_KEY`: Your Neynar API key
- `VITE_APP_URL`: Your app URL (default: http://localhost:5173)

## Database Schema

The application uses the following tables in Supabase:

- `users`: User profiles and preferences
- `locations`: Places with coordinates and metadata
- `recommendations`: Curated recommendations from social media
- `sources`: Original social media posts that generated recommendations

## API Integrations

### Supabase

Used for:
- User authentication
- Data storage
- Real-time updates

### OpenRouter LLM

Used for:
- Analyzing social media posts
- Extracting location information
- Generating recommendations

### Neynar API

Used for:
- Fetching Farcaster data
- Monitoring social media in real-time
- Filtering relevant posts

## License

MIT


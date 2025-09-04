import { NeynarAPIClient } from '@neynar/nodejs-sdk';

// Initialize Neynar client
const neynarApiKey = import.meta.env.VITE_NEYNAR_API_KEY;
const neynarClient = new NeynarAPIClient({ apiKey: neynarApiKey });

/**
 * Service for interacting with the Neynar API to fetch Farcaster data
 */
export const NeynarService = {
  /**
   * Fetch trending casts from Farcaster
   * @param {Object} options - Options for fetching casts
   * @param {number} options.limit - Maximum number of casts to fetch
   * @param {string} options.cursor - Cursor for pagination
   * @returns {Promise<Object>} Trending casts and pagination info
   */
  async getTrendingCasts({ limit = 20, cursor = null } = {}) {
    try {
      const response = await neynarClient.fetchFeed({
        feed_type: 'filter',
        filter_type: 'trending_24h',
        limit,
        cursor,
      });
      
      return {
        casts: response.casts,
        next: response.next ? { cursor: response.next.cursor } : null,
      };
    } catch (error) {
      console.error('Error fetching trending casts:', error);
      throw error;
    }
  },

  /**
   * Search for casts by query
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {number} options.limit - Maximum number of results
   * @param {string} options.cursor - Cursor for pagination
   * @returns {Promise<Object>} Search results and pagination info
   */
  async searchCasts({ query, limit = 20, cursor = null } = {}) {
    try {
      const response = await neynarClient.searchCasts({
        q: query,
        limit,
        cursor,
      });
      
      return {
        casts: response.casts,
        next: response.next ? { cursor: response.next.cursor } : null,
      };
    } catch (error) {
      console.error('Error searching casts:', error);
      throw error;
    }
  },

  /**
   * Fetch casts by location
   * @param {Object} options - Location options
   * @param {string} options.location - Location name (e.g., "San Francisco")
   * @param {number} options.limit - Maximum number of results
   * @param {string} options.cursor - Cursor for pagination
   * @returns {Promise<Object>} Casts and pagination info
   */
  async getCastsByLocation({ location, limit = 20, cursor = null } = {}) {
    try {
      // Search for casts mentioning the location
      const response = await this.searchCasts({
        query: location,
        limit,
        cursor,
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching casts by location:', error);
      throw error;
    }
  },

  /**
   * Fetch casts by user
   * @param {Object} options - User options
   * @param {string} options.fid - Farcaster user ID
   * @param {number} options.limit - Maximum number of results
   * @param {string} options.cursor - Cursor for pagination
   * @returns {Promise<Object>} Casts and pagination info
   */
  async getCastsByUser({ fid, limit = 20, cursor = null } = {}) {
    try {
      const response = await neynarClient.fetchUserCasts({
        fid,
        limit,
        cursor,
      });
      
      return {
        casts: response.casts,
        next: response.next ? { cursor: response.next.cursor } : null,
      };
    } catch (error) {
      console.error('Error fetching casts by user:', error);
      throw error;
    }
  },

  /**
   * Fetch user profile by FID
   * @param {string} fid - Farcaster user ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(fid) {
    try {
      const response = await neynarClient.lookupUserByFid(fid);
      return response.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Fetch user profile by username
   * @param {string} username - Farcaster username
   * @returns {Promise<Object>} User profile
   */
  async getUserByUsername(username) {
    try {
      const response = await neynarClient.lookupUserByUsername(username);
      return response.user;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  },

  /**
   * Fetch cast by hash
   * @param {string} hash - Cast hash
   * @returns {Promise<Object>} Cast details
   */
  async getCastByHash(hash) {
    try {
      const response = await neynarClient.lookupCastByHash(hash);
      return response.cast;
    } catch (error) {
      console.error('Error fetching cast by hash:', error);
      throw error;
    }
  },

  /**
   * Fetch replies to a cast
   * @param {Object} options - Reply options
   * @param {string} options.hash - Parent cast hash
   * @param {number} options.limit - Maximum number of results
   * @param {string} options.cursor - Cursor for pagination
   * @returns {Promise<Object>} Replies and pagination info
   */
  async getReplies({ hash, limit = 20, cursor = null } = {}) {
    try {
      const response = await neynarClient.fetchReplies({
        hash,
        limit,
        cursor,
      });
      
      return {
        casts: response.casts,
        next: response.next ? { cursor: response.next.cursor } : null,
      };
    } catch (error) {
      console.error('Error fetching replies:', error);
      throw error;
    }
  },

  /**
   * Filter casts for local recommendations
   * @param {Array} casts - Array of casts to filter
   * @param {Object} options - Filter options
   * @param {string} options.location - Location to filter by
   * @param {Array} options.keywords - Keywords to look for (e.g., ["restaurant", "bar", "cafe"])
   * @returns {Array} Filtered casts that likely contain local recommendations
   */
  filterLocalRecommendations(casts, { location, keywords = [] } = {}) {
    if (!casts || !casts.length) return [];
    
    // Convert location and keywords to lowercase for case-insensitive matching
    const locationLower = location ? location.toLowerCase() : null;
    const keywordsLower = keywords.map(k => k.toLowerCase());
    
    // Filter casts that mention the location and at least one keyword
    return casts.filter(cast => {
      const text = cast.text.toLowerCase();
      
      // Check if the cast mentions the location
      const mentionsLocation = !locationLower || text.includes(locationLower);
      
      // Check if the cast mentions any of the keywords
      const mentionsKeyword = keywordsLower.length === 0 || 
        keywordsLower.some(keyword => text.includes(keyword));
      
      // Additional heuristics for recommendations
      const hasRecommendationIndicators = 
        text.includes('recommend') || 
        text.includes('try') || 
        text.includes('visit') || 
        text.includes('check out') || 
        text.includes('love this place') ||
        text.includes('favorite');
      
      return mentionsLocation && (mentionsKeyword || hasRecommendationIndicators);
    });
  },

  /**
   * Extract potential locations from casts
   * @param {Array} casts - Array of casts to analyze
   * @returns {Array} Extracted location mentions
   */
  extractLocationMentions(casts) {
    if (!casts || !casts.length) return [];
    
    const locationMentions = [];
    
    // Simple regex patterns for location extraction
    // This is a basic implementation - in a real app, you'd use NLP or the OpenRouter LLM
    const patterns = [
      /at\s+([A-Z][a-zA-Z\s&']+)/g,  // "at Restaurant Name"
      /([A-Z][a-zA-Z\s&']+)\s+on\s+([A-Z][a-zA-Z\s]+\s+(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road))/g, // "Restaurant on Street Name"
      /([A-Z][a-zA-Z\s&']+)\s+in\s+([A-Z][a-zA-Z\s]+)/g, // "Restaurant in Neighborhood"
    ];
    
    casts.forEach(cast => {
      const text = cast.text;
      
      patterns.forEach(pattern => {
        const matches = [...text.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1]) {
            locationMentions.push({
              name: match[1].trim(),
              context: text,
              castHash: cast.hash,
              author: cast.author,
            });
          }
        });
      });
    });
    
    return locationMentions;
  }
};

export default NeynarService;


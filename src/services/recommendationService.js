import NeynarService from './neynarService';
import OpenRouterService from './openRouterService';
import SupabaseService from './supabaseService';

/**
 * Service for processing recommendations from social media
 */
export const RecommendationService = {
  /**
   * Process social media data to generate recommendations
   * @param {Object} options - Processing options
   * @param {string} options.location - Location to search for (e.g., "San Francisco")
   * @param {Array} options.keywords - Keywords to filter by (e.g., ["restaurant", "bar", "cafe"])
   * @param {number} options.limit - Maximum number of posts to process
   * @returns {Promise<Array>} Processed recommendations
   */
  async processRecommendations({ location, keywords = [], limit = 20 } = {}) {
    try {
      // Step 1: Fetch social media posts from Farcaster via Neynar
      const { casts } = await NeynarService.getCastsByLocation({
        location,
        limit
      });
      
      // Step 2: Filter posts for potential recommendations
      const filteredCasts = NeynarService.filterLocalRecommendations(
        casts,
        { location, keywords }
      );
      
      if (filteredCasts.length === 0) {
        console.log('No relevant posts found');
        return [];
      }
      
      // Step 3: Analyze posts with OpenRouter LLM
      const recommendations = await OpenRouterService.analyzePostsForRecommendations(
        filteredCasts
      );
      
      if (recommendations.length === 0) {
        console.log('No recommendations extracted from posts');
        return [];
      }
      
      // Step 4: Store data in Supabase
      const storedRecommendations = await this.storeRecommendations(recommendations, filteredCasts);
      
      return storedRecommendations;
    } catch (error) {
      console.error('Error processing recommendations:', error);
      throw error;
    }
  },

  /**
   * Store recommendations in Supabase
   * @param {Array} recommendations - Extracted recommendations
   * @param {Array} sourcePosts - Original social media posts
   * @returns {Promise<Array>} Stored recommendations
   */
  async storeRecommendations(recommendations, sourcePosts) {
    try {
      const storedRecommendations = [];
      
      // Create a map of posts by hash/id for easy lookup
      const postsMap = sourcePosts.reduce((map, post) => {
        map[post.hash || post.id] = post;
        return map;
      }, {});
      
      // Process each recommendation
      for (const rec of recommendations) {
        // Skip if confidence is too low
        if (rec.confidence < 0.6) {
          console.log(`Skipping low confidence recommendation: ${rec.location?.name}`);
          continue;
        }
        
        // Get the original post
        const sourcePost = postsMap[rec.post_id];
        if (!sourcePost) {
          console.log(`Source post not found for recommendation: ${rec.post_id}`);
          continue;
        }
        
        // Step 1: Store the source
        const source = await SupabaseService.createSource({
          platform: 'farcaster',
          platform_id: sourcePost.hash || sourcePost.id,
          author_id: sourcePost.author?.fid,
          author_name: sourcePost.author?.displayName,
          author_username: sourcePost.author?.username,
          content: sourcePost.text || sourcePost.content,
          url: `https://warpcast.com/${sourcePost.author?.username}/${sourcePost.hash}`,
          published_at: sourcePost.timestamp || new Date().toISOString(),
          metadata: {
            replies_count: sourcePost.replies?.count || 0,
            reactions_count: sourcePost.reactions?.count || 0,
            recasts_count: sourcePost.recasts?.count || 0
          }
        });
        
        // Step 2: Store the location
        const location = await SupabaseService.createLocation({
          name: rec.location.name,
          type: rec.location.type,
          latitude: rec.location.coordinates?.latitude || null,
          longitude: rec.location.coordinates?.longitude || null,
          address: rec.location.address,
          city: rec.location.city,
          state: null,
          country: null,
          postal_code: null,
          phone: null,
          website: null,
          rating: rec.recommendation.rating,
          price_level: null,
          hours: null,
          photos: []
        });
        
        // Step 3: Store the recommendation
        const recommendation = await SupabaseService.createRecommendation({
          location_id: location.id,
          source_id: source.id,
          title: rec.recommendation.title,
          description: rec.recommendation.description,
          vibe: rec.recommendation.vibe,
          tags: rec.recommendation.tags,
          rating: rec.recommendation.rating,
          trending: false,
          verified: false
        });
        
        storedRecommendations.push({
          ...recommendation,
          location,
          source
        });
      }
      
      return storedRecommendations;
    } catch (error) {
      console.error('Error storing recommendations:', error);
      throw error;
    }
  },

  /**
   * Fetch recommendations from Supabase with optional filters
   * @param {Object} options - Filter options
   * @param {string} options.type - Filter by type (restaurant, bar, cafe)
   * @param {boolean} options.trending - Filter by trending status
   * @param {number} options.limit - Limit the number of results
   * @returns {Promise<Array>} Array of recommendations
   */
  async getRecommendations(options = {}) {
    try {
      return await SupabaseService.getRecommendations(options);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  /**
   * Update trending status for recommendations
   * This would typically be run as a background job
   * @returns {Promise<number>} Number of updated recommendations
   */
  async updateTrendingStatus() {
    try {
      // Get all recommendations with their sources
      const recommendations = await SupabaseService.getRecommendations({ limit: 100 });
      
      let updatedCount = 0;
      
      // Process each recommendation
      for (const rec of recommendations) {
        // Skip if no source
        if (!rec.source) continue;
        
        // Calculate a trending score based on social engagement
        const source = rec.source;
        const engagementScore = 
          (source.metadata.replies_count || 0) * 2 + 
          (source.metadata.reactions_count || 0) + 
          (source.metadata.recasts_count || 0) * 3;
        
        // Check if the post is recent (within last 48 hours)
        const postDate = new Date(source.published_at);
        const now = new Date();
        const hoursSincePost = (now - postDate) / (1000 * 60 * 60);
        const isRecent = hoursSincePost < 48;
        
        // Determine if trending based on engagement and recency
        const isTrending = isRecent && engagementScore > 10;
        
        // Update if trending status changed
        if (rec.trending !== isTrending) {
          await SupabaseService.updateRecommendation(rec.id, { trending: isTrending });
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      console.error('Error updating trending status:', error);
      throw error;
    }
  },

  /**
   * Run a full refresh of recommendations for a location
   * This would typically be run as a background job
   * @param {string} location - Location to refresh (e.g., "San Francisco")
   * @returns {Promise<Object>} Refresh results
   */
  async refreshRecommendations(location) {
    try {
      // Process new recommendations
      const newRecommendations = await this.processRecommendations({
        location,
        keywords: ['restaurant', 'bar', 'cafe', 'food', 'drink', 'coffee', 'brunch', 'dinner'],
        limit: 50
      });
      
      // Update trending status
      const updatedCount = await this.updateTrendingStatus();
      
      return {
        newRecommendations: newRecommendations.length,
        updatedTrending: updatedCount
      };
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      throw error;
    }
  }
};

export default RecommendationService;


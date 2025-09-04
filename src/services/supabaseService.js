import supabase from '../lib/supabase/client';

/**
 * Service for interacting with Supabase
 */
export const SupabaseService = {
  /**
   * Fetch recommendations with optional filters
   * @param {Object} options - Filter options
   * @param {string} options.type - Filter by type (restaurant, bar, cafe)
   * @param {boolean} options.trending - Filter by trending status
   * @param {number} options.limit - Limit the number of results
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} Array of recommendations
   */
  async getRecommendations({ type, trending, limit = 10, offset = 0 } = {}) {
    let query = supabase
      .from('recommendations')
      .select(`
        *,
        location:locations(*),
        source:sources(*)
      `)
      .order('trending', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && type !== 'all') {
      query = query.eq('location.type', type);
    }

    if (trending !== undefined) {
      query = query.eq('trending', trending);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }

    return data;
  },

  /**
   * Fetch a single recommendation by ID
   * @param {string} id - Recommendation ID
   * @returns {Promise<Object>} Recommendation object
   */
  async getRecommendationById(id) {
    const { data, error } = await supabase
      .from('recommendations')
      .select(`
        *,
        location:locations(*),
        source:sources(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recommendation:', error);
      throw error;
    }

    return data;
  },

  /**
   * Fetch locations with optional filters
   * @param {Object} options - Filter options
   * @param {string} options.type - Filter by type (restaurant, bar, cafe)
   * @param {number} options.limit - Limit the number of results
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} Array of locations
   */
  async getLocations({ type, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from('locations')
      .select('*')
      .range(offset, offset + limit - 1);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }

    return data;
  },

  /**
   * Fetch a single location by ID
   * @param {string} id - Location ID
   * @returns {Promise<Object>} Location object
   */
  async getLocationById(id) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching location:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new location
   * @param {Object} location - Location data
   * @returns {Promise<Object>} Created location
   */
  async createLocation(location) {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new source
   * @param {Object} source - Source data
   * @returns {Promise<Object>} Created source
   */
  async createSource(source) {
    const { data, error } = await supabase
      .from('sources')
      .insert(source)
      .select()
      .single();

    if (error) {
      console.error('Error creating source:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new recommendation
   * @param {Object} recommendation - Recommendation data
   * @returns {Promise<Object>} Created recommendation
   */
  async createRecommendation(recommendation) {
    const { data, error } = await supabase
      .from('recommendations')
      .insert(recommendation)
      .select()
      .single();

    if (error) {
      console.error('Error creating recommendation:', error);
      throw error;
    }

    return data;
  },

  /**
   * Add a recommendation to user favorites
   * @param {string} userId - User ID
   * @param {string} recommendationId - Recommendation ID
   * @returns {Promise<Object>} Created favorite
   */
  async addToFavorites(userId, recommendationId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        recommendation_id: recommendationId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }

    return data;
  },

  /**
   * Remove a recommendation from user favorites
   * @param {string} userId - User ID
   * @param {string} recommendationId - Recommendation ID
   * @returns {Promise<void>}
   */
  async removeFromFavorites(userId, recommendationId) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .match({
        user_id: userId,
        recommendation_id: recommendationId
      });

    if (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  /**
   * Get user favorites
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of favorite recommendations
   */
  async getUserFavorites(userId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        recommendation:recommendations(
          *,
          location:locations(*),
          source:sources(*)
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user favorites:', error);
      throw error;
    }

    return data.map(item => item.recommendation);
  },

  /**
   * Add a recommendation to user history
   * @param {string} userId - User ID
   * @param {string} recommendationId - Recommendation ID
   * @returns {Promise<Object>} Created history entry
   */
  async addToHistory(userId, recommendationId) {
    const { data, error } = await supabase
      .from('user_history')
      .insert({
        user_id: userId,
        recommendation_id: recommendationId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to history:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get user history
   * @param {string} userId - User ID
   * @param {number} limit - Limit the number of results
   * @returns {Promise<Array>} Array of viewed recommendations
   */
  async getUserHistory(userId, limit = 10) {
    const { data, error } = await supabase
      .from('user_history')
      .select(`
        *,
        recommendation:recommendations(
          *,
          location:locations(*),
          source:sources(*)
        )
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }

    return data.map(item => ({
      ...item.recommendation,
      viewed_at: item.viewed_at
    }));
  },

  /**
   * Clear user history
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async clearHistory(userId) {
    const { error } = await supabase
      .from('user_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  },

  /**
   * Subscribe to real-time updates for recommendations
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  subscribeToRecommendations(callback) {
    return supabase
      .channel('recommendations-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recommendations'
        },
        callback
      )
      .subscribe();
  }
};

export default SupabaseService;


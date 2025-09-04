import { useState, useEffect, useCallback } from 'react';
import NeynarService from '../services/neynarService';

/**
 * Custom hook for using the Neynar API
 * @param {Object} options - Hook options
 * @param {boolean} options.autoFetch - Whether to fetch data automatically on mount
 * @param {string} options.location - Location to filter by
 * @param {Array} options.keywords - Keywords to filter by
 * @returns {Object} Neynar API methods and state
 */
export const useNeynar = ({ 
  autoFetch = false, 
  location = null,
  keywords = []
} = {}) => {
  const [casts, setCasts] = useState([]);
  const [filteredCasts, setFilteredCasts] = useState([]);
  const [locationMentions, setLocationMentions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    hasMore: false,
    cursor: null
  });

  /**
   * Fetch trending casts
   * @param {Object} options - Fetch options
   * @param {number} options.limit - Maximum number of results
   * @param {boolean} options.append - Whether to append results to existing casts
   * @returns {Promise<Array>} Fetched casts
   */
  const fetchTrendingCasts = useCallback(async ({ 
    limit = 20, 
    append = false 
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const cursor = append ? pagination.cursor : null;
      const response = await NeynarService.getTrendingCasts({ 
        limit, 
        cursor 
      });
      
      const newCasts = response.casts;
      
      // Update casts state
      setCasts(prev => append ? [...prev, ...newCasts] : newCasts);
      
      // Update pagination
      setPagination({
        hasMore: !!response.next,
        cursor: response.next?.cursor || null
      });
      
      // Filter for local recommendations
      const filtered = NeynarService.filterLocalRecommendations(
        newCasts, 
        { location, keywords }
      );
      
      setFilteredCasts(prev => append ? [...prev, ...filtered] : filtered);
      
      // Extract location mentions
      const mentions = NeynarService.extractLocationMentions(filtered);
      setLocationMentions(prev => append ? [...prev, ...mentions] : mentions);
      
      return newCasts;
    } catch (err) {
      setError(err);
      console.error('Error fetching trending casts:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [location, keywords, pagination.cursor]);

  /**
   * Search for casts by query
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {number} options.limit - Maximum number of results
   * @param {boolean} options.append - Whether to append results to existing casts
   * @returns {Promise<Array>} Search results
   */
  const searchCasts = useCallback(async ({ 
    query, 
    limit = 20, 
    append = false 
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const cursor = append ? pagination.cursor : null;
      const response = await NeynarService.searchCasts({ 
        query, 
        limit, 
        cursor 
      });
      
      const newCasts = response.casts;
      
      // Update casts state
      setCasts(prev => append ? [...prev, ...newCasts] : newCasts);
      
      // Update pagination
      setPagination({
        hasMore: !!response.next,
        cursor: response.next?.cursor || null
      });
      
      // Filter for local recommendations
      const filtered = NeynarService.filterLocalRecommendations(
        newCasts, 
        { location, keywords }
      );
      
      setFilteredCasts(prev => append ? [...prev, ...filtered] : filtered);
      
      // Extract location mentions
      const mentions = NeynarService.extractLocationMentions(filtered);
      setLocationMentions(prev => append ? [...prev, ...mentions] : mentions);
      
      return newCasts;
    } catch (err) {
      setError(err);
      console.error('Error searching casts:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [location, keywords, pagination.cursor]);

  /**
   * Fetch casts by location
   * @param {Object} options - Location options
   * @param {string} options.locationName - Location name to search for
   * @param {number} options.limit - Maximum number of results
   * @param {boolean} options.append - Whether to append results to existing casts
   * @returns {Promise<Array>} Fetched casts
   */
  const fetchCastsByLocation = useCallback(async ({ 
    locationName = location, 
    limit = 20, 
    append = false 
  } = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!locationName) {
        throw new Error('Location name is required');
      }
      
      const cursor = append ? pagination.cursor : null;
      const response = await NeynarService.getCastsByLocation({ 
        location: locationName, 
        limit, 
        cursor 
      });
      
      const newCasts = response.casts;
      
      // Update casts state
      setCasts(prev => append ? [...prev, ...newCasts] : newCasts);
      
      // Update pagination
      setPagination({
        hasMore: !!response.next,
        cursor: response.next?.cursor || null
      });
      
      // Filter for local recommendations
      const filtered = NeynarService.filterLocalRecommendations(
        newCasts, 
        { location: locationName, keywords }
      );
      
      setFilteredCasts(prev => append ? [...prev, ...filtered] : filtered);
      
      // Extract location mentions
      const mentions = NeynarService.extractLocationMentions(filtered);
      setLocationMentions(prev => append ? [...prev, ...mentions] : mentions);
      
      return newCasts;
    } catch (err) {
      setError(err);
      console.error('Error fetching casts by location:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [location, keywords, pagination.cursor]);

  /**
   * Load more casts (pagination)
   * @returns {Promise<Array>} Additional casts
   */
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || !pagination.cursor) {
      return [];
    }
    
    return fetchTrendingCasts({ 
      limit: 20, 
      append: true 
    });
  }, [fetchTrendingCasts, pagination]);

  /**
   * Fetch a single cast by hash
   * @param {string} hash - Cast hash
   * @returns {Promise<Object>} Cast details
   */
  const fetchCastByHash = useCallback(async (hash) => {
    try {
      setLoading(true);
      setError(null);
      
      const cast = await NeynarService.getCastByHash(hash);
      return cast;
    } catch (err) {
      setError(err);
      console.error('Error fetching cast by hash:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchTrendingCasts();
    }
  }, [autoFetch, fetchTrendingCasts]);

  return {
    casts,
    filteredCasts,
    locationMentions,
    loading,
    error,
    pagination,
    fetchTrendingCasts,
    searchCasts,
    fetchCastsByLocation,
    loadMore,
    fetchCastByHash,
    // Include all NeynarService methods
    ...NeynarService,
  };
};

export default useNeynar;


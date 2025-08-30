import { useState, useEffect, useCallback } from 'react';
import RecommendationService from '../services/recommendationService';
import { supabase } from '../lib/supabase/client';

/**
 * Custom hook for working with recommendations
 * @param {Object} options - Hook options
 * @param {boolean} options.autoFetch - Whether to fetch recommendations on mount
 * @param {string} options.type - Filter by type (restaurant, bar, cafe, all)
 * @param {boolean} options.trending - Filter by trending status
 * @param {number} options.limit - Maximum number of recommendations to fetch
 * @returns {Object} Recommendations data and methods
 */
export const useRecommendations = ({
  autoFetch = true,
  type = 'all',
  trending = null,
  limit = 10
} = {}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ type, trending, limit });
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  /**
   * Fetch recommendations with current filters
   * @param {Object} options - Override filter options
   * @returns {Promise<Array>} Fetched recommendations
   */
  const fetchRecommendations = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Merge current filters with options
      const fetchOptions = {
        ...filters,
        ...options
      };
      
      // Update filters state if options provided
      if (Object.keys(options).length > 0) {
        setFilters(fetchOptions);
      }
      
      const data = await RecommendationService.getRecommendations(fetchOptions);
      setRecommendations(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error fetching recommendations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Fetch a single recommendation by ID
   * @param {string} id - Recommendation ID
   * @returns {Promise<Object>} Recommendation details
   */
  const fetchRecommendationById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await RecommendationService.getRecommendationById(id);
      setSelectedRecommendation(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error fetching recommendation:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Process new recommendations for a location
   * @param {Object} options - Processing options
   * @param {string} options.location - Location to search for
   * @param {Array} options.keywords - Keywords to filter by
   * @returns {Promise<Array>} Processed recommendations
   */
  const processNewRecommendations = useCallback(async ({ location, keywords }) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await RecommendationService.processRecommendations({
        location,
        keywords,
        limit: 20
      });
      
      // Refresh recommendations after processing
      await fetchRecommendations();
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error processing recommendations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecommendations]);

  /**
   * Update filters and fetch recommendations
   * @param {Object} newFilters - New filter values
   * @returns {Promise<Array>} Fetched recommendations
   */
  const updateFilters = useCallback(async (newFilters) => {
    return fetchRecommendations(newFilters);
  }, [fetchRecommendations]);

  /**
   * Subscribe to real-time updates for recommendations
   */
  useEffect(() => {
    // Set up real-time subscription
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
          // Handle different change types
          if (payload.eventType === 'INSERT') {
            // Fetch the full recommendation with relations
            RecommendationService.getRecommendationById(payload.new.id)
              .then(newRec => {
                setRecommendations(prev => [newRec, ...prev]);
              })
              .catch(err => console.error('Error fetching new recommendation:', err));
          } else if (payload.eventType === 'UPDATE') {
            // Update the recommendation in the list
            setRecommendations(prev => 
              prev.map(rec => 
                rec.id === payload.new.id ? { ...rec, ...payload.new } : rec
              )
            );
            
            // Update selected recommendation if it's the one that changed
            if (selectedRecommendation?.id === payload.new.id) {
              setSelectedRecommendation(prev => ({ ...prev, ...payload.new }));
            }
          } else if (payload.eventType === 'DELETE') {
            // Remove the recommendation from the list
            setRecommendations(prev => 
              prev.filter(rec => rec.id !== payload.old.id)
            );
            
            // Clear selected recommendation if it's the one that was deleted
            if (selectedRecommendation?.id === payload.old.id) {
              setSelectedRecommendation(null);
            }
          }
        }
      )
      .subscribe();
    
    // Fetch recommendations on mount if autoFetch is true
    if (autoFetch) {
      fetchRecommendations();
    }
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [autoFetch, fetchRecommendations, selectedRecommendation]);

  return {
    recommendations,
    selectedRecommendation,
    loading,
    error,
    filters,
    fetchRecommendations,
    fetchRecommendationById,
    processNewRecommendations,
    updateFilters,
    setSelectedRecommendation,
    // Include RecommendationService methods
    ...RecommendationService,
  };
};

export default useRecommendations;


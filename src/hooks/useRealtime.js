import { useState, useEffect, useCallback } from 'react';
import RealtimeService from '../services/realtimeService';

/**
 * Custom hook for real-time updates
 * @param {Object} options - Hook options
 * @param {string} options.table - Table name to subscribe to
 * @param {Function} options.onInsert - Callback for insert events
 * @param {Function} options.onUpdate - Callback for update events
 * @param {Function} options.onDelete - Callback for delete events
 * @param {Object} options.filter - Filter conditions for the subscription
 * @returns {Object} Real-time state and methods
 */
export const useRealtime = ({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter = {}
} = {}) => {
  const [lastEvent, setLastEvent] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Handle real-time events
  const handleRealtimeEvent = useCallback((payload) => {
    setLastEvent(payload);
    
    // Call the appropriate callback based on event type
    if (payload.eventType === 'INSERT' && onInsert) {
      onInsert(payload.new);
    } else if (payload.eventType === 'UPDATE' && onUpdate) {
      onUpdate(payload.new, payload.old);
    } else if (payload.eventType === 'DELETE' && onDelete) {
      onDelete(payload.old);
    }
  }, [onInsert, onUpdate, onDelete]);
  
  // Set up subscription
  useEffect(() => {
    if (!table) return;
    
    setIsConnected(true);
    
    // Create subscription
    const subscription = RealtimeService.subscribe(
      table,
      handleRealtimeEvent,
      { filter }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [table, handleRealtimeEvent, filter]);
  
  /**
   * Subscribe to real-time updates for recommendations
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  const subscribeToRecommendations = useCallback((callback) => {
    return RealtimeService.subscribeToRecommendations(callback);
  }, []);
  
  /**
   * Subscribe to real-time updates for locations
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  const subscribeToLocations = useCallback((callback) => {
    return RealtimeService.subscribeToLocations(callback);
  }, []);
  
  /**
   * Subscribe to real-time updates for user favorites
   * @param {string} userId - User ID to filter by
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  const subscribeToUserFavorites = useCallback((userId, callback) => {
    return RealtimeService.subscribeToUserFavorites(userId, callback);
  }, []);
  
  /**
   * Subscribe to real-time updates for user history
   * @param {string} userId - User ID to filter by
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  const subscribeToUserHistory = useCallback((userId, callback) => {
    return RealtimeService.subscribeToUserHistory(userId, callback);
  }, []);
  
  /**
   * Subscribe to presence updates for a channel
   * @param {string} channel - Channel name
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object with track and untrack methods
   */
  const subscribeToPresence = useCallback((channel, callback) => {
    return RealtimeService.subscribeToPresence(channel, callback);
  }, []);
  
  return {
    lastEvent,
    isConnected,
    subscribeToRecommendations,
    subscribeToLocations,
    subscribeToUserFavorites,
    subscribeToUserHistory,
    subscribeToPresence,
  };
};

export default useRealtime;


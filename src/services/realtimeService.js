import { supabase } from '../lib/supabase/client';

/**
 * Service for managing real-time updates using Supabase
 */
export const RealtimeService = {
  /**
   * Subscribe to real-time updates for a table
   * @param {string} table - Table name to subscribe to
   * @param {Function} callback - Callback function to handle updates
   * @param {Object} options - Subscription options
   * @param {string} options.event - Event type to subscribe to ('INSERT', 'UPDATE', 'DELETE', '*')
   * @param {Object} options.filter - Filter conditions for the subscription
   * @returns {Object} Subscription object
   */
  subscribe(table, callback, { event = '*', filter = {} } = {}) {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...filter
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
    
    return {
      unsubscribe: () => {
        channel.unsubscribe();
      }
    };
  },

  /**
   * Subscribe to real-time updates for recommendations
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  subscribeToRecommendations(callback) {
    return this.subscribe('recommendations', callback);
  },

  /**
   * Subscribe to real-time updates for locations
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  subscribeToLocations(callback) {
    return this.subscribe('locations', callback);
  },

  /**
   * Subscribe to real-time updates for user favorites
   * @param {string} userId - User ID to filter by
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  subscribeToUserFavorites(userId, callback) {
    return this.subscribe(
      'user_favorites',
      callback,
      {
        filter: {
          filter: `user_id=eq.${userId}`
        }
      }
    );
  },

  /**
   * Subscribe to real-time updates for user history
   * @param {string} userId - User ID to filter by
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  subscribeToUserHistory(userId, callback) {
    return this.subscribe(
      'user_history',
      callback,
      {
        filter: {
          filter: `user_id=eq.${userId}`
        }
      }
    );
  },

  /**
   * Subscribe to presence updates for a channel
   * @param {string} channel - Channel name
   * @param {Function} callback - Callback function to handle updates
   * @returns {Object} Subscription object
   */
  subscribeToPresence(channel, callback) {
    const presenceChannel = supabase.channel(channel);
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        callback({ event: 'sync', state });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        callback({ event: 'join', key, newPresences });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        callback({ event: 'leave', key, leftPresences });
      })
      .subscribe();
    
    return {
      unsubscribe: () => {
        presenceChannel.unsubscribe();
      },
      track: (presence) => {
        presenceChannel.track(presence);
      },
      untrack: () => {
        presenceChannel.untrack();
      }
    };
  }
};

export default RealtimeService;


/**
 * Tests for the recommendation service
 * 
 * Note: These tests are not meant to be run automatically.
 * They are provided as a reference for how to test the service.
 */

import RecommendationService from '../recommendationService';
import NeynarService from '../neynarService';
import OpenRouterService from '../openRouterService';
import SupabaseService from '../supabaseService';

// Mock the dependencies
jest.mock('../neynarService');
jest.mock('../openRouterService');
jest.mock('../supabaseService');

describe('RecommendationService', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('processRecommendations', () => {
    it('should process recommendations from social media posts', async () => {
      // Mock data
      const location = 'San Francisco';
      const keywords = ['restaurant', 'bar', 'cafe'];
      const mockCasts = [
        { hash: 'hash1', text: 'Great restaurant in San Francisco', author: { username: 'user1' } },
        { hash: 'hash2', text: 'Amazing bar downtown', author: { username: 'user2' } },
      ];
      const mockFilteredCasts = [
        { hash: 'hash1', text: 'Great restaurant in San Francisco', author: { username: 'user1' } },
      ];
      const mockRecommendations = [
        {
          post_id: 'hash1',
          location: {
            name: 'Test Restaurant',
            type: 'restaurant',
          },
          recommendation: {
            title: 'Great place',
            description: 'Delicious food',
            rating: 4.5,
          },
          confidence: 0.9,
        },
      ];
      const mockSource = { id: 'source1' };
      const mockLocation = { id: 'location1' };
      const mockStoredRecommendation = { id: 'rec1', location: mockLocation, source: mockSource };

      // Set up mocks
      NeynarService.getCastsByLocation.mockResolvedValue({ casts: mockCasts });
      NeynarService.filterLocalRecommendations.mockReturnValue(mockFilteredCasts);
      OpenRouterService.analyzePostsForRecommendations.mockResolvedValue(mockRecommendations);
      SupabaseService.createSource.mockResolvedValue(mockSource);
      SupabaseService.createLocation.mockResolvedValue(mockLocation);
      SupabaseService.createRecommendation.mockResolvedValue(mockStoredRecommendation);

      // Call the method
      const result = await RecommendationService.processRecommendations({
        location,
        keywords,
        limit: 20,
      });

      // Assertions
      expect(NeynarService.getCastsByLocation).toHaveBeenCalledWith({
        location,
        limit: 20,
      });
      expect(NeynarService.filterLocalRecommendations).toHaveBeenCalledWith(
        mockCasts,
        { location, keywords }
      );
      expect(OpenRouterService.analyzePostsForRecommendations).toHaveBeenCalledWith(
        mockFilteredCasts
      );
      expect(SupabaseService.createSource).toHaveBeenCalled();
      expect(SupabaseService.createLocation).toHaveBeenCalled();
      expect(SupabaseService.createRecommendation).toHaveBeenCalled();
      expect(result).toEqual([mockStoredRecommendation]);
    });

    it('should return empty array if no relevant posts found', async () => {
      // Mock data
      const location = 'San Francisco';
      const mockCasts = [];

      // Set up mocks
      NeynarService.getCastsByLocation.mockResolvedValue({ casts: mockCasts });
      NeynarService.filterLocalRecommendations.mockReturnValue([]);

      // Call the method
      const result = await RecommendationService.processRecommendations({
        location,
      });

      // Assertions
      expect(result).toEqual([]);
      expect(OpenRouterService.analyzePostsForRecommendations).not.toHaveBeenCalled();
    });

    it('should return empty array if no recommendations extracted', async () => {
      // Mock data
      const location = 'San Francisco';
      const mockCasts = [{ hash: 'hash1', text: 'Hello world', author: { username: 'user1' } }];
      const mockFilteredCasts = [{ hash: 'hash1', text: 'Hello world', author: { username: 'user1' } }];

      // Set up mocks
      NeynarService.getCastsByLocation.mockResolvedValue({ casts: mockCasts });
      NeynarService.filterLocalRecommendations.mockReturnValue(mockFilteredCasts);
      OpenRouterService.analyzePostsForRecommendations.mockResolvedValue([]);

      // Call the method
      const result = await RecommendationService.processRecommendations({
        location,
      });

      // Assertions
      expect(result).toEqual([]);
      expect(SupabaseService.createSource).not.toHaveBeenCalled();
    });

    it('should skip recommendations with low confidence', async () => {
      // Mock data
      const location = 'San Francisco';
      const mockCasts = [{ hash: 'hash1', text: 'Hello world', author: { username: 'user1' } }];
      const mockFilteredCasts = [{ hash: 'hash1', text: 'Hello world', author: { username: 'user1' } }];
      const mockRecommendations = [
        {
          post_id: 'hash1',
          location: {
            name: 'Test Restaurant',
            type: 'restaurant',
          },
          recommendation: {
            title: 'Great place',
            description: 'Delicious food',
            rating: 4.5,
          },
          confidence: 0.5, // Low confidence
        },
      ];

      // Set up mocks
      NeynarService.getCastsByLocation.mockResolvedValue({ casts: mockCasts });
      NeynarService.filterLocalRecommendations.mockReturnValue(mockFilteredCasts);
      OpenRouterService.analyzePostsForRecommendations.mockResolvedValue(mockRecommendations);

      // Call the method
      const result = await RecommendationService.processRecommendations({
        location,
      });

      // Assertions
      expect(result).toEqual([]);
      expect(SupabaseService.createSource).not.toHaveBeenCalled();
    });
  });

  describe('updateTrendingStatus', () => {
    it('should update trending status based on engagement', async () => {
      // Mock data
      const mockRecommendations = [
        {
          id: 'rec1',
          trending: false,
          source: {
            published_at: new Date().toISOString(), // Recent
            metadata: {
              replies_count: 5,
              reactions_count: 10,
              recasts_count: 5,
            },
          },
        },
        {
          id: 'rec2',
          trending: true,
          source: {
            published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            metadata: {
              replies_count: 1,
              reactions_count: 2,
              recasts_count: 1,
            },
          },
        },
      ];

      // Set up mocks
      SupabaseService.getRecommendations.mockResolvedValue(mockRecommendations);
      SupabaseService.updateRecommendation.mockResolvedValue({});

      // Call the method
      const result = await RecommendationService.updateTrendingStatus();

      // Assertions
      expect(SupabaseService.updateRecommendation).toHaveBeenCalledTimes(2);
      expect(SupabaseService.updateRecommendation).toHaveBeenCalledWith('rec1', { trending: true });
      expect(SupabaseService.updateRecommendation).toHaveBeenCalledWith('rec2', { trending: false });
      expect(result).toBe(2);
    });

    it('should skip recommendations without sources', async () => {
      // Mock data
      const mockRecommendations = [
        {
          id: 'rec1',
          trending: false,
          source: null,
        },
      ];

      // Set up mocks
      SupabaseService.getRecommendations.mockResolvedValue(mockRecommendations);

      // Call the method
      const result = await RecommendationService.updateTrendingStatus();

      // Assertions
      expect(SupabaseService.updateRecommendation).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });

  describe('refreshRecommendations', () => {
    it('should process new recommendations and update trending status', async () => {
      // Mock data
      const location = 'San Francisco';
      const mockNewRecommendations = [{ id: 'rec1' }, { id: 'rec2' }];

      // Set up mocks
      jest.spyOn(RecommendationService, 'processRecommendations').mockResolvedValue(mockNewRecommendations);
      jest.spyOn(RecommendationService, 'updateTrendingStatus').mockResolvedValue(3);

      // Call the method
      const result = await RecommendationService.refreshRecommendations(location);

      // Assertions
      expect(RecommendationService.processRecommendations).toHaveBeenCalledWith({
        location,
        keywords: expect.any(Array),
        limit: 50,
      });
      expect(RecommendationService.updateTrendingStatus).toHaveBeenCalled();
      expect(result).toEqual({
        newRecommendations: 2,
        updatedTrending: 3,
      });
    });
  });
});


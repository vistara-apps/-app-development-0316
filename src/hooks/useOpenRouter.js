import { useState, useCallback } from 'react';
import OpenRouterService from '../services/openRouterService';

/**
 * Custom hook for using OpenRouter LLM APIs
 * @returns {Object} OpenRouter methods and state
 */
export const useOpenRouter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * Generate a completion using OpenRouter LLM
   * @param {Object} options - Completion options
   * @param {string} options.prompt - The prompt to send to the LLM
   * @param {string} options.model - The model to use
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Temperature for generation (0-1)
   * @returns {Promise<string>} Generated text
   */
  const generateCompletion = useCallback(async (options) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await OpenRouterService.generateCompletion(options);
      setResult(response);
      
      return response;
    } catch (err) {
      setError(err);
      console.error('Error generating completion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate a chat completion using OpenRouter LLM
   * @param {Object} options - Chat completion options
   * @param {Array} options.messages - Array of message objects with role and content
   * @param {string} options.model - The model to use
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Temperature for generation (0-1)
   * @returns {Promise<string>} Generated message content
   */
  const generateChatCompletion = useCallback(async (options) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await OpenRouterService.generateChatCompletion(options);
      setResult(response);
      
      return response;
    } catch (err) {
      setError(err);
      console.error('Error generating chat completion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Extract location information from text
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Extracted location information
   */
  const extractLocationInfo = useCallback(async (text) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await OpenRouterService.extractLocationInfo(text);
      setResult(response);
      
      return response;
    } catch (err) {
      setError(err);
      console.error('Error extracting location info:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Analyze social media posts for local recommendations
   * @param {Array} posts - Array of social media posts to analyze
   * @returns {Promise<Array>} Extracted recommendations
   */
  const analyzePostsForRecommendations = useCallback(async (posts) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await OpenRouterService.analyzePostsForRecommendations(posts);
      setResult(response);
      
      return response;
    } catch (err) {
      setError(err);
      console.error('Error analyzing posts for recommendations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate a summary for a location based on multiple posts
   * @param {Object} location - Location object
   * @param {Array} posts - Array of posts mentioning the location
   * @returns {Promise<Object>} Enhanced location with summary
   */
  const generateLocationSummary = useCallback(async (location, posts) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await OpenRouterService.generateLocationSummary(location, posts);
      setResult(response);
      
      return response;
    } catch (err) {
      setError(err);
      console.error('Error generating location summary:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    generateCompletion,
    generateChatCompletion,
    extractLocationInfo,
    analyzePostsForRecommendations,
    generateLocationSummary,
    // Include all OpenRouterService methods
    ...OpenRouterService,
  };
};

export default useOpenRouter;


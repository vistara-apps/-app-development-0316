import { openrouter } from '@openrouter/ai-sdk-provider';

// Initialize OpenRouter with API key
const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const defaultModel = import.meta.env.VITE_OPENROUTER_MODEL || 'anthropic/claude-3-opus';

/**
 * Service for interacting with OpenRouter LLM APIs
 */
export const OpenRouterService = {
  /**
   * Generate a completion using OpenRouter LLM
   * @param {Object} options - Completion options
   * @param {string} options.prompt - The prompt to send to the LLM
   * @param {string} options.model - The model to use (defaults to env variable or claude-3-opus)
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Temperature for generation (0-1)
   * @returns {Promise<string>} Generated text
   */
  async generateCompletion({ 
    prompt, 
    model = defaultModel, 
    maxTokens = 1000, 
    temperature = 0.7 
  }) {
    try {
      const response = await openrouter.completions.create({
        model,
        prompt,
        max_tokens: maxTokens,
        temperature,
        headers: {
          'HTTP-Referer': import.meta.env.VITE_APP_URL || 'http://localhost:5173',
          'X-Title': 'LocalVibe AI',
        },
      });
      
      return response.choices[0].text;
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  },

  /**
   * Generate a chat completion using OpenRouter LLM
   * @param {Object} options - Chat completion options
   * @param {Array} options.messages - Array of message objects with role and content
   * @param {string} options.model - The model to use (defaults to env variable or claude-3-opus)
   * @param {number} options.maxTokens - Maximum tokens to generate
   * @param {number} options.temperature - Temperature for generation (0-1)
   * @returns {Promise<string>} Generated message content
   */
  async generateChatCompletion({ 
    messages, 
    model = defaultModel, 
    maxTokens = 1000, 
    temperature = 0.7 
  }) {
    try {
      const response = await openrouter.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        headers: {
          'HTTP-Referer': import.meta.env.VITE_APP_URL || 'http://localhost:5173',
          'X-Title': 'LocalVibe AI',
        },
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  },

  /**
   * Extract location information from text
   * @param {string} text - Text to analyze
   * @returns {Promise<Object>} Extracted location information
   */
  async extractLocationInfo(text) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are a location extraction assistant. Extract structured information about places mentioned in the text.
          Focus on restaurants, bars, cafes, and other local establishments.
          Return a JSON object with the following structure:
          {
            "locations": [
              {
                "name": "Place Name",
                "type": "restaurant|bar|cafe|etc",
                "address": "Address if mentioned",
                "description": "Brief description based on the text",
                "vibe": "Atmosphere or vibe mentioned",
                "rating": "Rating if mentioned (numeric or text)",
                "confidence": 0-1 (how confident you are this is a real location)
              }
            ]
          }
          If no locations are mentioned, return an empty array. Only include fields that are mentioned in the text.`
        },
        {
          role: 'user',
          content: text
        }
      ];
      
      const response = await this.generateChatCompletion({
        messages,
        temperature: 0.2, // Lower temperature for more deterministic extraction
      });
      
      // Parse the JSON response
      try {
        // Find JSON in the response (in case the model adds extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        return JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Error parsing location extraction response:', parseError);
        return { locations: [] };
      }
    } catch (error) {
      console.error('Error extracting location info:', error);
      throw error;
    }
  },

  /**
   * Analyze social media posts for local recommendations
   * @param {Array} posts - Array of social media posts to analyze
   * @returns {Promise<Array>} Extracted recommendations
   */
  async analyzePostsForRecommendations(posts) {
    if (!posts || posts.length === 0) {
      return [];
    }
    
    try {
      // Prepare the posts for analysis
      const postsText = posts.map(post => {
        return `Post ID: ${post.hash || post.id}\nAuthor: ${post.author?.username || 'Unknown'}\nContent: ${post.text || post.content}\n---`;
      }).join('\n');
      
      const messages = [
        {
          role: 'system',
          content: `You are a recommendation extraction assistant. Analyze social media posts to identify local recommendations for restaurants, bars, cafes, events, and other local establishments.
          Return a JSON array of recommendations with the following structure:
          [
            {
              "post_id": "ID of the post",
              "location": {
                "name": "Place Name",
                "type": "restaurant|bar|cafe|event|etc",
                "address": "Address if mentioned",
                "city": "City if mentioned",
                "coordinates": {"latitude": lat, "longitude": lng} (if mentioned)
              },
              "recommendation": {
                "title": "Brief title for this recommendation",
                "description": "Description based on what was said",
                "vibe": "Atmosphere or vibe mentioned",
                "rating": numeric rating if mentioned (1-5),
                "tags": ["tag1", "tag2"] (extracted keywords)
              },
              "confidence": 0-1 (how confident you are this is a genuine recommendation)
            }
          ]
          Only include genuine recommendations. If a post doesn't contain a recommendation, don't include it.`
        },
        {
          role: 'user',
          content: `Analyze these social media posts for local recommendations:\n\n${postsText}`
        }
      ];
      
      const response = await this.generateChatCompletion({
        messages,
        temperature: 0.3,
        maxTokens: 2000,
      });
      
      // Parse the JSON response
      try {
        // Find JSON in the response (in case the model adds extra text)
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        return JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Error parsing recommendations response:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error analyzing posts for recommendations:', error);
      throw error;
    }
  },

  /**
   * Generate a summary for a location based on multiple posts
   * @param {Object} location - Location object
   * @param {Array} posts - Array of posts mentioning the location
   * @returns {Promise<Object>} Enhanced location with summary
   */
  async generateLocationSummary(location, posts) {
    if (!location || !posts || posts.length === 0) {
      return location;
    }
    
    try {
      // Prepare the posts for analysis
      const postsText = posts.map(post => {
        return `Post: ${post.text || post.content}`;
      }).join('\n\n');
      
      const messages = [
        {
          role: 'system',
          content: `You are a location summarization assistant. Generate a concise summary of a location based on social media posts.
          Return a JSON object with the following structure:
          {
            "summary": "Concise summary of what people say about this place",
            "vibe": "Overall atmosphere or vibe",
            "rating": numeric average rating (1-5),
            "tags": ["tag1", "tag2"] (key descriptors),
            "trending": true/false (whether this place seems to be trending),
            "price_level": 1-4 ($ to $$$$),
            "best_for": ["dinner", "date night", etc.]
          }`
        },
        {
          role: 'user',
          content: `Generate a summary for ${location.name} (${location.type}) based on these social media posts:\n\n${postsText}`
        }
      ];
      
      const response = await this.generateChatCompletion({
        messages,
        temperature: 0.4,
      });
      
      // Parse the JSON response
      try {
        // Find JSON in the response (in case the model adds extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        const summary = JSON.parse(jsonStr);
        
        // Merge the summary with the location
        return {
          ...location,
          summary: summary.summary,
          vibe: summary.vibe || location.vibe,
          rating: summary.rating || location.rating,
          tags: summary.tags || [],
          trending: summary.trending || false,
          price_level: summary.price_level || location.price_level,
          best_for: summary.best_for || []
        };
      } catch (parseError) {
        console.error('Error parsing location summary response:', parseError);
        return location;
      }
    } catch (error) {
      console.error('Error generating location summary:', error);
      return location;
    }
  }
};

export default OpenRouterService;


const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.apiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
    this.model = process.env.GROQ_MODEL || 'llama3-8b-8192';
    this.maxTokens = parseInt(process.env.MAX_TOKENS) || 2000;
    this.temperature = parseFloat(process.env.TEMPERATURE) || 0.7;
    
    // Validate required configuration
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
  }

  /**
   * Generate summary using Groq API
   * @param {string} transcript - Meeting transcript to summarize
   * @param {string} prompt - Custom instruction for summarization
   * @returns {Promise<string>} Generated summary
   */
  async generateSummary(transcript, prompt) {
    try {
      console.log('🤖 Calling Groq API for summary generation...');

      // Construct the system prompt and user message
      const systemPrompt = `You are an AI assistant specialized in creating structured meeting summaries. Your task is to analyze meeting transcripts and create clear, actionable summaries based on the given instructions.

Guidelines for your summaries:
1. Be concise but comprehensive
2. Use clear structure with headers/bullet points when appropriate
3. Highlight key decisions, action items, and important discussions
4. Maintain professional tone
5. Focus on actionable information
6. If no specific format is requested, use a structured approach with sections like: Key Points, Decisions Made, Action Items, Next Steps`;

      const userMessage = `Please analyze this meeting transcript and create a summary based on the following instruction: "${prompt}"

Meeting Transcript:
${transcript}`;

      const payload = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: 0.9,
        stream: false
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 seconds timeout
      });

      // Validate response structure
      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response structure from Groq API');
      }

      const summary = response.data.choices[0].message?.content;
      
      if (!summary) {
        throw new Error('No summary content received from Groq API');
      }

      console.log('✅ Summary generated successfully by Groq API');
      
      return summary.trim();

    } catch (error) {
      console.error('❌ Error calling Groq API:', error);

      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 401:
            const authError = new Error('Invalid API key or authentication failed');
            authError.name = 'AuthenticationError';
            throw authError;

          case 429:
            const rateLimitError = new Error('Rate limit exceeded for Groq API');
            rateLimitError.name = 'RateLimitError';
            throw rateLimitError;

          case 400:
            const validationError = new Error(errorData.error?.message || 'Invalid request to Groq API');
            validationError.name = 'ValidationError';
            throw validationError;

          case 500:
          case 502:
          case 503:
          case 504:
            const serviceError = new Error('Groq API service unavailable');
            serviceError.name = 'AIServiceError';
            throw serviceError;

          default:
            const unknownError = new Error(`Groq API error: ${status} - ${errorData.error?.message || 'Unknown error'}`);
            unknownError.name = 'AIServiceError';
            throw unknownError;
        }
      }

      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error('Request to Groq API timed out');
        timeoutError.name = 'AIServiceError';
        throw timeoutError;
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        const connectionError = new Error('Unable to connect to Groq API');
        connectionError.name = 'AIServiceError';
        throw connectionError;
      }

      // Re-throw custom errors
      if (error.name === 'AuthenticationError' || 
          error.name === 'RateLimitError' || 
          error.name === 'ValidationError' || 
          error.name === 'AIServiceError') {
        throw error;
      }

      // Generic error
      const genericError = new Error('Failed to generate summary');
      genericError.name = 'AIServiceError';
      throw genericError;
    }
  }

  /**
   * Validate API configuration
   * @returns {boolean} True if configuration is valid
   */
  validateConfig() {
    return !!(this.apiKey && this.apiUrl);
  }

  /**
   * Test API connectivity
   * @returns {Promise<boolean>} True if API is reachable
   */
  async testConnection() {
    try {
      const testPayload = {
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Say "API connection test successful"'
          }
        ],
        max_tokens: 50,
        temperature: 0
      };

      const response = await axios.post(this.apiUrl, testPayload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.status === 200 && response.data.choices?.[0]?.message?.content;
    } catch (error) {
      console.error(' API connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new AIService();
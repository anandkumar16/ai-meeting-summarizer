const express = require('express');
const Joi = require('joi');
const aiService = require('../services/aiService');

const router = express.Router();

// Validation schema for summarize request
const summarizeSchema = Joi.object({
  transcript: Joi.string().min(10).max(50000).required().messages({
    'string.empty': 'Transcript cannot be empty',
    'string.min': 'Transcript must be at least 10 characters long',
    'string.max': 'Transcript cannot exceed 50,000 characters',
    'any.required': 'Transcript is required'
  }),
  prompt: Joi.string().min(5).max(1000).optional().default('Provide a clear and structured summary of this meeting transcript, highlighting key points, decisions made, and action items.').messages({
    'string.min': 'Prompt must be at least 5 characters long',
    'string.max': 'Prompt cannot exceed 1,000 characters'
  })
});

/**
 * POST /summarize
 * Generates AI-powered summary of meeting transcript
 */
router.post('/summarize', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = summarizeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { transcript, prompt } = value;

    // Check if transcript is not just whitespace
    if (!transcript.trim()) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Transcript cannot be empty or contain only whitespace'
      });
    }

    // Log request (remove in production or use proper logging)
    console.log(`📝 Summarize request received - Transcript length: ${transcript.length} chars`);

    // Generate summary using AI service
    const summary = await aiService.generateSummary(transcript, prompt);

    // Validate AI response
    if (!summary || typeof summary !== 'string') {
      throw new Error('Invalid response from AI service');
    }

    console.log(`✅ Summary generated successfully - Length: ${summary.length} chars`);

    res.status(200).json({
      success: true,
      summary: summary.trim(),
      metadata: {
        originalLength: transcript.length,
        summaryLength: summary.length,
        compressionRatio: Math.round((summary.length / transcript.length) * 100),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/summarize:', error);

    // Handle specific AI service errors
    if (error.name === 'AIServiceError') {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'The AI summarization service is currently unavailable. Please try again later.'
      });
    }

    if (error.name === 'RateLimitError') {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please wait before trying again.'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Invalid input',
        message: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Summary generation failed',
      message: 'An error occurred while generating the summary. Please try again.'
    });
  }
});

module.exports = router;
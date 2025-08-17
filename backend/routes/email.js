const express = require('express');
const Joi = require('joi');
const emailService = require('../services/emailService');

const router = express.Router();

// Validation schema for email requests
const emailSchema = Joi.object({
  summary: Joi.string().min(10).required().messages({
    'string.empty': 'Summary cannot be empty',
    'string.min': 'Summary must be at least 10 characters long',
    'any.required': 'Summary is required'
  }),
  recipients: Joi.array().items(Joi.string().email()).min(1).required().messages({
    'array.min': 'At least one recipient is required',
    'any.required': 'Recipients are required'
  }),
  subject: Joi.string().min(1).max(200).optional().default('Meeting Summary'),
  senderName: Joi.string().max(100).optional()
});

const validateEmailSchema = Joi.object({
  recipients: Joi.array().items(Joi.string().email()).min(1).required().messages({
    'array.min': 'At least one recipient is required',
    'any.required': 'Recipients are required'
  })
});

/**
 * POST /send-email
 * Sends meeting summary via email
 */
router.post('/send-email', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { summary, recipients, subject, senderName } = value;

    console.log(`📧 Email request received - Recipients: ${recipients.length}, Subject: ${subject}`);

    // Send email using email service
    const result = await emailService.sendEmail({
      summary,
      recipients,
      subject,
      senderName
    });

    console.log(`✅ Email sent successfully to ${recipients.length} recipients`);

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${recipients.length} recipient(s)`,
      metadata: {
        recipientsCount: recipients.length,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/send-email:', error);

    // Handle specific email service errors
    if (error.name === 'EmailServiceError') {
      return res.status(503).json({
        error: 'Email service unavailable',
        message: 'The email service is currently unavailable. Please try again later.'
      });
    }

    if (error.name === 'AuthenticationError') {
      return res.status(401).json({
        error: 'Email authentication failed',
        message: 'Email service authentication failed. Please check configuration.'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Email sending failed',
      message: 'An error occurred while sending the email. Please try again.'
    });
  }
});

/**
 * POST /validate-email
 * Validates email addresses
 */
router.post('/validate-email', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = validateEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { recipients } = value;

    console.log(`🔍 Email validation request received - ${recipients.length} emails`);

    // Validate emails using email service
    const validEmails = await emailService.validateEmails(recipients);

    console.log(`✅ Email validation completed - ${validEmails.length} valid emails`);

    res.status(200).json({
      success: true,
      validEmails,
      invalidEmails: recipients.filter(email => !validEmails.includes(email)),
      metadata: {
        totalEmails: recipients.length,
        validCount: validEmails.length,
        invalidCount: recipients.length - validEmails.length
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/validate-email:', error);

    res.status(500).json({
      error: 'Email validation failed',
      message: 'An error occurred while validating emails. Please try again.'
    });
  }
});

module.exports = router;
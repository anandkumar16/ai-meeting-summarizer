const nodemailer = require('nodemailer')

class EmailService {
  constructor() {
    this.emailUser = process.env.SMTP_USER;
    this.emailPass = process.env.SMTP_PASS;
    this.emailFromName = process.env.EMAIL_FROM_NAME || 'Meeting Notes Summarizer';
    this.smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.smtpPort = parseInt(process.env.SMTP_PORT) || 587;
    this.smtpSecure = process.env.SMTP_SECURE === 'true';

    // Only create transporter if email credentials are provided
    if (this.emailUser && this.emailPass) {
      this.transporter = this.createTransporter();
    } else {
      console.warn('⚠️ Email service not configured - SMTP_USER and SMTP_PASS environment variables are required');
      this.transporter = null;
    }
  }

  /**
   * Create nodemailer transporter
   * @returns {object} Nodemailer transporter instance
   */
  createTransporter() {
    try {
      return nodemailer.createTransport({
        host: this.smtpHost,
        port: this.smtpPort,
        secure: this.smtpSecure,
        requireTLS: true,
        auth: {
          user: this.emailUser,
          pass: this.emailPass
        },
        tls: {
          rejectUnauthorized: false // For development; remove in production
        }
      });
    } catch (error) {
      console.error('❌ Failed to create email transporter:', error);
      throw error;
    }
  }

  /**
   * Validate email addresses
   * @param {string[]} emails - Array of email addresses to validate
   * @returns {Promise<string[]>} Array of valid email addresses
   */
  async validateEmails(emails) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = [];
    
    for (const email of emails) {
      const trimmedEmail = email.trim().toLowerCase();
      if (emailRegex.test(trimmedEmail)) {
        validEmails.push(trimmedEmail);
      }
    }
    
    return validEmails;
  }

  /**
   * Generate HTML email template
   * @param {string} summary - Meeting summary content
   * @param {string} senderName - Name of the sender (optional)
   * @returns {string} HTML email content
   */
  generateEmailTemplate(summary, senderName) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Convert plain text summary to HTML with basic formatting
    let htmlSummary = summary
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- /gm, '• ');

    // Wrap in paragraph tags if not already formatted
    if (!htmlSummary.includes('<p>')) {
      htmlSummary = `<p>${htmlSummary}</p>`;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Meeting Summary</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #4f46e5;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .date {
          color: #6b7280;
          font-size: 14px;
          margin-top: 5px;
        }
        .content {
          margin-bottom: 30px;
        }
        .content p {
          margin-bottom: 16px;
        }
        .content strong {
          color: #1f2937;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #4b5563;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Meeting Summary</h1>
          <div class="date">${currentDate}</div>
        </div>
        
        <div class="content">
          ${htmlSummary}
        </div>
        
        ${senderName ? `
        <div class="signature">
          <p>Best regards,<br>
          <strong>${senderName}</strong></p>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>This summary was generated by AI-powered Meeting Notes Summarizer</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  /**
   * Generate plain text version of email
   * @param {string} summary - Meeting summary content
   * @param {string} senderName - Name of the sender (optional)
   * @returns {string} Plain text email content
   */
  generatePlainTextEmail(summary, senderName) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let plainText = `MEETING SUMMARY - ${currentDate}\n`;
    plainText += '='.repeat(50) + '\n\n';
    plainText += summary + '\n\n';
    
    if (senderName) {
      plainText += `Best regards,\n${senderName}\n\n`;
    }
    
    plainText += '-'.repeat(50) + '\n';
    plainText += 'This summary was generated by AI-powered Meeting Notes Summarizer\n';
    plainText += `Generated on ${new Date().toLocaleString()}`;
    
    return plainText;
  }

  /**
   * Send summary email to recipients
   * @param {object} options - Email options
   * @param {string} options.summary - Meeting summary content
   * @param {string[]} options.recipients - Array of recipient email addresses
   * @param {string} options.subject - Email subject line
   * @param {string} options.senderName - Name of the sender (optional)
   * @returns {Promise<object>} Email send result
   */
  async sendSummaryEmail({ summary, recipients, subject, senderName }) {
    try {
      // Check if email service is configured
      if (!this.transporter) {
        const error = new Error('Email service is not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
        error.name = 'AuthenticationError';
        throw error;
      }

      console.log(`📧 Preparing to send email to ${recipients.length} recipients...`);

      // Validate inputs
      if (!summary || !recipients || !recipients.length) {
        const error = new Error('Summary and recipients are required');
        error.name = 'InvalidRecipientsError';
        throw error;
      }

      // Validate email addresses
      const validRecipients = await this.validateEmails(recipients);
      if (validRecipients.length !== recipients.length) {
        const invalidEmails = recipients.filter(r => !validRecipients.includes(r.trim().toLowerCase()));
        const error = new Error(`Invalid email addresses found: ${invalidEmails.join(', ')}. Please check your recipients.`);
        error.name = 'InvalidRecipientsError';
        throw error;
      }

      // Generate email content
      const htmlContent = this.generateEmailTemplate(summary, senderName);
      const textContent = this.generatePlainTextEmail(summary, senderName);

      // Prepare email options
      const mailOptions = {
        from: `"${this.emailFromName}" <${this.emailUser}>`,
        to: validRecipients.join(', '),
        subject: subject || 'Meeting Summary',
        text: textContent,
        html: htmlContent,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'X-Mailer': 'Meeting Notes Summarizer v1.0'
        }
      };

      // Send email
      console.log(' Sending email...');
      const result = await this.transporter.sendMail(mailOptions);

      console.log('Email sent successfully:', result.messageId);

      return {
        success: true,
        messageId: result.messageId,
        recipients: validRecipients,
        sentAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(' Error sending email:', error);

      // Handle specific error types
      if (error.code === 'EAUTH') {
        const authError = new Error('Email authentication failed. Please check SMTP_USER and SMTP_PASS.');
        authError.name = 'AuthenticationError';
        throw authError;
      }

      if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
        const connectionError = new Error('Unable to connect to email server');
        connectionError.name = 'EmailDeliveryError';
        throw connectionError;
      }

      if (error.responseCode === 550 || error.responseCode === 553) {
        const deliveryError = new Error('Email delivery failed - invalid recipient or blocked');
        deliveryError.name = 'EmailDeliveryError';
        throw deliveryError;
      }

      if (error.responseCode === 421 || error.responseCode === 451) {
        const rateLimitError = new Error('Email rate limit exceeded');
        rateLimitError.name = 'RateLimitError';
        throw rateLimitError;
      }

      // Re-throw custom errors
      if (error.name === 'InvalidRecipientsError' || 
          error.name === 'AuthenticationError' || 
          error.name === 'EmailDeliveryError' || 
          error.name === 'RateLimitError') {
        throw error;
      }

      // Generic error
      const genericError = new Error('Failed to send email');
      genericError.name = 'EmailDeliveryError';
      throw genericError;
    }
  }

  /**
   * Verify email configuration and connectivity
   * @returns {Promise<boolean>} True if email service is working
   */
  async verifyConnection() {
    try {
      if (!this.transporter) {
        console.log('❌ Email service not configured');
        return false;
      }
      
      console.log('🔍 Verifying email service connection...');
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error);
      return false;
    }
  }

  /**
   * Send test email
   * @param {string} testRecipient - Email address to send test email to
   * @returns {Promise<object>} Test email result
   */
  async sendTestEmail(testRecipient) {
    try {
      const testSummary = `This is a test email from your Meeting Notes Summarizer backend.

Key Points:
• Email service is working correctly
• SMTP configuration is valid
• Ready to send meeting summaries

Test completed successfully at ${new Date().toLocaleString()}.`;

      const result = await this.sendSummaryEmail({
        summary: testSummary,
        recipients: [testRecipient],
        subject: ' Test Email - Meeting Notes Summarizer',
        senderName: 'System Test'
      });

      return result;
    } catch (error) {
      console.error('Test email failed:', error);
      throw error;
    }
  }

  /**
   * Send email (alias for sendSummaryEmail for consistency)
   * @param {object} options - Email options
   * @returns {Promise<object>} Email send result
   */
  async sendEmail(options) {
    return this.sendSummaryEmail(options);
  }

  /**
   * Get service status
   * @returns {object} Service status information
   */
  getStatus() {
    return {
      configured: !!(this.emailUser && this.emailPass),
      transporterAvailable: !!this.transporter,
      smtpHost: this.smtpHost,
      smtpPort: this.smtpPort,
      smtpSecure: this.smtpSecure,
      fromAddress: this.emailUser,
      fromName: this.emailFromName
    };
  }
}

// Export singleton instance
module.exports = new EmailService();
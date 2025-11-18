/*
 * DIRECT CALL FUNCTION - Reliable email sending for form submissions
 * This function is called directly from the frontend, not via Netlify events
 * Filepath: netlify/functions/send-welcome-email.js
 */

const { Resend } = require('resend');

exports.handler = async (event) => {
  // Set CORS headers for frontend calls
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  console.log("Welcome email function started");

  try {
    // Get API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is missing");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Configuration error" })
      };
    }

    // Parse request body
    const parsedBody = JSON.parse(event.body || '{}');
    const email = parsedBody.email;
    const role = parsedBody.role;
    const businessName = parsedBody.businessName;

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email is required" })
      };
    }

    console.log(`Sending welcome email to: ${email} (Role: ${role || 'unspecified'}) for business: ${businessName}`);
    const sanitizeForHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
    const sanitizeForText = (value) => String(value || '').trim();
    const friendlyName = sanitizeForHtml(businessName) || 'friend';
    const plainName = sanitizeForText(businessName) || 'friend';

    const greetingLineHtml = `Hey ${friendlyName},`;
    const greetingLineText = `Hey ${plainName},`;
    const ctaUrl = 'https://www.bizgoai.com/welcome';
    const twitterUrl = 'https://x.com/BizgoAI';
    const linkedinUrl = 'https://www.linkedin.com/company/bizgoai';
    const replyToAddress = 'contact@bizgoai.com';

    // Initialize Resend and send email
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'BizgoAI <contact@bizgoai.com>',
      reply_to: replyToAddress,
      to: [email],
      subject: "Welcome to BizgoAI community! 🎉",
      text: `${greetingLineText}\n\nThank you for trusting BizgoAI. You're now a founding member of the BizgoAI small-business community.\n\nWe're working hard to build a platform that cuts through the AI noise and delivers real, verified results for small businesses like yours.\n\nWe'll keep you posted on exclusive updates, launch dates, and member perks. You'll be the first to know.\n\nTalk soon,\nShani Carmi, Founder BizgoAI`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e1e1e; max-width:600px; margin:0 auto; padding:24px;">
          <p style="margin:0 0 12px;font-size:18px;font-weight:600;">${greetingLineHtml}</p>
          <p style="margin:0 0 12px;font-size:16px;">Thank you for trusting BizgoAI. You're now a founding member of the BizgoAI small-business community.</p>
          <p style="margin:0 0 12px;font-size:16px;">We're working hard to build a platform that cuts through the AI noise and delivers real, verified results for small businesses like yours.</p>
          <p style="margin:0 0 18px;font-size:16px;">We'll keep you posted on exclusive updates, launch dates, and member perks. You'll be the first to know.</p>
          <p style="margin:0 0 8px;font-size:16px;">Talk soon,</p>
          <p style="margin:0;font-size:16px;">Shani Carmi, Founder BizgoAI</p>
          <p style="margin:0 0 0 0;font-size:16px;"><a href="https://www.BizgoAI.com" style="color:#0a66c2;text-decoration:underline;">www.BizgoAI.com</a></p>
          <div style="margin-top:16px;font-size:16px;">
            Follow us on social accounts:<br />
            <a href="${linkedinUrl}" target="_blank" rel="noreferrer" style="color:#0a66c2;text-decoration:underline;">Linkedin</a>
            &nbsp;|&nbsp;
            <a href="${twitterUrl}" target="_blank" rel="noreferrer" style="color:#0a66c2;text-decoration:underline;">Twitter / X</a>
          </div>
        </div>
      `
    });

    console.log(`SUCCESS: Email sent to ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: "Welcome email sent successfully" 
      })
    };

  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Failed to send email",
        details: error.message 
      })
    };
  }
};
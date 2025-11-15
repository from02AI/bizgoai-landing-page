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
    const { email, role } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email is required" })
      };
    }

    console.log(`Sending welcome email to: ${email} (Role: ${role})`);

    // Initialize Resend and send email
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'BizgoAI <contact@BizgoAI.com>',
      to: [email],
      subject: "Welcome to BizgoAI community! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0b2e7b;">Welcome to the community!</h2>
          <p>Thank you for trusting BizgoAI. You're now a founding member of the BizgoAI small-business community.  the </p>
          <p>We're working hard to build a platform that cuts through the AI noise and delivers real, verified results for s-biz like you.</p>
          <p>We'll keep you posted on exclusive updates, launch dates, and member perks. You'll be the first to know.</p>
          <br>
          <p>Talk soon,</p>
          <p>Shani Carmi, Founder BizgoAI</p>
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
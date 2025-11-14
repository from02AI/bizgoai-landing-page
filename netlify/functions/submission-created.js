/*
 * This is the Netlify Function that sends your welcome email.
 * This version has enhanced, step-by-step logging to find the error.
 * Filepath: netlify/functions/submission-created.js
 */

// We will wrap EVERYTHING in a try/catch, even the 'require'
let Resend;
try {
  Resend = require('resend').Resend;
} catch (e) {
  console.error("CRITICAL: Failed to 'require' Resend. 'resend' is not installed.", e);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Function dependency failure." }),
  };
}

// Get your secret API key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("CRITICAL: RESEND_API_KEY is missing or undefined.");
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "API Key is missing." }),
  };
}

// Initialize Resend
let resend;
try {
  resend = new Resend(apiKey);
} catch (e) {
  console.error("CRITICAL: Failed to initialize 'new Resend(apiKey)'. API key is likely invalid.", e);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Resend initialization failed." }),
  };
}


// This is the main function that Netlify will run
exports.handler = async (event) => {
  // This is the first log. If you see this, the function is running.
  console.log("Function 'submission-created' has started.");

  try {
    // 1. Get the user's email from the form submission
    const submission = JSON.parse(event.body).payload.data;
    const userEmail = submission.email;

    if (!userEmail) {
      console.warn("No email found in submission.");
      return { statusCode: 400, body: "No email provided." };
    }

    console.log(`Payload received. Attempting to send email to: ${userEmail}`);

    // 2. Send the welcome email using Resend
    // IMPORTANT: 'from' address must be from a domain verified in Resend.
    await resend.emails.send({
      from: 'BizGoAI <welcome@bizgoai.com>', 
      to: [userEmail],
      subject: "You're a Founding Member of BizGoAI! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0b2e7b;">Welcome to the community!</h2>
          <p>You're officially a <strong>founding member</strong> of the BizGoAI small business community. Thank you for trusting us.</p>
          <p>We're working hard to build a platform that cuts through the AI noise and delivers real, verified results for business owners like you.</p>
          <p>We'll keep you posted on exclusive updates, launch dates, and member perks. You'll be the first to know.</p>
          <br>
          <p>Talk soon,</p>
          <p>The BizGoAI Team</p>
        </div>
      `,
    });

    // 3. Return a success message
    console.log(`SUCCESS: Welcome email sent to: ${userEmail}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Welcome email sent successfully." }),
    };

  } catch (error) {
    // 4. Handle any errors
    console.error("FAILURE: Error during email send:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
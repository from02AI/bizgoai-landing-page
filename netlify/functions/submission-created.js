/*
 * This is the Netlify Function that sends your welcome email.
 * Filepath: netlify/functions/submission-created.js
 */

// Import the Resend SDK
import { Resend } from 'resend';

// Get your secret API key from Netlify's Environment Variables
// This will be set in your Netlify dashboard
const resend = new Resend(process.env.RESEND_API_KEY);

// This is the main function that Netlify will run
export const handler = async (event) => {
  try {
    // 1. Get the user's email from the form submission
    // Netlify passes the form data in the 'event.body'
    const submission = JSON.parse(event.body).payload.data;
    const userEmail = submission.email;

    // 2. Make sure an email was actually provided
    if (!userEmail) {
      console.warn("No email found in submission.");
      return { statusCode: 400, body: "No email provided." };
    }

    // 3. Send the welcome email using Resend
    // IMPORTANT: You must change 'welcome@bizgoai.com' to an email from a 
    // domain you have verified in your Resend account.
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

    // 4. Return a success message
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Welcome email sent successfully." }),
    };

  } catch (error) {
    // 5. Handle any errors
    console.error("Error sending welcome email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send welcome email." }),
    };
  }
};
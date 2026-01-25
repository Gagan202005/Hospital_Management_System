const nodemailer = require("nodemailer");
require('dotenv').config();

/**
 * Utility to send emails using Nodemailer
 * @param {String} email - Recipient's email address
 * @param {String} title - Subject of the email
 * @param {String} body - HTML body content
 */
const mailSender = async (email, title, body) => {
  try {
    // =================================================================
    // 1. CREATE TRANSPORTER
    // =================================================================
    // Configures the connection to the SMTP server (e.g., Gmail, AWS SES)
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // e.g., smtp.gmail.com
      auth: {
        user: process.env.MAIL_USER, // Your email address
        pass: process.env.MAIL_PASS, // Your App Password (not login password)
      },
    });

    // =================================================================
    // 2. SEND EMAIL
    // =================================================================
    let info = await transporter.sendMail({
      from: `"City Care Hospital" <${process.env.MAIL_USER}>`, // Custom Alias
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`, // Supports HTML formatting
    });

    console.log("Email sent successfully:", info.messageId);
    return info;

  } catch (error) {
    // =================================================================
    // 3. ERROR HANDLING
    // =================================================================
    console.log("Error sending email:", error.message);
    // You might want to throw the error here if the calling function needs to know it failed
    // throw error; 
  }
};

module.exports = mailSender;
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
    // 1. CREATE TRANSPORTER (UPDATED FOR PRODUCTION)
    // =================================================================
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // Ensure this is "smtp.gmail.com"
      port: 465,                   // Secure port for Gmail
      secure: true,                // Must be true for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Google App Password
      },
    });

    // =================================================================
    // 2. SEND EMAIL
    // =================================================================
    let info = await transporter.sendMail({
      from: `"MediCare General Hospital" <${process.env.MAIL_USER}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log("Email sent successfully:", info.messageId);
    return info;

  } catch (error) {
    // =================================================================
    // 3. ERROR HANDLING
    // =================================================================
    console.log("Error sending email:", error.message);
    // return error; // Optional: return error if you want to handle it in controller
  }
};

module.exports = mailSender;
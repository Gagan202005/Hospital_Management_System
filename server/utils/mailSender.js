const nodemailer = require("nodemailer");
require('dotenv').config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // --------------------------------------------------------
      // CRITICAL FIXES FOR DEPLOYMENT
      // --------------------------------------------------------
      tls: {
        rejectUnauthorized: true, // Should be true for security
        minVersion: "TLSv1.2"
      },
      // Force IPv4 (Fixes timeouts on some cloud networks)
      family: 4, 
      // Add timeouts to fail fast if it's blocked
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
      socketTimeout: 10000,     // 10 seconds
      // Enable logging to see the handshake process
      debug: true, 
      logger: true 
    });

    let info = await transporter.sendMail({
      from: `"MediCare General Hospital" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent successfully:", info.messageId);
    return info;

  } catch (error) {
    console.log("Error sending email:", error.message);
    // If you see "Connection timeout" here, your HOST is blocking the port.
  }
};

module.exports = mailSender;
const nodemailer = require("nodemailer");
require('dotenv').config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,              // CHANGE: Use Port 587 instead of 465
      secure: false,          // CHANGE: Must be FALSE for Port 587
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
      },
      // Keep timeouts to fail fast if blocked
      connectionTimeout: 10000, 
      debug: true, 
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
  }
};

module.exports = mailSender;
const nodemailer = require("nodemailer");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mailSender = async (email, title, body) => {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error("MAIL_USER or MAIL_PASS is not set in environment variables");
      return;
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
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
    console.error("Error sending email:", error.message);
  }
};

module.exports = mailSender;


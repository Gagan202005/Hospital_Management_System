const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const mailSender = async (email, title, body) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `MediCare General Hospital <${process.env.MAIL_FROM}>`,
        to: email,
        subject: title,
        html: body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error sending email:", JSON.stringify(data));
      return;
    }

    console.log("Email sent successfully:", data.id);
    return data;

  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

module.exports = mailSender;



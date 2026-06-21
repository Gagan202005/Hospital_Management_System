require('dotenv').config();

const mailSender = async (email, title, body) => {
  try {
    const credentials = Buffer.from(
      `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`
    ).toString('base64');

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: process.env.MAIL_USER,
              Name: "MediCare General Hospital",
            },
            To: [{ Email: email }],
            Subject: title,
            HTMLPart: body,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Error sending email:", data.ErrorMessage || JSON.stringify(data));
      return;
    }

    console.log("Email sent successfully:", data.Messages[0].To[0].MessageID);
    return data;

  } catch (error) {
    console.log("Error sending email:", error.message);
  }
};

module.exports = mailSender;

exports.appointmentExpiryEmail = (name, date, doctorName) => {
    const formattedDate = new Date(date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Appointment Expired</title>
        <style>
            body { background-color: #f4f7f6; font-family: 'Segoe UI', sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; border-top: 5px solid #94a3b8; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .content { padding: 40px 30px; }
            .title { font-size: 20px; font-weight: bold; color: #475569; margin-bottom: 15px; }
            .message { color: #64748b; line-height: 1.6; margin-bottom: 25px; }
            .info-box { background-color: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #94a3b8; margin-bottom: 25px; }
            .btn { display: inline-block; background-color: #475569; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #cbd5e1; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="title">Appointment Request Expired</div>
                <p class="message">Dear <strong>${name}</strong>,<br><br>
                Your pending appointment request with <strong>Dr. ${doctorName}</strong> was not confirmed within the valid timeframe and has now expired.</p>
                
                <div class="info-box">
                    <strong>Date:</strong> ${formattedDate}<br>
                    <strong>Status:</strong> Cancelled (System Auto-Expiry)
                </div>

                <p class="message">Don't worry! You can easily book a new slot that works for you.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || '#'}/find-doctor" class="btn">Book New Appointment</a>
                </div>
            </div>
            <div class="footer">
                City Care Hospital Automated System
            </div>
        </div>
    </body>
    </html>
    `;
};
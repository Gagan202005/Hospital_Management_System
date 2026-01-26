exports.appointmentConfirmationEmail = (name, date, time, doctorName, doctorEmail, reason, newAccountPassword = null) => {
    
    const formattedDate = new Date(date).toLocaleDateString("en-US", { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Appointment Confirmed</title>
        <style>
            body { background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            
            /* Header */
            .header { background: linear-gradient(135deg, #4F46E5 0%, #3730a3 100%); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
            .header p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; }

            /* Content */
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; }
            
            /* Main Details Card */
            .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 10px 0; }
            .row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #64748b; font-size: 14px; }
            .value { font-weight: 700; color: #0f172a; text-align: right; }

            /* Doctor Section */
            .doctor-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 25px; }
            .doc-title { font-weight: bold; color: #1e40af; display: block; margin-bottom: 5px; }
            .doc-detail { font-size: 14px; color: #334155; margin: 2px 0; }

            /* New Account Section */
            .account-box { background-color: #fdf4ff; border: 1px dashed #d946ef; padding: 20px; border-radius: 8px; margin-top: 25px; text-align: center; }
            .account-header { color: #86198f; font-weight: bold; font-size: 16px; margin-bottom: 10px; display: block; }
            .password-display { background: #ffffff; padding: 8px 15px; border-radius: 6px; font-family: monospace; font-weight: bold; color: #d946ef; font-size: 18px; letter-spacing: 1px; border: 1px solid #f0abfc; }

            /* Instructions */
            .instructions { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .instructions h3 { font-size: 15px; color: #333; margin-bottom: 10px; }
            .instructions ul { padding-left: 20px; color: #64748b; font-size: 14px; }
            .instructions li { margin-bottom: 5px; }

            /* Footer */
            .footer { background-color: #1e293b; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
            .footer a { color: #cbd5e1; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Confirmed</h1>
                <p>City Care Hospital Booking System</p>
            </div>
            
            <div class="content">
                <p class="greeting">Hello <strong>${name}</strong>,</p>
                <p>Your appointment has been successfully scheduled. We look forward to seeing you.</p>

                <div class="card">
                    <div class="row">
                        <span class="label">Date</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div class="row">
                        <span class="label">Time Slot</span>
                        <span class="value">${time}</span>
                    </div>
                    <div class="row">
                        <span class="label">Primary Concern</span>
                        <span class="value">${reason}</span>
                    </div>
                </div>

                <div class="doctor-box">
                    <span class="doc-title">👨‍⚕️ Medical Practitioner</span>
                    <p class="doc-detail"><strong>Name:</strong> Dr. ${doctorName}</p>
                    <p class="doc-detail"><strong>Email:</strong> ${doctorEmail}</p>
                </div>

                ${newAccountPassword ? `
                <div class="account-box">
                    <span class="account-header">🆕 Patient Portal Account Created</span>
                    <p style="font-size:13px; color:#555; margin-bottom:15px;">Use these credentials to view your medical history and reports online.</p>
                    <div>
                        <span class="password-display">${newAccountPassword}</span>
                    </div>
                    <p style="font-size:11px; margin-top:10px; color:#888;">*Please change this password after your first login.</p>
                </div>
                ` : ''}

                <div class="instructions">
                    <h3>Preparing for your visit:</h3>
                    <ul>
                        <li>Please arrive <strong>15 minutes early</strong> to complete registration.</li>
                        <li>Bring a valid government ID and your insurance card.</li>
                        <li>If you need to cancel, please contact Dr. ${doctorName} at least 24 hours in advance.</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} City Care Hospital. All rights reserved.</p>
                <p>123 Health Avenue, Mesra, Jharkhand</p>
                <p>Need help? <a href="mailto:support@citycare.com">Contact Support</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
};
exports.appointmentStatusUpdateEmail = (name, date, time, status, doctorName, reason = "") => {
    
    const formattedDate = new Date(date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Status Styling Logic
    let statusColor = "#3b82f6"; // Blue (Default)
    let statusBg = "#eff6ff";
    let messageBody = "";

    if (status === "Confirmed") {
        statusColor = "#10b981"; // Green
        statusBg = "#ecfdf5";
        messageBody = `Great news! Dr. ${doctorName} has confirmed your appointment. Please arrive 15 minutes early for registration.`;
    } else if (status === "Cancelled") {
        statusColor = "#ef4444"; // Red
        statusBg = "#fef2f2";
        messageBody = `We regret to inform you that your appointment has been cancelled. ${reason ? `Reason: ${reason}` : "Please visit our portal to reschedule."}`;
    } else if (status === "Completed") {
        statusColor = "#6366f1"; // Indigo
        statusBg = "#e0e7ff";
        messageBody = "Thank you for visiting City Care Hospital. Your consultation is marked as complete. You can view your prescription online.";
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Appointment Update</title>
        <style>
            body { background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background-color: ${statusColor}; padding: 30px; text-align: center; color: #ffffff; }
            .content { padding: 40px 30px; }
            .status-badge { background-color: ${statusBg}; color: ${statusColor}; padding: 8px 16px; border-radius: 50px; font-weight: bold; font-size: 14px; display: inline-block; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .details-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #f8fafc; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding: 10px 0; }
            .row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #64748b; font-size: 14px; }
            .value { font-weight: 700; color: #0f172a; text-align: right; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Update</h1>
            </div>
            <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                <div style="text-align: center;">
                    <span class="status-badge">${status}</span>
                </div>
                <p>${messageBody}</p>

                <div class="details-box">
                    <div class="row">
                        <span class="label">Doctor</span>
                        <span class="value">Dr. ${doctorName}</span>
                    </div>
                    <div class="row">
                        <span class="label">Date</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    ${time ? `
                    <div class="row">
                        <span class="label">Time Slot</span>
                        <span class="value">${time}</span>
                    </div>` : ''}
                </div>

                <p style="font-size: 13px; color: #64748b; text-align: center;">Log in to your portal for full details.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} City Care Hospital.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
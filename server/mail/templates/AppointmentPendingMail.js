const appointmentPendingTemplate = (firstName, date, time, reason, doctorName, department) => {
    
    // Format date nicely (e.g., "Mon, Jan 26, 2026")
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Appointment Request Pending</title>
    <style>
        body {
            background-color: #f4f4f7;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #4F46E5;
            color: #ffffff;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .status-badge {
            background-color: #FEF3C7;
            color: #D97706;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .content {
            padding: 32px;
        }
        .details-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .details-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px dashed #e5e7eb;
            padding-bottom: 10px;
        }
        .details-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .label {
            color: #6b7280;
            font-weight: 500;
        }
        .value {
            font-weight: 600;
            color: #111827;
            text-align: right;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Request Received</h1>
        </div>

        <div class="content">
            <p>Dear <strong>${firstName}</strong>,</p>
            <p>Your appointment request has been received and is currently waiting for confirmation.</p>
            
            <div style="text-align: center;">
                <span class="status-badge">Status: Pending Approval</span>
            </div>

            <div class="details-box">
                <div class="details-row">
                    <span class="label">Doctor</span>
                    <span class="value">Dr. ${doctorName}</span>
                </div>
                <div class="details-row">
                    <span class="label">Department</span>
                    <span class="value">${department}</span>
                </div>
                
                <div class="details-row">
                    <span class="label">Date</span>
                    <span class="value">${formattedDate}</span>
                </div>
                <div class="details-row">
                    <span class="label">Time</span>
                    <span class="value">${time}</span>
                </div>
                <div class="details-row">
                    <span class="label">Reason</span>
                    <span class="value">${reason || "General Consultation"}</span>
                </div>
            </div>

            <p>We will notify you via email as soon as <strong>Dr. ${doctorName}</strong> confirms your slot.</p>
            
            <p style="margin-top: 30px;">
                Best Regards,<br>
                <strong>The MediCare Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>© ${new Date().getFullYear()} MediCare Hospital System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = appointmentPendingTemplate;
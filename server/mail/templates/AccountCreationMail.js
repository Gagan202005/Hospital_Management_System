exports.accountCreationEmail = (name, email, password, userId, role) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Welcome to City Care Hospital</title>
        <style>
            body { background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #00acc1; padding: 30px; text-align: center; color: #ffffff; }
            .content { padding: 40px 30px; }
            .role-badge { background-color: #e0f7fa; color: #006064; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .credentials-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #00acc1; border-radius: 4px; padding: 20px; margin: 25px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; }
            .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .label { font-weight: 600; color: #64748b; font-size: 14px; }
            .value { font-weight: 700; color: #0f172a; font-family: monospace; font-size: 15px; }
            .alert { background-color: #fff1f2; color: #9f1239; padding: 15px; border-radius: 6px; font-size: 13px; margin-top: 20px; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to City Care</h1>
            </div>
            <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                <p>Your account has been successfully created in our system as a <span class="role-badge">${role}</span>.</p>
                
                <p>Please use the credentials below to log in for the first time:</p>

                <div class="credentials-box">
                    <div class="row">
                        <span class="label">User ID</span>
                        <span class="value">${userId}</span>
                    </div>
                    <div class="row">
                        <span class="label">Email</span>
                        <span class="value">${email}</span>
                    </div>
                    <div class="row">
                        <span class="label">Temporary Password</span>
                        <span class="value">${password}</span>
                    </div>
                </div>

                <div class="alert">
                    <strong>⚠️ Security Alert:</strong> Please change your password immediately after your first login.
                </div>
                
                <p style="margin-top: 30px;">Best Regards,<br><strong>Hospital Administration</strong></p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} City Care Hospital. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
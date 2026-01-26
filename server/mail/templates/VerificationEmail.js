exports.otpVerificationEmail = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>OTP Verification</title>
        <style>
            body { background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
            
            /* Header */
            .header { background: linear-gradient(135deg, #00acc1 0%, #007c91 100%); padding: 25px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; }
            
            /* Content */
            .content { padding: 35px 30px; text-align: center; }
            .text { font-size: 16px; color: #475569; margin-bottom: 25px; line-height: 1.5; }
            
            /* OTP Box */
            .otp-box { 
                background-color: #f0fdfa; 
                border: 2px dashed #00acc1; 
                border-radius: 8px; 
                padding: 15px; 
                display: inline-block; 
                margin: 10px 0 25px 0; 
            }
            .otp-code { 
                font-family: monospace; 
                font-size: 32px; 
                font-weight: bold; 
                color: #0e7490; 
                letter-spacing: 5px; 
            }
            
            .warning { font-size: 13px; color: #94a3b8; margin-top: 20px; }
            
            /* Footer */
            .footer { background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #cbd5e1; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Email</h1>
            </div>
            <div class="content">
                <p class="text">Hello,</p>
                <p class="text">Please use the verification code below to complete your registration at <strong>City Care Hospital</strong>.</p>
                
                <div class="otp-box">
                    <span class="otp-code">${otp}</span>
                </div>

                <p class="text">This code is valid for <strong>5 minutes</strong>.</p>
                
                <p class="warning">If you did not request this code, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} City Care Hospital. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/VerificationEmail");

const OTPSchema = new mongoose.Schema({
    // =================================================================
    // OTP DETAILS
    // =================================================================
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    
    // =================================================================
    // TTL (Time-To-Live) INDEX
    // =================================================================
    // The document will be automatically deleted 5 minutes after creation
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, 
    },
});

// =================================================================
// HELPER: SEND VERIFICATION EMAIL
// =================================================================
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email from MediCare",
            emailTemplate(otp) // Passes the OTP to the HTML template
        );
        console.log("Email sent successfully");
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
}

// =================================================================
// PRE-SAVE HOOK
// =================================================================
// Triggers the email *before* the document is actually saved in MongoDB
OTPSchema.pre("save", async function (next) {
    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
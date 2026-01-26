const mongoose = require("mongoose");

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

// NOTE: We removed the pre("save") hook here because we are sending
// the email manually in the controller.

module.exports = mongoose.model("OTP", OTPSchema);
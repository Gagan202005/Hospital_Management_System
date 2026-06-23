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

module.exports = mongoose.model("OTP", OTPSchema);
const express = require("express");
const router = express.Router();
const {isDemo} = require("../middlewares/isDemo");
// Middleware Imports
const { auth } = require("../middlewares/auth");

// Controller Imports
const { signup, sendotp } = require("../controllers/Patientcontroller");
const { login, changePassword } = require("../controllers/Login");
const { contactUs, getGeminiResponse } = require("../controllers/Common");


// ==========================================================================
// AUTHENTICATION ROUTES
// ==========================================================================

// Route for user login (Handles Doctor, Patient, and Admin login)
router.post("/login", login);

// Route for Patient registration
router.post("/signup", signup);

// Route for sending OTP to verify email during registration
router.post("/sendotp", sendotp);

// Route to change password (Requires user to be logged in)
router.post("/change-password", auth,isDemo, changePassword);


// ==========================================================================
// UTILITY & COMMON ROUTES
// ==========================================================================

// Route for handling contact form submissions
router.post("/contact", contactUs);

// Route for AI Chatbot (Gemini API) interactions
router.post("/chat", getGeminiResponse);


module.exports = router;
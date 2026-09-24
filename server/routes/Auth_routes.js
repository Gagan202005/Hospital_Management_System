const express = require("express");
const router = express.Router();
const {isDemo} = require("../middlewares/isDemo");
// Middleware Imports
const { auth } = require("../middlewares/auth");
const { authLimiter, strictLimiter } = require("../middlewares/rateLimiter");

// Controller Imports
const { signup, sendotp } = require("../controllers/Patientcontroller");
const { login, refreshAccessToken, logout, changePassword } = require("../controllers/Login");
const { contactUs, getGeminiResponse } = require("../controllers/Common");


// ==========================================================================
// AUTHENTICATION ROUTES
// ==========================================================================

// Route for user login (Handles Doctor, Patient, and Admin login)
router.post("/login", authLimiter, login);

// Route for Patient registration
router.post("/signup", authLimiter, signup);

// Route for sending OTP to verify email during registration
router.post("/sendotp", authLimiter, sendotp);

// Route to change password (Requires user to be logged in)
router.post("/change-password", auth, isDemo, strictLimiter, changePassword);

// Route to refresh access token using refresh token cookie
router.post("/refresh", refreshAccessToken);

// Route to logout (revokes refresh token from Redis)
router.post("/logout", logout);


// ==========================================================================
// UTILITY & COMMON ROUTES
// ==========================================================================

// Route for handling contact form submissions
router.post("/contact", strictLimiter, contactUs);

// Route for AI Chatbot (Gemini API) interactions
router.post("/chat", getGeminiResponse);


module.exports = router;
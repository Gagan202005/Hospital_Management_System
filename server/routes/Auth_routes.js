const express = require("express");
const router = express.Router();

const {
    isPatient,auth
} = require("../middlewares/auth");

const {signup,sendotp} = require("../controllers/Patientcontroller");
const {login , changePassword} = require("../controllers/Login");
const {contactUs} = require("../controllers/Common")
// Route for user login
router.post("/login", login);

// Route for user signup
router.post("/signup",signup);

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp);

router.post("/change-password",auth, changePassword);
router.post("/contact", contactUs);
module.exports = router;
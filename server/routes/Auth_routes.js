const express = require("express");
const router = express.Router();

const {
    isPatient
} = require("../middlewares/auth");

const {signup,sendotp} = require("../controllers/Patientcontroller");
const {login} = require("../controllers/Login");
// Route for user login
router.post("/login", login);

// Route for user signup
router.post("/signup",signup);

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp);


module.exports = router;
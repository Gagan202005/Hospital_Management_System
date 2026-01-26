const express = require("express");
const router = express.Router();

// Middleware Imports
const { auth, isPatient } = require("../middlewares/auth");
const {isDemo} = require("../middlewares/isDemo");

// Controller Imports
const { getalluserdetails } = require("../controllers/Login");
const { updateDisplayPicture } = require("../controllers/Common");
const {
  getallreports,
  editprofile,
  getPatientAppointments,
  getPatientDashboardStats
} = require("../controllers/Patientcontroller");


// ==========================================================================
// PATIENT PROFILE & SETTINGS
// ==========================================================================

// Get logged-in patient's full details
router.get("/getPatientDetails", auth, isPatient, getalluserdetails);

// Update profile information
router.post("/editprofile", auth,isDemo, isPatient, editprofile);

// Update profile picture
router.post("/updateDisplayPicture", auth,isDemo, isPatient, updateDisplayPicture);


// ==========================================================================
// MEDICAL RECORDS & APPOINTMENTS
// ==========================================================================

// Get all medical reports/prescriptions associated with the patient
router.get("/MyReports", auth, isPatient, getallreports);

// Get list of all appointments (Upcoming & Past)
router.get("/appointments", auth, isPatient, getPatientAppointments);


// ==========================================================================
// DASHBOARD
// ==========================================================================

// Get Dashboard Statistics (Active Appts, Last Visit, Vitals Overview)
router.get("/dashboard-stats", auth, isPatient, getPatientDashboardStats);


module.exports = router;
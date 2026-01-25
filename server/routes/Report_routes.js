const express = require("express");
const router = express.Router();

// Middleware Imports
const { auth, isDoctor } = require("../middlewares/auth");

// Controller Imports
const { 
  createVisitReport, 
  getReportByAppointment, 
  updateVisitReport 
} = require("../controllers/ReportController");


// ==========================================================================
// REPORT MANAGEMENT (Write Operations)
// ==========================================================================

// Create a new medical visit report (Doctor Only)
router.post("/create", auth, isDoctor, createVisitReport);

// Update an existing report (Doctor Only)
router.put("/update", auth, isDoctor, updateVisitReport);


// ==========================================================================
// REPORT VIEWING (Read Operations)
// ==========================================================================

// Fetch report by Appointment ID (Accessible to both Doctor & Patient via 'auth')
router.get("/get/:appointmentId", auth, getReportByAppointment);


module.exports = router;
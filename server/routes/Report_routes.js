const express = require("express");
const router = express.Router();

// Middleware
const { auth, isDoctor } = require("../middlewares/auth");

// Controllers
const { 
  createVisitReport, 
  getReportByAppointment 
} = require("../controllers/ReportController");



// =================================================================
// REPORT ROUTES
// =================================================================

// 1. Create Report (Mark Appointment as Completed)
// Only a Doctor can do this
router.post("/create", auth, isDoctor, createVisitReport);

// 2. View Report 
// Authenticated users (Doctor or Patient) can view specific reports
router.get("/:appointmentId", auth, getReportByAppointment);
module.exports = router;
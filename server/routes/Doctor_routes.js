const express = require("express");
const router = express.Router();

// Middleware Imports
const { auth, isDoctor } = require("../middlewares/auth");

// Controller Imports
const { getalluserdetails } = require("../controllers/Login");
const { updateDisplayPicture } = require("../controllers/Common");
const {
  updateDoctorProfile,
  getPublicDoctors,
  getDoctorDetails,
  getDoctorPatients,
  getDoctorAppointments,
  updateAppointmentStatus,
  bookAppointment,
  getAvailableSlots,
  getDoctorDashboardStats,
  createTimeSlot,
  getTimeSlots,
  deleteTimeSlot
} = require("../controllers/Doctorcontroller");


// ==========================================================================
// DOCTOR PROFILE & DASHBOARD
// ==========================================================================

// Get logged-in doctor's details
router.get("/getDoctorDetails", auth, isDoctor, getalluserdetails);

// Update profile details
router.put("/editprofile", auth, isDoctor, updateDoctorProfile);

// Update profile picture (Protected by Demo Check)
router.put("/updateDisplayPicture", auth, isDoctor, updateDisplayPicture);

// Get Dashboard Statistics (KPIs, Charts, Recent Activity)
router.get("/dashboard-stats", auth, isDoctor, getDoctorDashboardStats);


// ==========================================================================
// TIME SLOT MANAGEMENT
// ==========================================================================

// Create a new time slot
router.post("/add-time-slot", auth, isDoctor, createTimeSlot);

// Fetch all created time slots
router.get("/get-time-slots", auth, isDoctor, getTimeSlots);

// Delete a specific time slot
router.delete("/delete-time-slot", auth, isDoctor, deleteTimeSlot);


// ==========================================================================
// CLINICAL MANAGEMENT (Patients & Appointments)
// ==========================================================================

// Get list of unique patients treated by this doctor
router.get("/patients", auth, isDoctor, getDoctorPatients);

// Get all appointments for this doctor (with filters)
router.get("/appointments", auth, isDoctor, getDoctorAppointments);

// Update appointment status (e.g., Pending -> Confirmed/Completed)
router.post("/update-status", auth, isDoctor, updateAppointmentStatus);


// ==========================================================================
// PUBLIC ROUTES & BOOKING FLOW
// ==========================================================================

// Search for doctors (No auth required)
router.get("/public/search", getPublicDoctors);

// View specific doctor's public profile
router.get("/public/profile/:id", getDoctorDetails);

// Get Available Slots for a specific doctor & date
// Usage: /slots/123?date=2024-12-25
router.get("/slots/:doctorId", getAvailableSlots);

// Book an appointment (Requires Patient Auth)
router.post("/book", auth, bookAppointment);


module.exports = router;
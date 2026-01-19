// Import the required modules
const express = require("express")
const router = express.Router()
const {getalluserdetails} = require("../controllers/Login");
const {
  auth,isDoctor
} = require("../middlewares/auth");
const {isDemo} = require("../middlewares/demo");
const {
  updateDoctorProfile,getPublicDoctors,getDoctorDetails,getDoctorPatients,getDoctorAppointments,updateAppointmentStatus,bookAppointment, 
  getAvailableSlots 
} = require("../controllers/Doctorcontroller")
const {updateDisplayPicture} = require("../controllers/Common")
const { 
  createTimeSlot, 
  getTimeSlots, 
  deleteTimeSlot 
} = require("../controllers/Doctorcontroller");

// Define Routes
// Matches: ADD_TIME_SLOT_API
router.post("/add-time-slot", auth, isDoctor, createTimeSlot);

// Matches: FETCH_TIME_SLOTS_API
router.get("/get-time-slots", auth, isDoctor, getTimeSlots);

// Matches: DELETE_TIME_SLOT_API
router.delete("/delete-time-slot", auth, isDoctor, deleteTimeSlot);

router.get("/getDoctorDetails",auth,isDoctor,getalluserdetails);
router.put("/editprofile",auth,isDemo,isDoctor,updateDoctorProfile);
router.put("/updateDisplayPicture",auth,isDemo,isDoctor,updateDisplayPicture);

// Public route - No auth middleware needed for searching doctors
router.get("/public/search", getPublicDoctors);
router.get("/public/profile/:id", getDoctorDetails);
// Get Patients List (Derived from appointments)
router.get("/patients", auth, isDoctor, getDoctorPatients);
router.get("/appointments", auth, isDoctor, getDoctorAppointments);
router.post("/update-status", auth, isDoctor, updateAppointmentStatus);

// =================================================================
// BOOKING ROUTES
// =================================================================

// 1. Get Available Slots for a Doctor (Public)
// Query Params: ?date=2024-12-25
router.get("/slots/:doctorId", getAvailableSlots);

// 2. Book an Appointment (Public or Protected)
// If you want guests to book, remove 'auth'. 
// If you use the 'soft auth' logic we discussed (req.user ?), keeps it flexible.
// For now, assuming Public Booking is allowed:
router.post("/book", bookAppointment);


module.exports = router;


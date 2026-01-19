const express = require("express");
const router = express.Router();
const {
  auth,
} = require("../middlewares/auth");
// Import Controllers
const { 
  getAvailableSlots, 
  bookAppointment 
} = require("../controllers/Doctorcontroller");

// --- Routes ---

// Get available slots for a specific doctor on a specific date
// URL: /api/v1/appointment/slots/:doctorId?date=YYYY-MM-DD
router.get("/slots/:doctorId", getAvailableSlots);

// Book an appointment
// URL: /api/v1/appointment/book
router.post("/book",auth,bookAppointment);

module.exports = router;
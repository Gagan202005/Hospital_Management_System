// Import the required modules
const express = require("express")
const router = express.Router()
const {getalluserdetails} = require("../controllers/Login");
const {
  auth,isDoctor
} = require("../middlewares/auth");
const {isDemo} = require("../middlewares/demo");
const {
  makingreport,updateDoctorProfile,getPublicDoctors,getDoctorDetails
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
router.post("/MakingReport",auth,isDoctor,isDemo,makingreport);

router.get("/getDoctorDetails",auth,isDoctor,getalluserdetails);
router.put("/editprofile",auth,isDemo,isDoctor,updateDoctorProfile);
router.put("/updateDisplayPicture",auth,isDemo,isDoctor,updateDisplayPicture);

// Public route - No auth middleware needed for searching doctors
router.get("/public/search", getPublicDoctors);
router.get("/public/profile/:id", getDoctorDetails);


module.exports = router;


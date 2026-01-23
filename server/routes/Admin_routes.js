const express = require("express");
const router = express.Router();
const {isAdmin,auth} = require("../middlewares/auth")

const {addDoctor,addAdmin,add_nurse,updateDoctor,
    discharge_patient,addPatient,updatePatient, deletePatient,getAllUsers,deleteDoctor,
    fixAppointment,updateAdminProfile,getAdminDashboardStats,
    addAmbulance, 
    getAllAmbulances, 
    updateAmbulance, 
    deleteAmbulance,
    bookAmbulance,
    completeAmbulanceTrip,
addBed, getAllBeds, updateBed, deleteBed,
    allocateBed, dischargeBed} = require("../controllers/Admincontroller");

const {updateDisplayPicture} = require("../controllers/Common")


router.post("/add-doctor", auth, isAdmin, addDoctor);
router.delete("/delete-doctor", auth, isAdmin, deleteDoctor);

router.post("/add-admin", auth, isAdmin, addAdmin);

router.post("/Add_Nurse",auth,isAdmin,add_nurse);
// Use the unified function
router.get("/get-all-users", auth, isAdmin, getAllUsers);
router.post("/add-patient", auth, isAdmin, addPatient);
// Update Details
router.put("/updateProfile", auth, isAdmin, updateAdminProfile);
// Update Image (Ensure you have 'express-fileupload' middleware enabled in index.js)
router.put("/updateImage", auth, isAdmin, updateDisplayPicture);
router.post("/Allocate_Bed",auth,isAdmin,allocateBed);
router.post("/Discharge_Patient",auth,isAdmin,discharge_patient);
router.get("/dashboard-stats", auth, isAdmin, getAdminDashboardStats);
router.put("/update-patient", auth, isAdmin, updatePatient);
router.delete("/delete-patient", auth, isAdmin, deletePatient);
router.put("/update-doctor", auth, isAdmin, updateDoctor);


// Ambulance Routes
router.post("/add-ambulance", auth, isAdmin, addAmbulance);
router.put("/update-ambulance", auth, isAdmin, updateAmbulance);
router.delete("/delete-ambulance", auth, isAdmin, deleteAmbulance);
router.get("/get-all-ambulances", auth, isAdmin, getAllAmbulances);

// Booking Routes
router.post("/book-ambulance", auth, isAdmin, bookAmbulance);
router.put("/complete-ambulance-trip", auth, isAdmin, completeAmbulanceTrip);

// Bed Management
router.post("/add-bed", auth, isAdmin, addBed);
router.put("/update-bed", auth, isAdmin, updateBed);
router.delete("/delete-bed", auth, isAdmin, deleteBed);
router.get("/get-all-beds", auth, isAdmin, getAllBeds);

// Bed Operations
router.post("/allocate-bed", auth, isAdmin, allocateBed);
router.put("/discharge-bed", auth, isAdmin, dischargeBed);


router.post("/fix-appointment", auth, isAdmin, fixAppointment);
module.exports = router;
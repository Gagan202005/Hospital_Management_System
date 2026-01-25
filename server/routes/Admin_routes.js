const express = require("express");
const router = express.Router();
const { isAdmin, auth } = require("../middlewares/auth");

const {
    // Admin & User Stats
    addAdmin,
    updateAdminProfile,
    getAdminDashboardStats,
    getAllUsers,
    
    // Doctor Ops
    addDoctor,
    updateDoctor,
    deleteDoctor,

    // Patient Ops
    addPatient,
    updatePatient,
    deletePatient,
    discharge_patient,
    
    // Appointments
    fixAppointment,

    // Ambulance Ops
    addAmbulance,
    getAllAmbulances,
    updateAmbulance,
    deleteAmbulance,
    bookAmbulance,
    completeAmbulanceTrip,

    // Bed Ops
    addBed,
    getAllBeds,
    updateBed,
    deleteBed,
    allocateBed,
    dischargeBed
} = require("../controllers/Admincontroller");

const { updateDisplayPicture } = require("../controllers/Common");


// ==========================================================================
// ADMIN PROFILE & DASHBOARD
// ==========================================================================
router.post("/add-admin", auth, isAdmin, addAdmin);
router.put("/updateProfile", auth, isAdmin, updateAdminProfile);
router.put("/updateImage", auth, isAdmin, updateDisplayPicture);
router.get("/dashboard-stats", auth, isAdmin, getAdminDashboardStats);
router.get("/get-all-users", auth, isAdmin, getAllUsers);


// ==========================================================================
// DOCTOR MANAGEMENT
// ==========================================================================
router.post("/add-doctor", auth, isAdmin, addDoctor);
router.put("/update-doctor", auth, isAdmin, updateDoctor);
router.delete("/delete-doctor", auth, isAdmin, deleteDoctor);


// ==========================================================================
// PATIENT MANAGEMENT
// ==========================================================================
router.post("/add-patient", auth, isAdmin, addPatient);
router.put("/update-patient", auth, isAdmin, updatePatient);
router.delete("/delete-patient", auth, isAdmin, deletePatient);
router.post("/Discharge_Patient", auth, isAdmin, discharge_patient);


// ==========================================================================
// APPOINTMENT MANAGEMENT
// ==========================================================================
router.post("/fix-appointment", auth, isAdmin, fixAppointment);


// ==========================================================================
// AMBULANCE MANAGEMENT
// ==========================================================================
// CRUD Operations
router.post("/add-ambulance", auth, isAdmin, addAmbulance);
router.get("/get-all-ambulances", auth, isAdmin, getAllAmbulances);
router.put("/update-ambulance", auth, isAdmin, updateAmbulance);
router.delete("/delete-ambulance", auth, isAdmin, deleteAmbulance);

// Trip & Booking Operations
router.post("/book-ambulance", auth, isAdmin, bookAmbulance);
router.put("/complete-ambulance-trip", auth, isAdmin, completeAmbulanceTrip);


// ==========================================================================
// BED MANAGEMENT
// ==========================================================================
// CRUD Operations
router.post("/add-bed", auth, isAdmin, addBed);
router.get("/get-all-beds", auth, isAdmin, getAllBeds);
router.put("/update-bed", auth, isAdmin, updateBed);
router.delete("/delete-bed", auth, isAdmin, deleteBed);

// Allocation & Discharge Operations
router.post("/Allocate_Bed", auth, isAdmin, allocateBed); // Retained original route casing
router.post("/allocate-bed", auth, isAdmin, allocateBed); // Retained duplicate if intended
router.put("/discharge-bed", auth, isAdmin, dischargeBed);


module.exports = router;
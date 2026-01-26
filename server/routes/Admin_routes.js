const express = require("express");
const router = express.Router();
const { isAdmin, auth } = require("../middlewares/auth");
const {isDemo} = require("../middlewares/isDemo");
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
router.post("/add-admin", auth,isDemo, isAdmin, addAdmin);
router.put("/updateProfile", auth,isDemo, isAdmin, updateAdminProfile);
router.put("/updateImage", auth, isAdmin,isDemo, updateDisplayPicture);
router.get("/dashboard-stats", auth, isAdmin, getAdminDashboardStats);
router.get("/get-all-users", auth, isAdmin, getAllUsers);


// ==========================================================================
// DOCTOR MANAGEMENT
// ==========================================================================
router.post("/add-doctor", auth, isAdmin,isDemo, addDoctor);
router.put("/update-doctor", auth, isAdmin,isDemo, updateDoctor);
router.delete("/delete-doctor", auth, isAdmin,isDemo, deleteDoctor);


// ==========================================================================
// PATIENT MANAGEMENT
// ==========================================================================
router.post("/add-patient", auth, isAdmin,isDemo, addPatient);
router.put("/update-patient", auth, isAdmin,isDemo, updatePatient);
router.delete("/delete-patient", auth, isAdmin,isDemo, deletePatient);


// ==========================================================================
// APPOINTMENT MANAGEMENT
// ==========================================================================
router.post("/fix-appointment", auth, isAdmin,isDemo, fixAppointment);


// ==========================================================================
// AMBULANCE MANAGEMENT
// ==========================================================================
// CRUD Operations
router.post("/add-ambulance", auth, isAdmin,isDemo, addAmbulance);
router.get("/get-all-ambulances", auth, isAdmin, getAllAmbulances);
router.put("/update-ambulance", auth, isAdmin,isDemo, updateAmbulance);
router.delete("/delete-ambulance", auth, isAdmin,isDemo, deleteAmbulance);

// Trip & Booking Operations
router.post("/book-ambulance", auth,isDemo, isAdmin, bookAmbulance);
router.put("/complete-ambulance-trip", auth,isDemo, isAdmin, completeAmbulanceTrip);


// ==========================================================================
// BED MANAGEMENT
// ==========================================================================
// CRUD Operations
router.post("/add-bed", auth,isDemo, isAdmin, addBed);
router.get("/get-all-beds", auth, isAdmin, getAllBeds);
router.put("/update-bed", auth,isDemo, isAdmin, updateBed);
router.delete("/delete-bed", auth,isDemo, isAdmin, deleteBed);

// Allocation & Discharge Operations
router.post("/allocate-bed", auth,isDemo, isAdmin, allocateBed); 
router.put("/discharge-bed", auth,isDemo, isAdmin, dischargeBed);


module.exports = router;
const express = require("express");
const router = express.Router();
const {isAdmin,isDoctor,auth} = require("../middlewares/auth")
const {getallUser,getallAmbulance,getallBed} = require("../controllers/overview");
const {Add_Doctor,add_admin,add_bed,add_nurse,
    add_ambulance,allocateBed,discharge_patient,Add_Patient,
    book_ambulance,fix_appointment,updateAdminProfile} = require("../controllers/Admincontroller");
const {updateDisplayPicture} = require("../controllers/Common")

router.get("/getAllUser",auth,isAdmin,getallUser);
router.get("/getAllAmbulance",auth,isAdmin,getallAmbulance);
router.get("/getAllBed",auth,isAdmin,getallBed);

router.post("/Add_Doctor",auth,isAdmin,Add_Doctor);
router.post("/Add_Admin",auth,isAdmin,add_admin);

router.post("/Add_Bed",auth,isAdmin,add_bed);
router.post("/Add_Nurse",auth,isAdmin,add_nurse);
router.post("/Add_Ambulance",auth,isAdmin,add_ambulance);
router.post("/Add_Patient",auth,isAdmin,Add_Patient);
// Update Details
router.put("/updateProfile", auth, isAdmin, updateAdminProfile);
// Update Image (Ensure you have 'express-fileupload' middleware enabled in index.js)
router.put("/updateImage", auth, isAdmin, updateDisplayPicture);
router.post("/Allocate_Bed",auth,isAdmin,allocateBed);
router.post("/Discharge_Patient",auth,isAdmin,discharge_patient);
router.post("/Book_ambulance",auth,isAdmin,book_ambulance);
router.post("/Fix_Appointment",auth,isAdmin,fix_appointment);

module.exports = router;
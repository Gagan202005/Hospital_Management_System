// Import the required modules
const express = require("express");
const router = express.Router();
const {getalluserdetails} = require("../controllers/Login");
const {
  auth,isPatient
} = require("../middlewares/auth");
const {
  getallreports,capturePayment,verifySignature,
  editprofile
} = require("../controllers/Patientcontroller");
const {updateDisplayPicture} = require("../controllers/Common")
const {isDemo} = require("../middlewares/demo");
router.get("/MyReports",auth,isPatient,getallreports);

router.post("/capturePayment", auth, isPatient,isDemo, capturePayment);
router.post("/verifyPayment",auth,isDemo,verifySignature);
router.get("/getPatientDetails",auth,isPatient, getalluserdetails);
router.post("/editprofile",auth,isDemo,isPatient,editprofile);
router.post("/updateDisplayPicture",auth,isDemo,isPatient,updateDisplayPicture);
module.exports = router;

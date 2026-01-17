// Import the required modules
const express = require("express")
const router = express.Router()
const {getalluserdetails} = require("../controllers/Login");
const {
  auth,isDoctor
} = require("../middlewares/auth");
const {isDemo} = require("../middlewares/demo");
const {
  add_slot,makingreport
} = require("../controllers/Doctorcontroller")

router.post("/addSlot",auth,isDoctor,isDemo,add_slot);

router.post("/MakingReport",auth,isDoctor,isDemo,makingreport);

router.get("/getDoctorDetails",auth,isDoctor,getalluserdetails);

module.exports = router;


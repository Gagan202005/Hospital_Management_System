const express = require("express");
const router = express.Router();

const { auth, isDoctor } = require("../middlewares/auth");
const { 
  createVisitReport, 
  getReportByAppointment, 
  updateVisitReport 
} = require("../controllers/ReportController");

router.post("/create", auth, isDoctor, createVisitReport);
router.put("/update", auth, isDoctor, updateVisitReport);
router.get("/get/:appointmentId", auth, getReportByAppointment);

module.exports = router;
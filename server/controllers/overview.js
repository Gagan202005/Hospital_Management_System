const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const crypto = require("crypto");
const MedicalRecord = require("../models/Medicalrecord")
require("dotenv").config();

// =================================================================
// 2. PROFILE MANAGEMENT CONTROLLERS
// =================================================================

/**
 * Edit Patient Profile Details
 * Updates personal info, contact, and address.
 */
exports.editprofile = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            DOB, 
            gender, 
            phoneno, 
            address, 
            bloodgroup, 
            emergencyContactName, 
            emergencyContactPhone 
        } = req.body;

        const id = req.user.id; // From auth middleware

        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }

        // Update fields if provided
        if (firstName) patient.firstName = firstName;
        if (lastName) patient.lastName = lastName;
        if (email) patient.email = email;
        if (phoneno) patient.phoneno = phoneno;
        
        // These fields can be updated or cleared
        patient.DOB = DOB; 
        patient.gender = gender;
        patient.address = address;
        patient.bloodgroup = bloodgroup;
        patient.emergencyContactName = emergencyContactName;
        patient.emergencyContactPhone = emergencyContactPhone;

        await patient.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            profile: patient,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


// =================================================================
// 3. MEDICAL & CLINICAL CONTROLLERS
// =================================================================

/**
 * Get All Medical Reports
 * Fetches medical history for the logged-in patient.
 */
exports.getallreports = async (req,res) => {
    try{
        // Fix: Use req.user.id directly, not destructuring property
        const patientID = req.user.id; 

        if(!patientID){
            return res.status(500).json({
                success:false,
                message:"Patient ID is missing",
            });
        }
        
        const reports = await MedicalRecord.find({patient: patientID})
            .populate("doctor")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success:true,
            message:"Reports fetched successfully",
            reports,
        });
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


/**
 * Get Patient Appointments
 * Fetches list of all appointments for the user.
 */
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "firstName lastName image email")
      .sort({ date: 1 }); // Ascending order (Upcoming first)

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("GET_PATIENT_APPOINTMENTS_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};


// =================================================================
// 4. DASHBOARD CONTROLLERS
// =================================================================

/**
 * Get Patient Dashboard Statistics
 * Aggregates data for the dashboard view (Upcoming appts, vitals, last visit).
 */
exports.getPatientDashboardStats = async (req, res) => {
  try {
    const patientId = req.user.id;

    // 1. Get Basic Info
    const patient = await Patient.findById(patientId).select("firstName lastName");

    // 2. Count Upcoming Appointments
    const upcomingCount = await Appointment.countDocuments({
      patient: patientId,
      status: { $in: ["Pending","Confirmed"] },
      date: { $gte: new Date() }
    });

    // 3. Find Last Completed Visit
    const lastAppointment = await Appointment.findOne({
      patient: patientId,
      status: "Completed"
    }).sort({ date: -1 });

    // 4. Find Next Scheduled Appointment
    const nextAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $in: ["Pending","Confirmed"] },
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .populate("doctor", "firstName lastName");

    // 5. Fetch Recent Medical Records (Limit 3)
    const recentReports = await MedicalRecord.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("doctor", "firstName lastName");

    // 6. Extract Latest Vitals
    const latestVitals = recentReports.length > 0 ? recentReports[0].vitalSigns : null;

    return res.status(200).json({
      success: true,
      data: {
        patientName: `${patient.firstName} ${patient.lastName}`,
        upcomingCount,
        lastVisit: lastAppointment ? lastAppointment.date : null,
        nextAppointment,
        latestVitals,
        recentReports
      }
    });

  } catch (error) {
    console.error("PATIENT_DASHBOARD_ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};
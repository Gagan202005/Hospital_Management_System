const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/Medicalrecord");
const OTP = require("../models/OTP");

const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
require("dotenv").config();


// =================================================================
// 1. AUTHENTICATION CONTROLLERS
// =================================================================

/**
 * Register a new Patient
 * Validates inputs, checks OTP, hashes password, and creates user.
 */
exports.signup = async (req, res) => {
  try {
    // 1. Destructure fields
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      otp,
      phone,
    } = req.body;

    // 2. Validate Required Fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp ||
      !phone
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    // 3. Confirm Password Match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match. Please try again.",
      });
    }

    // 4. Check if User Already Exists
    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User already exists. Please login in to continue.",
      });
    }

    // 5. Verify OTP
    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    
    if (response.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    } else if (otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    // 6. Hash Password & Create User
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Patient.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      // Generate a distinct avatar based on name initials
      image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
      phoneno : phone,
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};


/**
 * Send OTP for Email Verification
 * Generates a 6-digit numeric OTP and saves it to DB (triggering email).
 */
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user already exists
    const user = await Patient.findOne({ email });
    if (user) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    // 2. Generate Unique OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Ensure OTP is unique in DB (rare collision check)
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    // 3. Save OTP (Triggers Pre-save Hook for Email)
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);

    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};


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
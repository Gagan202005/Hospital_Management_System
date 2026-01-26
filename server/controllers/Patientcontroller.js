const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/Medicalrecord");
const OTP = require("../models/OTP");

const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender"); // Ensure this is imported
require("dotenv").config();

// --- Import Template ---
const { otpVerificationEmail } = require("../mail/templates/VerificationEmail");

// =================================================================
// 1. AUTHENTICATION CONTROLLERS
// =================================================================

/**
 * Register a new Patient
 */
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, otp, phone } = req.body;

    // 1. Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp || !phone) {
      return res.status(403).send({ success: false, message: "All Fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    // 2. Check Existing User
    const existingUser = await Patient.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ success: false, message: "User already exists. Please login." });
    }

    // 3. Verify OTP
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({ success: false, message: "The OTP is not valid" });
    }

    // 4. Create User
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Patient.create({
      firstName, lastName, email,
      password: hashedPassword,
      image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00acc1`,
      phoneno: phone,
    });

    return res.status(200).json({ success: true, message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};


/**
 * Send OTP for Email Verification
 */
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user already exists
    const user = await Patient.findOne({ email });
    if (user) {
      return res.status(401).json({ success: false, message: "User is Already Registered" });
    }

    // 2. Generate Unique OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Ensure uniqueness
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, { upperCaseAlphabets: false });
      result = await OTP.findOne({ otp: otp });
    }

    // 3. Save OTP to DB
    // NOTE: If your OTP model has a pre-save hook that sends mail, 
    // it might send a generic mail. Using 'mailSender' here explicitly 
    // allows us to use our pretty template.
    const otpPayload = { email, otp };
    await OTP.create(otpPayload);

    // 4. Send Custom HTML Email
    try {
        await mailSender(
            email, 
            "Verification Code - City Care Hospital", 
            otpVerificationEmail(otp) // Use the new template
        );
    } catch (mailError) {
        console.error("Error sending OTP email:", mailError);
        return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp, // Optional: usually removed in production for security
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};


// =================================================================
// 2. PROFILE MANAGEMENT CONTROLLERS
// =================================================================

exports.editprofile = async (req, res) => {
    try {
        const { 
            firstName, lastName, email, DOB, gender, phoneno, 
            address, bloodgroup, emergencyContactName, emergencyContactPhone 
        } = req.body;

        const id = req.user.id; 
        const patient = await Patient.findById(id);
        
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        if (firstName) patient.firstName = firstName;
        if (lastName) patient.lastName = lastName;
        if (email) patient.email = email;
        if (phoneno) patient.phoneno = phoneno;
        
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
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// =================================================================
// 3. MEDICAL & CLINICAL CONTROLLERS
// =================================================================

exports.getallreports = async (req,res) => {
    try{
        const patientID = req.user.id; 
        if(!patientID) return res.status(500).json({ success:false, message:"Patient ID is missing" });
        
        const reports = await MedicalRecord.find({patient: patientID}).populate("doctor").sort({ createdAt: -1 });

        return res.status(200).json({ success:true, message:"Reports fetched successfully", reports });
    }
    catch(error) {
        return res.status(500).json({ success:false, message:error.message });
    }
}

exports.getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "firstName lastName image email department specialization")
      .sort({ date: 1 });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
};


// =================================================================
// 4. DASHBOARD CONTROLLERS
// =================================================================

exports.getPatientDashboardStats = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await Patient.findById(patientId).select("firstName lastName");

    const upcomingCount = await Appointment.countDocuments({
      patient: patientId, status: { $in: ["Pending","Confirmed"] }, date: { $gte: new Date() }
    });

    const lastAppointment = await Appointment.findOne({
      patient: patientId, status: "Completed"
    }).sort({ date: -1 });

    const nextAppointment = await Appointment.findOne({
      patient: patientId, status: { $in: ["Pending","Confirmed"] }, date: { $gte: new Date() }
    }).sort({ date: 1 }).populate("doctor", "firstName lastName department specialization");

    const recentReports = await MedicalRecord.find({ patient: patientId })
      .sort({ createdAt: -1 }).limit(3).populate("doctor", "firstName lastName department specialization");

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
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};
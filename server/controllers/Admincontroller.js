const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const Appointment = require("../models/Appointment");
const Admin = require("../models/Admin");
const Bed = require("../models/Bed");
const Nurse = require("../models/Nurse");
const Ambulance = require("../models/Ambulance");
const Slot = require("../models/Slot");
const mailSender = require("../utils/mailSender");
const MedicalRecord = require("../models/Medicalrecord");
const nodeCrypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { accountCreationEmail } = require("../mail/templates/AccountCreationMail");
require("dotenv").config();

// Helper to calculate Age
const calculateAge = (dob) => {
  const diff_ms = Date.now() - new Date(dob).getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

// ==========================================
// 1. ADD DOCTOR (Auto-Password & Email)
// ==========================================
exports.addDoctor = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phoneno,
            dob, gender, bloodGroup, address,
            department, specialization, experience, consultationFee,
            qualifications // Expecting array: [{degree: "MBBS", college: "AIIMS"}, ...]
        } = req.body;

        // 1. Validation
        if (!firstName || !lastName || !email || !phoneno || !dob || !department || !consultationFee) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const existingUser = await Doctor.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Doctor email already registered" });
        }

        // 2. Auto-Generate Credentials
        const calculatedAge = calculateAge(dob);
        const rawPassword = "Dr" + nodeCrypto.randomBytes(4).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // 3. Create Doctor
        const newDoctor = await Doctor.create({
            firstName, lastName, email, phoneno,
            password: hashedPassword,
            dob,
            age: calculatedAge,
            gender, bloodGroup, address,
            department, specialization, experience, consultationFee,
            qualification: qualifications || [], // Save the array directly
            image: `https://api.dicebear.com/6.x/initials/svg?seed=Dr ${firstName} ${lastName}&backgroundColor=00acc1`,
            accountType: "Doctor",
            status: "Active"
        });

        // 4. Send Email
        try {
            await mailSender(
                email,
                "Welcome to City Care Hospital",
                accountCreationEmail(`Dr. ${firstName}`, email, rawPassword, newDoctor.doctorID)
            );
        } catch (e) { console.error("Mail Error:", e.message); }

        return res.status(200).json({
            success: true,
            data: newDoctor,
            generatedPassword: rawPassword,
            message: "Doctor registered successfully",
        });

    } catch (error) {
        console.error("Add Doctor Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. UPDATE DOCTOR
// ==========================================
exports.updateDoctor = async (req, res) => {
    try {
        const {
            _id, // Get ID from body
            firstName, lastName, email, phoneno,
            dob, gender, bloodGroup, address,
            department, specialization, experience, consultationFee,
            qualifications 
        } = req.body;

        if (!_id) return res.status(400).json({ success: false, message: "Doctor ID is required" });

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            _id,
            {
                firstName, lastName, phoneno, dob,
                age: dob ? calculateAge(dob) : undefined, 
                gender, bloodGroup, address,
                department, specialization, experience, consultationFee,
                qualification: qualifications 
            },
            { new: true }
        );

        if (!updatedDoctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        return res.status(200).json({
            success: true,
            message: "Doctor updated successfully",
            data: updatedDoctor,
        });
    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update doctor" });
    }
};
// ==========================================
// DELETE DOCTOR (Full Cleanup)
// ==========================================
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.body; 

        // 1. Find Doctor
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // 2. DELETE TIME SLOTS
        // Deletes all availability slots for this doctor
        await Slot.deleteMany({ doctorId: id }); // Using 'doctorId' based on your TimeSlot schema

        // 3. DELETE APPOINTMENTS & CLEAN PATIENT REFERENCES
        const appointments = await Appointment.find({ doctor: id });
        
        if (appointments.length > 0) {
            const appointmentIds = appointments.map(appt => appt._id);

            // A. Remove these Appointment IDs from Patients' 'myappointments' array
            await Patient.updateMany(
                { myappointments: { $in: appointmentIds } },
                { $pull: { myappointments: { $in: appointmentIds } } }
            );

            // B. Delete the Appointments themselves
            await Appointment.deleteMany({ doctor: id });
        }

        // 4. DELETE MEDICAL RECORDS
        const medicalRecords = await MedicalRecord.find({ doctor: id });
        
        if (medicalRecords.length > 0) {
            // A. Delete Report Files from Cloudinary
            const recordPromises = medicalRecords.map(async (record) => {
                if (record.reportUrl) {
                    await deleteFromCloudinary(record.reportUrl);
                }
            });
            await Promise.all(recordPromises);

            // B. Delete Record Documents
            await MedicalRecord.deleteMany({ doctor: id });
        }

        // 5. DELETE DOCTOR PROFILE IMAGE
        if (doctor.image) {
            await deleteFromCloudinary(doctor.image);
        }

        // 6. DELETE DOCTOR DOCUMENT
        await Doctor.findByIdAndDelete(id);

        return res.status(200).json({ 
            success: true, 
            message: "Doctor and all associated data deleted successfully" 
        });

    } catch (error) {
        console.error("Delete Doctor Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete doctor" });
    }
};

// ==========================================
// ADD ADMIN (Auto-Password & Age)
// ==========================================
exports.addAdmin = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phoneno,
            dob, gender, address
        } = req.body;

        // 1. Validation
        if (!firstName || !lastName || !email || !phoneno || !dob || !gender || !address) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // 2. Check Existing
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "Admin with this email already exists" });
        }

        // 3. Auto-Generate Credentials & Age
        const calculatedAge = calculateAge(dob);
        const rawPassword = "Adm" + nodeCrypto.randomBytes(4).toString("hex"); // e.g., Adm8f3a2b
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // 4. Create Admin
        const newAdmin = await Admin.create({
            firstName,
            lastName,
            email,
            phoneno,
            password: hashedPassword,
            dob,
            age: calculatedAge, // Auto-saved
            gender,
            address,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=1e88e5`,
            accountType: "Admin"
        });

        // 5. Send Email
        try {
            await mailSender(
                email,
                "Admin Access Granted - City Care Hospital",
                accountCreationEmail(
                    `${firstName} ${lastName}`,
                    email,
                    rawPassword,
                    newAdmin.adminID // Send Custom ID
                )
            );
        } catch (mailError) {
            console.error("Email sending failed:", mailError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Admin registered successfully",
            generatedPassword: rawPassword, // Send back for UI display
            data: newAdmin,
        });

    } catch (error) {
        console.error("Add Admin Error:", error);
        return res.status(500).json({ success: false, message: "Failed to add admin" });
    }
};

exports.add_bed = async (req,res) => {
    try{
        const {bedNumber,ward,type,roomNumber,floorNumber,status} = req.body;
        if(!bedNumber || !ward || !type || !roomNumber || !floorNumber || !status){
            return res.status(500).json({
                success : false,
                message : "all fields are req",
            });
        }
        const existingbed = await Bed.findOne({bedNumber});
        if(existingbed){
            return res.status(500).json({
            success : false,
            message : "already added",
        });
        }
        const bed = await Bed.create({
            bedNumber,ward,type,roomNumber,floorNumber,status
        });
        return res.status(200).json({
            success : true,
            message : "bed is added",
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message,
        });
    }
}

exports.add_nurse = async (req,res) => {
    try{
        const {firstName,lastName,email,phoneno,age,gender,
            address,DOB,department,qualification,experience} = req.body;
            if(!firstName || !lastName || !email
             ||!phoneno || !age
            || !gender || !address || !DOB  || !department
            || !qualification || !experience){
                return res.status(500).json({
                    success : false,
                    message : "all fields are required",
                });
            }
        const existingUser = await Nurse.findOne({email});
        if(existingUser){
            return res.status(500).json({
            success : false,
            message : "you are already registered with us",
            });
        }

        const nurse = await Nurse.create({
            firstName,lastName,email,
            phoneno,age,gender,
            address,DOB,department,
            qualification,experience,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
        });
        return res.status(200).json({
			success: true,
			user:nurse,
			message: "User registered successfully",
		});
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "something went wrong",
        });
    }
}

exports.addAmbulance = async (req, res) => {
    try {
        const {
            vehicleNumber, model, year, 
            driverName, driverLicense, driverContact, 
            pricePerHour 
        } = req.body;

        if (!vehicleNumber || !driverName || !pricePerHour) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const existingAmb = await Ambulance.findOne({ vehicleNumber });
        if (existingAmb) {
            return res.status(400).json({ success: false, message: "Vehicle Number already exists" });
        }

        const newAmbulance = await Ambulance.create({
            vehicleNumber, model, year,
            driverName, driverLicense, driverContact,
            pricePerHour,
            isAvailable: true
        });

        return res.status(200).json({
            success: true,
            data: newAmbulance,
            message: "Ambulance added successfully"
        });

    } catch (error) {
        console.error("Add Ambulance Error:", error);
        return res.status(500).json({ success: false, message: "Failed to add ambulance" });
    }
};

// ==========================================
// 2. UPDATE AMBULANCE
// ==========================================
exports.updateAmbulance = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        
        const updatedAmbulance = await Ambulance.findByIdAndUpdate(
            _id, 
            updateData, 
            { new: true }
        );

        if (!updatedAmbulance) return res.status(404).json({ success: false, message: "Ambulance not found" });

        return res.status(200).json({
            success: true,
            data: updatedAmbulance,
            message: "Ambulance updated successfully"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update ambulance" });
    }
};

// ==========================================
// 3. DELETE AMBULANCE
// ==========================================
exports.deleteAmbulance = async (req, res) => {
    try {
        const { id } = req.body;
        await Ambulance.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Ambulance deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete ambulance" });
    }
};

// ==========================================
// 4. GET ALL AMBULANCES
// ==========================================
exports.getAllAmbulances = async (req, res) => {
    try {
        // Fetch and populate patient details if booked
        const ambulances = await Ambulance.find()
            .populate("currentTrip.patientId", "firstName lastName patientID phoneno")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: ambulances
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch ambulances" });
    }
};

// ==========================================
// 5. BOOK (DISPATCH) AMBULANCE
// ==========================================
exports.bookAmbulance = async (req, res) => {
    try {
        const { ambulanceId, patientIdInput, address, reason } = req.body;

        // 1. Find Ambulance
        const ambulance = await Ambulance.findById(ambulanceId);
        if (!ambulance) return res.status(404).json({ success: false, message: "Ambulance not found" });
        if (!ambulance.isAvailable) return res.status(400).json({ success: false, message: "Ambulance is already on duty" });

        // 2. Find Patient (Search by custom patientID or MongoDB _id)
        // Assuming input is the Custom ID (Number) or String ID
        let patient = await Patient.findOne({ patientID: patientIdInput });
        
        if (!patient) {
            // Fallback: try finding by _id if input looks like ObjectId
            if (patientIdInput.match(/^[0-9a-fA-F]{24}$/)) {
                patient = await Patient.findById(patientIdInput);
            }
        }

        if (!patient) return res.status(404).json({ success: false, message: "Patient ID not found" });

        // 3. Update Ambulance Status
        ambulance.isAvailable = false;
        ambulance.currentTrip = {
            patientId: patient._id,
            address: address,
            reason: reason,
            startTime: Date.now()
        };

        await ambulance.save();

        return res.status(200).json({
            success: true,
            message: `Ambulance dispatched for ${patient.firstName} ${patient.lastName}`
        });

    } catch (error) {
        console.error("Booking Error:", error);
        return res.status(500).json({ success: false, message: "Failed to book ambulance" });
    }
};

// ==========================================
// 6. COMPLETE TRIP (Make Available)
// ==========================================
exports.completeAmbulanceTrip = async (req, res) => {
    try {
        const { ambulanceId } = req.body;
        const ambulance = await Ambulance.findById(ambulanceId);
        
        if (!ambulance) return res.status(404).json({ success: false, message: "Ambulance not found" });

        // Reset
        ambulance.isAvailable = true;
        ambulance.currentTrip = { patientId: null, address: "", reason: "", startTime: null };
        
        await ambulance.save();

        return res.status(200).json({ success: true, message: "Trip completed. Ambulance is now available." });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to complete trip" });
    }
}

exports.allocateBed = async (req,res) => {
    try{
        const {bed_id,pat_id} = req.body;
        if(!bed_id || !pat_id){
            return res.status(500).json({
            success : false,
            message : "all fields are req",
            });
        }
        const bed = await Bed.findById({_id : bed_id});
        const patient = await Patient.findById({_id : pat_id});
        bed.updateOne({availability:false, patient:patient._id});
        patient.updateOne({admitted:"Yes",bed:bed._id});
        return res.status(200).json({
            success : true,
            message : "bed allocated successfully",
        });
    }
    catch(err){
        return res.status(500).json({
        success : false,
        message : err.message,
        });
    }
}


exports.discharge_patient = async (req,res) => {
    try{
        const {patient_id} = req.body;
        if(!patient_id){
            return res.status(500).json({
            success : false,
            message : "all fields are req",
            });
        }
        const patient = await Patient.findById({_id:patient_id});
        if(!patient){
            return res.status(500).json({
            success : false,
            message : "patient id is wrong",
            });
        }
        patient.updateOne({admitted:"Not admitted",bed:null});
        return res.status(200).json({
            success : true,
            message : "discharged successfully",
        });
    }
    catch(err){
        return res.status(500).json({
        success : false,
        message : err.message,
        });
    }
}

// --- 1. UPDATE PROFILE DETAILS ---
exports.updateAdminProfile = async (req, res) => {
  try {
    // 1. Get Admin ID from middleware (req.user)
    const adminId = req.user.id;

    // 2. Get data from body
    // We only extract fields that are allowed to be updated via this API
    const {
      firstName,
      lastName,
      phoneno,
      dob,
      age,
      gender,
      address,
      about
    } = req.body;

    // 3. Find the Admin
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    // 4. Update Fields (Only if provided)
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phoneno) admin.phoneno = phoneno;
    if (dob) admin.dob = dob;
    if (age) admin.age = age;
    if (gender) admin.gender = gender;
    if (address) admin.address = address;
    if (about) admin.about = about;

    // 5. Save updates
    await admin.save();

    // 6. Return response
    // Remove sensitive data before sending back
    admin.password = undefined;
    admin.token = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: admin, // This data updates Redux/LocalStorage
    });

  } catch (error) {
    console.error("UPDATE_ADMIN_PROFILE_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};


exports.getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Get Counts (Using separate schemas)
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // 2. Calculate Revenue 
    // We find completed appointments and populate the 'doctor' field to access 'consultationFee'
    const completedAppointments = await Appointment.find({ status: "Completed" })
      .populate("doctor", "consultationFee");
    
    const totalRevenue = completedAppointments.reduce((acc, curr) => {
      // Ensure doctor exists and has a fee, otherwise default to 0
      return acc + (curr.doctor?.consultationFee || 0);
    }, 0);

    // 3. Get Recent Appointments (Last 5)
    // Populate 'patient' (from Patient model) and 'doctor' (from Doctor model)
    const recentAppointments = await Appointment.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("patient", "firstName lastName image") 
      .populate("doctor", "firstName lastName specialization");

    // 4. Get Doctors List (Limit 5)
    // No need to populate 'userId' anymore, details are directly in Doctor model
    const doctorsList = await Doctor.find()
      .select("firstName lastName specialization consultationFee image")
      .limit(5);

    // 5. Appointment Status Distribution
    const scheduledCount = await Appointment.countDocuments({ status: "Scheduled" });
    const cancelledCount = await Appointment.countDocuments({ status: "Cancelled" });
    const completedCount = completedAppointments.length;

    return res.status(200).json({
      success: true,
      data: {
        counts: {
            patients: totalPatients,
            doctors: totalDoctors,
            appointments: totalAppointments,
            revenue: totalRevenue
        },
        recentAppointments,
        doctorsList,
        appointmentStats: {
            scheduled: scheduledCount,
            cancelled: cancelledCount,
            completed: completedCount
        }
      }
    });

  } catch (error) {
    console.error("ADMIN_DASHBOARD_ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};


exports.addPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneno,
      address,
      emergencyContactName,
      emergencyContactPhone,
      gender,
      dob, 
    } = req.body;

    // 1. Validation for Required Fields
    if(!firstName || !lastName || !email || !phoneno || !dob) {
        return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    // 2. Check if Patient Exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: "Patient with this email already exists." });
    }

    // 3. Data Sanitization (FIX FOR 500 ERROR)
    // Fix Date: Empty string "" causes CastError in Mongoose Date field
    const validDob = dob === "" ? null : dob;

    // Fix Gender: Empty string "" causes ValidationError if not in Enum
    // Your Schema Enum: ["male", "female", "other", "prefer not to say", "Not specified"]
    let validGender = "Not specified";
    if (gender && gender !== "") {
        validGender = gender.toLowerCase(); 
    }

    // 4. Generate Random Password & Hash it
    const rawPassword = "Pass" + nodeCrypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 5. Create Patient
    const newPatient = await Patient.create({
      firstName,
      lastName,
      email,
      phoneno,
      password: hashedPassword,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      DOB: validDob,       // Use sanitized date
      gender: validGender, // Use sanitized gender
      address,
      emergencyContactName,
      emergencyContactPhone,
      bloodgroup: "Not specified",
      admitted: "not admitted"
    });

    // 6. Send Email
    try {
      const generatedID = newPatient.patientID; 
      const emailBody = accountCreationEmail(
        `${firstName} ${lastName}`,
        email,
        rawPassword,
        generatedID 
      );

      await mailSender(
        email,
        "Welcome to City Care Hospital - Account Details",
        emailBody
      );
    } catch (mailError) {
      console.error("Email sending failed:", mailError.message);
      // We continue execution even if email fails
    }

    return res.status(200).json({
      success: true,
      message: "Patient registered successfully",
      generatedPassword: rawPassword,
      data: newPatient,
    });

  } catch (error) {
    // LOG THE ACTUAL ERROR TO SEE WHAT IS WRONG IN TERMINAL
    console.error("ADD PATIENT ERROR:", error); 
    
    // Return specific error message to frontend for better debugging
    return res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to add patient" 
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { type } = req.query; // e.g., ?type=patient

    let data = [];
    
    if(!type) {
        return res.status(400).json({ success: false, message: "Type parameter is required" });
    }

    switch (type.toLowerCase()) {
      case "patient":
        data = await Patient.find().sort({ createdAt: -1 });
        break;
      case "doctor":
        data = await Doctor.find().sort({ createdAt: -1 }); 
        break;
      case "admin":
        data = await Admin.find().sort({ createdAt: -1 }); 
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    return res.status(200).json({ success: true, data: data });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
// ==========================================
// UPDATE PATIENT
// ==========================================
exports.updatePatient = async (req, res) => {
  try {
    const { _id, firstName, lastName, email, phoneno, address, gender, dob, emergencyContactName, emergencyContactPhone } = req.body;

    const updatedPatient = await Patient.findByIdAndUpdate(
      _id,
      {
        firstName,
        lastName,
        email,
        phoneno,
        address,
        gender,
        DOB: dob,
        emergencyContactName,
        emergencyContactPhone
      },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update patient" });
  }
};

// --- Helper: Delete Image/File from Cloudinary ---
const deleteFromCloudinary = async (url) => {
    if (!url || !url.includes("cloudinary")) return;
    try {
        // Extract Public ID: matches content after 'upload/v<version>/' and before extension
        // Example: .../upload/v12345/folder/image.jpg => folder/image
        const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
        
        if (publicIdMatch && publicIdMatch[1]) {
            const publicId = publicIdMatch[1];
            await cloudinary.uploader.destroy(publicId);
            // If it's a PDF or raw file (for reports), you might need:
            // await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        }
    } catch (error) {
        console.error("Cloudinary Delete Error:", error.message);
    }
};

// ==========================================
// DELETE PATIENT (Full Cleanup)
// ==========================================
exports.deletePatient = async (req, res) => {
    try {
        const { _id } = req.body;

        // 1. Find Patient
        const patient = await Patient.findById(_id);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        // 2. FREE BED (If admitted)
        if (patient.bed) {
            await Bed.findByIdAndUpdate(patient.bed, {
                status: "Available",
                patient: null
            });
        }

        // 3. CLEANUP APPOINTMENTS
        const appointments = await Appointment.find({ patient: _id });
        
        if (appointments.length > 0) {
            const appointmentPromises = appointments.map(async (appt) => {
                // A. Delete associated TimeSlot
                if (appt.timeSlotId) {
                    await Slot.findByIdAndDelete(appt.timeSlotId);
                }
                
                // B. Remove Appointment ID from Doctor's list
                if (appt.doctor) {
                    await Doctor.findByIdAndUpdate(appt.doctor, {
                        $pull: { myappointments: appt._id }
                    });
                }
            });
            await Promise.all(appointmentPromises);
            
            // C. Delete all Appointment Documents
            await Appointment.deleteMany({ patient: _id });
        }

        // 4. CLEANUP MEDICAL RECORDS & REPORTS
        // Assuming 'MedicalRecord' model stores report file URLs in 'reportUrl' or 'file'
        const medicalRecords = await MedicalRecord.find({ patient: _id });
        
        if (medicalRecords.length > 0) {
            const recordPromises = medicalRecords.map(async (record) => {
                // Delete Report File from Cloudinary
                if (record.reportUrl) {
                    await deleteFromCloudinary(record.reportUrl);
                }
            });
            await Promise.all(recordPromises);

            // Delete Record Documents
            await MedicalRecord.deleteMany({ patient: _id });
        }

        // 5. DELETE PATIENT PROFILE IMAGE (Cloudinary)
        if (patient.image) {
            await deleteFromCloudinary(patient.image);
        }

        // 6. DELETE PATIENT DOCUMENT
        await Patient.findByIdAndDelete(_id);

        return res.status(200).json({
            success: true,
            message: "Patient and all associated records deleted successfully",
        });

    } catch (error) {
        console.error("Delete Patient Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete patient" });
    }
};

// ==========================================
// 1. ADD BED
// ==========================================
exports.addBed = async (req, res) => {
    try {
        const { bedNumber, ward, type, roomNumber, floorNumber, dailyCharge, status } = req.body;

        if (!bedNumber || !ward || !type || !roomNumber || !dailyCharge) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const existingBed = await Bed.findOne({ bedNumber });
        if (existingBed) {
            return res.status(400).json({ success: false, message: "Bed Number already exists" });
        }

        const newBed = await Bed.create({
            bedNumber, ward, type, roomNumber, 
            floorNumber, dailyCharge, status
        });

        return res.status(200).json({
            success: true,
            message: "Bed added successfully",
            data: newBed
        });
    } catch (error) {
        console.error("Add Bed Error:", error);
        return res.status(500).json({ success: false, message: "Failed to add bed" });
    }
};

// ==========================================
// 2. UPDATE BED (Restricted)
// ==========================================
exports.updateBed = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        
        // 1. Find the bed first
        const bed = await Bed.findById(_id);
        if (!bed) {
            return res.status(404).json({ success: false, message: "Bed not found" });
        }

        // 2. CONSTRAINT: Cannot edit if Occupied
        if (bed.status === "Occupied") {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot edit bed details while it is occupied. Please discharge the patient first." 
            });
        }

        // 3. Proceed with update
        const updatedBed = await Bed.findByIdAndUpdate(_id, updateData, { new: true });

        return res.status(200).json({
            success: true,
            message: "Bed updated successfully",
            data: updatedBed
        });
    } catch (error) {
        console.error("Update Bed Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update bed" });
    }
};

// ==========================================
// 3. DELETE BED (Restricted)
// ==========================================
exports.deleteBed = async (req, res) => {
    try {
        const { id } = req.body;
        const bed = await Bed.findById(id);
        
        if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });

        // CONSTRAINT: Cannot delete if Occupied
        if (bed.status === "Occupied") {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot delete an occupied bed. Discharge the patient first." 
            });
        }

        await Bed.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: "Bed deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete bed" });
    }
};

// ==========================================
// 4. GET ALL BEDS
// ==========================================
exports.getAllBeds = async (req, res) => {
    try {
        const beds = await Bed.find()
            .populate("patient", "firstName lastName patientID gender")
            .sort({ bedNumber: 1 });

        return res.status(200).json({ success: true, data: beds });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch beds" });
    }
};

// ==========================================
// 5. ALLOCATE BED (Admit Patient)
// ==========================================
exports.allocateBed = async (req, res) => {
    try {
        const { bedId, patientIdInput } = req.body;

        // 1. Validate Bed
        const bed = await Bed.findById(bedId);
        if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });
        if (bed.status === "Occupied") return res.status(400).json({ success: false, message: "Bed is already occupied" });

        // 2. Find Patient
        let patient = await Patient.findOne({ patientID: patientIdInput });
        // Fallback to ObjectId check if needed
        if (!patient && patientIdInput.match(/^[0-9a-fA-F]{24}$/)) {
             patient = await Patient.findById(patientIdInput);
        }
        
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        // 3. Update Patient Status First
        patient.admitted = "admitted"; // Ensure this string matches your Patient Schema Enum
        patient.bed = bed._id; 
        await patient.save();

        // 4. Update Bed Status Second
        bed.status = "Occupied";
        bed.patient = patient._id;
        await bed.save();

        return res.status(200).json({
            success: true,
            message: `Bed allocated to ${patient.firstName} ${patient.lastName}`
        });

    } catch (error) {
        console.error("Allocation Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to allocate bed" 
        });
    }
};

// ==========================================
// 6. DISCHARGE PATIENT
// ==========================================
exports.dischargeBed = async (req, res) => {
    try {
        const { bedId } = req.body;
        const bed = await Bed.findById(bedId).populate("patient");

        if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });

        // 1. Update Patient (if exists)
        if (bed.patient) {
            const patient = await Patient.findById(bed.patient._id);
            if(patient) {
                patient.admitted = "not admitted"; // Reset status (lowercase if that's your schema default)
                patient.bed = null;
                await patient.save();
            }
        }

        // 2. Reset Bed
        bed.status = "Available";
        bed.patient = null;
        await bed.save();

        return res.status(200).json({ success: true, message: "Patient discharged. Bed is now Available." });

    } catch (error) {
        console.error("Discharge Error:", error);
        return res.status(500).json({ success: false, message: "Failed to discharge" });
    }
};





// ==========================================
// FIX APPOINTMENT (Manual Booking)
// ==========================================
exports.fixAppointment = async (req, res) => {
    try {
        const {
            doctorId,
            date,       // "YYYY-MM-DD"
            startTime,  // "HH:mm"
            endTime,    // "HH:mm"
            firstName,
            lastName,
            email,
            phone,
            reason,
            symptoms
        } = req.body;

        // 1. Validation
        if (!doctorId || !date || !startTime || !endTime || !firstName || !email || !phone) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // 2. Find or Create/Update Patient
        let patient = await Patient.findOne({ email });
        let isNewUser = false;
        let generatedPassword = "";

        if (!patient) {
            // --- CASE A: CREATE NEW PATIENT ---
            isNewUser = true;
            // Generate Random Password (e.g., Pat8f7d9a)
            generatedPassword = "Pat" + nodeCrypto.randomBytes(4).toString("hex"); 
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            patient = await Patient.create({
                firstName,
                lastName,
                email,
                phoneno: phone,
                password: hashedPassword,
                image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
                accountType: "Patient",
                registrationDate: new Date()
            });
        } else {
            // --- CASE B: UPDATE EXISTING PATIENT ---
            // Update details provided in the form to keep records fresh
            patient = await Patient.findByIdAndUpdate(
                patient._id,
                {
                    firstName: firstName,
                    lastName: lastName,
                    phoneno: phone,
                    // We typically don't update email here as it is the identifier
                },
                { new: true }
            );
        }

        // 3. Create TimeSlot (Validates Overlaps via Schema)
        let newTimeSlot;
        try {
            newTimeSlot = await Slot.create({
                doctorId,
                date: new Date(date),
                startTime,
                endTime,
                isBooked: true
            });
        } catch (err) {
            // Catch schema overlap errors
            if (err.message.includes("overlaps") || err.code === 11000) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Time slot overlaps with an existing appointment." 
                });
            }
            throw err;
        }

        // 4. Create Appointment
        const newAppointment = await Appointment.create({
            patient: patient._id,
            patientDetails: { firstName, lastName, email, phone },
            doctor: doctorId,
            date: new Date(date),
            timeSlotId: newTimeSlot._id,
            timeSlot: `${startTime} - ${endTime}`,
            reason,
            symptoms,
            status: "Scheduled"
        });

        // 5. Link Data (Update relations)
        newTimeSlot.appointmentId = newAppointment._id;
        await newTimeSlot.save();

        await Patient.findByIdAndUpdate(patient._id, { $push: { myappointments: newAppointment._id } });
        await Doctor.findByIdAndUpdate(doctorId, { $push: { myappointments: newAppointment._id } });

        // 6. Send Comprehensive Email
        try {
            // Construct Email Body
            let emailContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Appointment Confirmed</h2>
                    <p>Dear ${firstName} ${lastName},</p>
                    <p>Your appointment has been successfully scheduled.</p>
                    
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Appointment Details:</h3>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
                        <p><strong>Doctor ID:</strong> ${doctorId}</p>
                        <p><strong>Reason:</strong> ${reason}</p>
                    </div>
            `;

            // Append Credential Section ONLY if new user
            if (isNewUser) {
                emailContent += `
                    <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; border-left: 5px solid #4F46E5; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #3730a3;">Account Created Successfully</h3>
                        <p>A new patient account has been created for you to track your medical history.</p>
                        <p><strong>Login Email:</strong> ${email}</p>
                        <p><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 1.1em; background: #fff; padding: 2px 6px; border-radius: 4px;">${generatedPassword}</span></p>
                        <p style="font-size: 0.9em; margin-top: 10px;"><em>Please login and change your password as soon as possible.</em></p>
                    </div>
                `;
            }

            emailContent += `
                    <p>Thank you for choosing City Care Hospital.</p>
                </div>
            `;

            await mailSender(email, "Appointment Confirmation & Account Details", emailContent);
        } catch (e) {
            console.error("Email Sending Error:", e);
            // We do not fail the request if email fails, just log it
        }

        return res.status(200).json({
            success: true,
            message: "Appointment scheduled successfully",
            data: newAppointment,
            newPatientCreated: isNewUser,
            // Return password to frontend for immediate Toast notification
            generatedPassword: isNewUser ? generatedPassword : null
        });

    } catch (error) {
        console.error("Fix Appointment Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};
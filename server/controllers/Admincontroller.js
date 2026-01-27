const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Admin = require("../models/Admin");
const Bed = require("../models/Bed");
const Ambulance = require("../models/Ambulance");
const Slot = require("../models/Slot");
const MedicalRecord = require("../models/Medicalrecord");
const bcrypt = require("bcrypt");
const nodeCrypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const mailSender = require("../utils/mailSender");
require("dotenv").config();

// --- Import Templates ---
const { accountCreationEmail } = require("../mail/templates/AccountCreationMail");
const { appointmentConfirmationEmail } = require("../mail/templates/AppointmentConfirmationMail");

// =================================================================
// HELPER FUNCTIONS
// =================================================================

// Helper to calculate Age
const calculateAge = (dob) => {
  const diff_ms = Date.now() - new Date(dob).getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

// Helper: Delete Image/File from Cloudinary
const deleteFromCloudinary = async (url) => {
    if (!url || !url.includes("cloudinary")) return;
    try {
        const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
        if (publicIdMatch && publicIdMatch[1]) {
            const publicId = publicIdMatch[1];
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error("Cloudinary Delete Error:", error.message);
    }
};

// ==========================================
// 1. DOCTOR MANAGEMENT
// ==========================================

// --- ADD DOCTOR ---
exports.addDoctor = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phoneno,
            dob, gender, bloodGroup, address,
            department, specialization, experience, consultationFee,
            qualifications 
        } = req.body;

        if (!firstName || !lastName || !email || !phoneno || !dob || !department || !consultationFee) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const existingUser = await Doctor.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Doctor email already registered" });
        }

        // Credentials
        const calculatedAge = calculateAge(dob);
        const rawPassword = "Dr" + nodeCrypto.randomBytes(4).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newDoctor = await Doctor.create({
            firstName, lastName, email, phoneno,
            password: hashedPassword,
            dob, age: calculatedAge,
            gender, bloodGroup, address,
            department, specialization, experience, consultationFee,
            qualification: qualifications || [],
            image: `https://api.dicebear.com/6.x/initials/svg?seed=Dr ${firstName} ${lastName}&backgroundColor=00acc1`,
            accountType: "Doctor",
            status: "Active"
        });

        // Send Email using Template
        try {
            await mailSender(
                email,
                "Welcome to City Care Hospital - Doctor Access",
                accountCreationEmail(
                    `Dr. ${firstName} ${lastName}`, 
                    email, 
                    rawPassword, 
                    newDoctor.doctorID, 
                    "Medical Practitioner"
                )
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

// --- UPDATE DOCTOR ---
exports.updateDoctor = async (req, res) => {
    try {
        const {
            _id, firstName, lastName, email, phoneno,
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

// --- DELETE DOCTOR (Full Cleanup) ---
exports.deleteDoctor = async (req, res) => {
    try {
        const { id } = req.body; 

        const doctor = await Doctor.findById(id);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        // 1. Delete Slots
        await Slot.deleteMany({ doctorId: id });

        // 2. Handle Appointments
        const appointments = await Appointment.find({ doctor: id });
        if (appointments.length > 0) {
            const appointmentIds = appointments.map(appt => appt._id);
            await Patient.updateMany(
                { myAppointments: { $in: appointmentIds } },
                { $pull: { myAppointments: { $in: appointmentIds } } }
            );
            await Appointment.deleteMany({ doctor: id });
        }

        // 3. Handle Medical Records
        const medicalRecords = await MedicalRecord.find({ doctor: id });
        if (medicalRecords.length > 0) {
            const recordPromises = medicalRecords.map(async (record) => {
                if (record.reportUrl) await deleteFromCloudinary(record.reportUrl);
            });
            await Promise.all(recordPromises);
            await MedicalRecord.deleteMany({ doctor: id });
        }

        // 4. Delete Image
        if (doctor.image) await deleteFromCloudinary(doctor.image);

        // 5. Delete Document
        await Doctor.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: "Doctor and all associated data deleted successfully" });

    } catch (error) {
        console.error("Delete Doctor Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete doctor" });
    }
};

// ==========================================
// 2. ADMIN & USER MANAGEMENT
// ==========================================

// --- ADD ADMIN ---
exports.addAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneno, dob, gender, address } = req.body;

        if (!firstName || !lastName || !email || !phoneno || !dob || !gender || !address) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) return res.status(409).json({ success: false, message: "Admin exists" });

        const calculatedAge = calculateAge(dob);
        const rawPassword = "Adm" + nodeCrypto.randomBytes(4).toString("hex");
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newAdmin = await Admin.create({
            firstName, lastName, email, phoneno,
            password: hashedPassword,
            dob, age: calculatedAge,
            gender, address,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=1e88e5`,
            accountType: "Admin"
        });

        try {
            await mailSender(
                email,
                "Admin Access Granted",
                accountCreationEmail(
                    `${firstName} ${lastName}`, 
                    email, 
                    rawPassword, 
                    newAdmin.adminID,
                    "Administrator"
                )
            );
        } catch (e) { console.error("Email error:", e.message); }

        return res.status(200).json({
            success: true,
            message: "Admin registered successfully",
            generatedPassword: rawPassword,
            data: newAdmin,
        });

    } catch (error) {
        console.error("Add Admin Error:", error);
        return res.status(500).json({ success: false, message: "Failed to add admin" });
    }
};

// --- UPDATE ADMIN ---
exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { firstName, lastName, phoneno, dob, age, gender, address, about } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phoneno) admin.phoneno = phoneno;
    if (dob) admin.dob = dob;
    if (age) admin.age = age;
    if (gender) admin.gender = gender;
    if (address) admin.address = address;
    if (about) admin.about = about;

    await admin.save();
    admin.password = undefined;

    return res.status(200).json({ success: true, message: "Profile updated", data: admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- GET DASHBOARD ---
exports.getAdminDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    const completedAppointments = await Appointment.find({ status: "Completed" }).populate("doctor", "consultationFee");
    const totalRevenue = completedAppointments.reduce((acc, curr) => acc + (curr.doctor?.consultationFee || 0), 0);

    const recentAppointments = await Appointment.find().sort({ date: -1 }).limit(5)
      .populate("patient", "firstName lastName image") 
      .populate("doctor", "firstName lastName specialization department");

    const doctorsList = await Doctor.find().select("firstName lastName specialization consultationFee image").limit(5);

    return res.status(200).json({
      success: true,
      data: {
        counts: { patients: totalPatients, doctors: totalDoctors, appointments: totalAppointments, revenue: totalRevenue },
        recentAppointments,
        doctorsList,
        appointmentStats: {
            scheduled: await Appointment.countDocuments({ status: "Confirmed" }),
            cancelled: await Appointment.countDocuments({ status: "Cancelled" }),
            completed: completedAppointments.length
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard" });
  }
};

// --- GET USERS ---
exports.getAllUsers = async (req, res) => {
  try {
    const { type } = req.query;
    let data = [];
    if(!type) return res.status(400).json({ success: false, message: "Type required" });

    if(type === "patient") data = await Patient.find().sort({ createdAt: -1 });
    else if(type === "doctor") data = await Doctor.find().sort({ createdAt: -1 });
    else if(type === "admin") data = await Admin.find().sort({ createdAt: -1 });
    else return res.status(400).json({ success: false, message: "Invalid type" });

    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// ==========================================
// 3. PATIENT MANAGEMENT
// ==========================================

// --- ADD PATIENT ---
exports.addPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneno, address, emergencyContactName, emergencyContactPhone, gender, dob } = req.body;

    if(!firstName || !lastName || !email || !phoneno || !dob) {
        return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    if (await Patient.findOne({ email })) {
      return res.status(400).json({ success: false, message: "Patient exists" });
    }

    const validDob = dob === "" ? null : dob;
    let validGender = (gender && gender !== "") ? gender.toLowerCase() : "Not specified"; 

    const rawPassword = "Pass" + nodeCrypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newPatient = await Patient.create({
      firstName, lastName, email, phoneno,
      password: hashedPassword,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      DOB: validDob, gender: validGender,
      address, emergencyContactName, emergencyContactPhone,
      bloodgroup: "Not specified", admitted: "not admitted"
    });

    try {
      await mailSender(
        email,
        "Welcome to City Care Hospital - Patient Portal",
        accountCreationEmail(
            `${firstName} ${lastName}`, 
            email, 
            rawPassword, 
            newPatient.patientID,
            "Patient"
        )
      );
    } catch (e) { console.error("Mail error:", e.message); }

    return res.status(200).json({ success: true, message: "Patient added", generatedPassword: rawPassword, data: newPatient });

  } catch (error) {
    console.error("ADD PATIENT ERROR:", error); 
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE PATIENT ---
exports.updatePatient = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    const updatedPatient = await Patient.findByIdAndUpdate(_id, updateData, { new: true });
    if (!updatedPatient) return res.status(404).json({ success: false, message: "Patient not found" });
    return res.status(200).json({ success: true, message: "Patient updated", data: updatedPatient });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update" });
  }
};

// --- DELETE PATIENT ---
exports.deletePatient = async (req, res) => {
    try {
        const { _id } = req.body;
        const patient = await Patient.findById(_id);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        if (patient.bed) await Bed.findByIdAndUpdate(patient.bed, { status: "Available", patient: null });

        const appointments = await Appointment.find({ patient: _id });
        if (appointments.length > 0) {
            const appointmentPromises = appointments.map(async (appt) => {
                if (appt.timeSlotId) await Slot.findByIdAndDelete(appt.timeSlotId);
                if (appt.doctor) await Doctor.findByIdAndUpdate(appt.doctor, { $pull: { myAppointments: appt._id } });
            });
            await Promise.all(appointmentPromises);
            await Appointment.deleteMany({ patient: _id });
        }

        const medicalRecords = await MedicalRecord.find({ patient: _id });
        if (medicalRecords.length > 0) {
            const recordPromises = medicalRecords.map(async (record) => {
                if (record.reportUrl) await deleteFromCloudinary(record.reportUrl);
            });
            await Promise.all(recordPromises);
            await MedicalRecord.deleteMany({ patient: _id });
        }

        if (patient.image) await deleteFromCloudinary(patient.image);
        await Patient.findByIdAndDelete(_id);

        return res.status(200).json({ success: true, message: "Patient deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete patient" });
    }
};

// ==========================================
// 4. AMBULANCE, BED, & APPOINTMENTS
// ==========================================

// --- AMBULANCE ---
exports.addAmbulance = async (req, res) => {
    try {
        const { vehicleNumber, model, year, driverName, driverLicense, driverContact, pricePerHour } = req.body;
        if (!vehicleNumber || !driverName || !pricePerHour) return res.status(400).json({ success: false, message: "Fields missing" });
        if (await Ambulance.findOne({ vehicleNumber })) return res.status(400).json({ success: false, message: "Vehicle exists" });

        const newAmb = await Ambulance.create({ vehicleNumber, model, year, driverName, driverLicense, driverContact, pricePerHour, isAvailable: true });
        return res.status(200).json({ success: true, data: newAmb, message: "Ambulance added" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to add ambulance" });
    }
};

exports.updateAmbulance = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const updated = await Ambulance.findByIdAndUpdate(_id, updateData, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Not found" });
        return res.status(200).json({ success: true, data: updated });
    } catch (error) { return res.status(500).json({ success: false }); }
};

exports.deleteAmbulance = async (req, res) => {
    try { await Ambulance.findByIdAndDelete(req.body.id); return res.status(200).json({ success: true }); }
    catch (e) { return res.status(500).json({ success: false }); }
};

exports.getAllAmbulances = async (req, res) => {
    try {
        const data = await Ambulance.find().populate("currentTrip.patientId", "firstName lastName patientID phoneno").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data });
    } catch (e) { return res.status(500).json({ success: false }); }
};

exports.bookAmbulance = async (req, res) => {
    try {
        const { ambulanceId, patientIdInput, address, reason } = req.body;
        const ambulance = await Ambulance.findById(ambulanceId);
        if (!ambulance) return res.status(404).json({ success: false, message: "Ambulance not found" });
        if (!ambulance.isAvailable) return res.status(400).json({ success: false, message: "Ambulance busy" });

        let patient = await Patient.findOne({ patientID: patientIdInput });
        if (!patient && String(patientIdInput).match(/^[0-9a-fA-F]{24}$/)) patient = await Patient.findById(patientIdInput);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        ambulance.isAvailable = false;
        ambulance.currentTrip = { patientId: patient._id, address, reason, startTime: Date.now() };
        await ambulance.save();

        return res.status(200).json({ success: true, message: `Ambulance dispatched for ${patient.firstName}` });
    } catch (e) { return res.status(500).json({ success: false, message: "Booking failed" }); }
};

exports.completeAmbulanceTrip = async (req, res) => {
    try {
        const ambulance = await Ambulance.findById(req.body.ambulanceId);
        if (!ambulance) return res.status(404).json({ success: false });
        ambulance.isAvailable = true;
        ambulance.currentTrip = { patientId: null, address: "", reason: "", startTime: null };
        await ambulance.save();
        return res.status(200).json({ success: true, message: "Trip completed" });
    } catch (e) { return res.status(500).json({ success: false }); }
};

// --- BED ---
exports.addBed = async (req, res) => {
    try {
        const { bedNumber, ward, type, roomNumber, floorNumber, dailyCharge, status } = req.body;
        if (!bedNumber || !ward || !type || !roomNumber || !dailyCharge) return res.status(400).json({ success: false });
        if (await Bed.findOne({ bedNumber })) return res.status(400).json({ success: false, message: "Bed exists" });

        const newBed = await Bed.create({ bedNumber, ward, type, roomNumber, floorNumber, dailyCharge, status });
        return res.status(200).json({ success: true, data: newBed });
    } catch (e) { return res.status(500).json({ success: false }); }
};

exports.updateBed = async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const bed = await Bed.findById(_id);
        if (!bed) return res.status(404).json({ success: false });
        if (bed.status === "Occupied") return res.status(400).json({ success: false, message: "Cannot edit occupied bed" });

        const updated = await Bed.findByIdAndUpdate(_id, updateData, { new: true });
        return res.status(200).json({ success: true, data: updated });
    } catch (e) { return res.status(500).json({ success: false }); }
};

exports.deleteBed = async (req, res) => {
    try {
        const { id } = req.body;
        const bed = await Bed.findById(id);
        if (!bed) return res.status(404).json({ success: false });
        if (bed.status === "Occupied") return res.status(400).json({ success: false, message: "Cannot delete occupied bed" });
        await Bed.findByIdAndDelete(id);
        return res.status(200).json({ success: true });
    } catch (e) { return res.status(500).json({ success: false }); }
};

exports.getAllBeds = async (req, res) => {
    try {
        const beds = await Bed.find().populate("patient", "firstName lastName patientID gender").sort({ bedNumber: 1 });
        return res.status(200).json({ success: true, data: beds });
    } catch (e) { return res.status(500).json({ success: false }); }
};

exports.allocateBed = async (req, res) => {
    try {
        const { bedId, patientIdInput } = req.body;
        const bed = await Bed.findById(bedId);
        if (!bed || bed.status === "Occupied") return res.status(400).json({ success: false, message: "Bed unavailable" });

        let patient = await Patient.findOne({ patientID: patientIdInput });
        if (!patient && String(patientIdInput).match(/^[0-9a-fA-F]{24}$/)) patient = await Patient.findById(patientIdInput);
        if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

        patient.admitted = "admitted"; patient.bed = bed._id; await patient.save();
        bed.status = "Occupied"; bed.patient = patient._id; await bed.save();

        return res.status(200).json({ success: true, message: `Bed allocated` });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};

exports.dischargeBed = async (req, res) => {
    try {
        const bed = await Bed.findById(req.body.bedId).populate("patient");
        if (!bed) return res.status(404).json({ success: false });

        if (bed.patient) {
            const patient = await Patient.findById(bed.patient._id);
            if(patient) { patient.admitted = "not admitted"; patient.bed = null; await patient.save(); }
        }
        bed.status = "Available"; bed.patient = null; await bed.save();
        return res.status(200).json({ success: true, message: "Patient discharged" });
    } catch (e) { return res.status(500).json({ success: false }); }
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
            generatedPassword = "Pass" + nodeCrypto.randomBytes(4).toString("hex"); 
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
            patient = await Patient.findByIdAndUpdate(
                patient._id,
                { firstName, lastName, phoneno: phone },
                { new: true }
            );
        }

        // 3. Create TimeSlot
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
            if (err.message.includes("overlaps") || err.code === 11000) {
                return res.status(400).json({ success: false, message: "Time slot overlaps." });
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
            status: "Confirmed"
        });

        // 5. Link Data (Update relations)
        newTimeSlot.appointmentId = newAppointment._id;
        await newTimeSlot.save();

        await Patient.findByIdAndUpdate(patient._id, { $push: { myAppointments: newAppointment._id } });
        
        // 6. UPDATE DOCTOR & FETCH DETAILS FOR EMAIL
        // We use { new: true } to get the doc back so we have the Name and Email
        const doctorDetails = await Doctor.findByIdAndUpdate(
            doctorId, 
            { $push: { myAppointments: newAppointment._id } },
            { new: true } 
        );

        // 7. Send Detailed Email
        try {
            const emailContent = appointmentConfirmationEmail(
                `${firstName} ${lastName}`,
                date,
                `${startTime} - ${endTime}`,
                // Pass Doctor Name and Email here
                `${doctorDetails.firstName} ${doctorDetails.lastName}`,
                doctorDetails.email,
                reason,
                isNewUser ? generatedPassword : null
            );

            await mailSender(email, "Appointment Confirmed - City Care Hospital", emailContent);
        } catch (e) {
            console.error("Email Sending Error:", e);
        }

        return res.status(200).json({
            success: true,
            message: "Appointment scheduled successfully",
            data: newAppointment,
            newPatientCreated: isNewUser,
            generatedPassword: isNewUser ? generatedPassword : null
        });

    } catch (error) {
        console.error("Fix Appointment Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};
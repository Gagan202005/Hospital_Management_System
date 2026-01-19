const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const TimeSlot = require("../models/Slot"); // Ensure filename matches your model (e.g., TimeSlot.js)
const Patient = require("../models/Patient"); // Kept if you plan to use it later

// =================================================================
// 1. DOCTOR PROFILE MANAGEMENT
// =================================================================

exports.updateDoctorProfile = async (req, res) => {
  try {
    // 1. Get Doctor ID from authenticated request
    const doctorId = req.user.id;

    // 2. Get data from body
    const {
      firstName,
      lastName,
      phoneno,
      dob,
      age,
      gender,
      bloodGroup,
      address,
      department,
      specialization,
      experience,
      consultationFee,
      about,
      qualification // Expected to be an array of objects
    } = req.body;

    // 3. Find the Doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // 4. Update Fields (only if provided)
    if (firstName) doctor.firstName = firstName;
    if (lastName) doctor.lastName = lastName;
    if (phoneno) doctor.phoneno = phoneno;
    if (dob) doctor.dob = dob;
    if (age) doctor.age = age;
    if (gender) doctor.gender = gender;
    if (bloodGroup) doctor.bloodGroup = bloodGroup;
    if (address) doctor.address = address;
    
    if (department) doctor.department = department;
    if (specialization) doctor.specialization = specialization;
    if (experience) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (about) doctor.about = about;

    // Update Qualifications: Replace entire array if provided
    if (qualification && Array.isArray(qualification)) {
      doctor.qualification = qualification;
    }

    // 5. Save updates
    await doctor.save();

    // 6. Return Response (exclude sensitive data)
    doctor.password = undefined;
    doctor.token = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: doctor,
    });

  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

exports.makingreport = async (req, res) => {
    try {
        // Logic for making report goes here
        // Example placeholder:
        // const { email, name, disease, suggestions, test_report, medicines } = req.body;
        // ... logic ...
        return res.status(200).json({
            success: true,
            message: "Report logic placeholder"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};


// =================================================================
// 2. TIME SLOT MANAGEMENT (Doctor Dashboard)
// =================================================================

// --- CREATE TIME SLOT ---
exports.createTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const doctorId = req.user.id; 

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All fields (date, startTime, endTime) are required",
      });
    }

    const newSlot = await TimeSlot.create({
      doctorId,
      date,
      startTime,
      endTime,
      isBooked: false,
    });

    return res.status(200).json({
      success: true,
      message: "Time slot created successfully",
      data: newSlot,
    });

  } catch (error) {
    console.error("CREATE_SLOT_ERROR:", error);
    // Handle specific overlap error from Schema validation
    if (error.message.includes("overlaps")) {
      return res.status(409).json({ 
        success: false,
        message: "This time slot overlaps with an existing slot.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create time slot",
      error: error.message,
    });
  }
};

// --- GET TIME SLOTS ---
exports.getTimeSlots = async (req, res) => {
  try {
    const doctorId = req.user.id; 

    const slots = await TimeSlot.find({ doctorId })
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      data: slots,
    });

  } catch (error) {
    console.error("GET_SLOTS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch time slots",
      error: error.message,
    });
  }
};

// --- DELETE TIME SLOT ---
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { slotId } = req.body; 

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: "Slot ID is required",
      });
    }

    const deletedSlot = await TimeSlot.findOneAndDelete({
      _id: slotId,
      doctorId: req.user.id, // Ensure ownership
    });

    if (!deletedSlot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Time slot deleted successfully",
    });

  } catch (error) {
    console.error("DELETE_SLOT_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete time slot",
      error: error.message,
    });
  }
};


// =================================================================
// 3. PUBLIC SEARCH & DETAILS (Patient View)
// =================================================================

exports.getPublicDoctors = async (req, res) => {
  try {
    const { searchQuery, specialty } = req.query;

    let query = { 
      status: "Active", 
      active: true 
    };

    // 1. Handle Search Text
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { specialization: regex },
        { department: regex }
      ];
    }

    // 2. Handle Specialty Filter
    if (specialty && specialty !== "All specialties") {
      query.specialization = specialty;
    }

    // 3. Fetch Doctors
    let doctors = await Doctor.find(query)
      .select("firstName lastName specialization image experience qualification phoneno consultationFee doctorID rating")
      .lean();

    // 4. Sort by Experience (Highest First)
    doctors.sort((a, b) => {
      const expA = parseInt(a.experience) || 0;
      const expB = parseInt(b.experience) || 0;
      return expB - expA;
    });

    // 5. Initial View Limit
    if (!searchQuery && (!specialty || specialty === "All specialties")) {
      doctors = doctors.slice(0, 8);
    }

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });

  } catch (error) {
    console.error("GET_PUBLIC_DOCTORS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

exports.getDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id)
      .select("-password -token -resetPasswordExpires")
      .lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: doctor,
    });

  } catch (error) {
    console.error("GET_DOCTOR_DETAILS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Invalid Doctor ID format",
    });
  }
};


// =================================================================
// 4. APPOINTMENT BOOKING (Slot Based)
// =================================================================

// --- Get Available Slots (Public/Patient) ---
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date || !doctorId) {
      return res.status(400).json({ success: false, message: "Date and Doctor ID required" });
    }

    // Normalize date to UTC Midnight to match TimeSlot storage
    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    // Fetch slots that are NOT booked
    const availableSlots = await TimeSlot.find({
      doctorId: doctorId,
      date: queryDate,
      isBooked: false 
    })
    .sort({ startTime: 1 })
    .select("startTime _id");

    return res.status(200).json({
      success: true,
      data: availableSlots
    });

  } catch (error) {
    console.error("GET_SLOTS_ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch slots" });
  }
};

// --- Book Appointment (Public/Patient) ---
exports.bookAppointment = async (req, res) => {
  try {
    const { 
      doctorId, date, timeSlotId, 
      firstName, lastName, email, phone, reason, symptoms 
    } = req.body;

    // 1. Check for Logged-In User
    // If auth middleware ran and token is valid, req.user will exist.
    // If not (guest), patientId will be null.
    const patientId = req.user ? req.user.id : null;

    // 2. Verify the Slot exists and is free
    const slotDoc = await TimeSlot.findById(timeSlotId);

    if (!slotDoc) {
      return res.status(404).json({ success: false, message: "Time slot not found" });
    }

    if (slotDoc.isBooked) {
      return res.status(400).json({ success: false, message: "This slot is already booked" });
    }

    // 3. Create the Appointment
    const newAppointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId, // <--- LINK PATIENT ID HERE
      patientDetails: { firstName, lastName, email, phone },
      date: slotDoc.date,
      timeSlotId: slotDoc._id,
      timeSlot: slotDoc.startTime,
      reason,
      symptoms,
      status: "Scheduled"
    });

    // 4. Mark the TimeSlot as Booked
    slotDoc.isBooked = true;
    slotDoc.appointmentId = newAppointment._id;
    await slotDoc.save();

    return res.status(200).json({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment
    });

  } catch (error) {
    console.error("BOOK_APPOINTMENT_ERROR:", error);
    return res.status(500).json({ success: false, message: "Booking failed" });
  }
};
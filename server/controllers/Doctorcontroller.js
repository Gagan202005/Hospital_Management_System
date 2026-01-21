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

exports.getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const now = new Date();

    // Fetch all appointments sorted by newest first
    const appointments = await Appointment.find({ doctor: doctorId }).sort({ date: -1 });

    const patientMap = new Map();

    appointments.forEach((appt) => {
      const email = appt.patientDetails.email;

      if (!patientMap.has(email)) {
        patientMap.set(email, {
          id: appt._id, 
          name: `${appt.patientDetails.firstName} ${appt.patientDetails.lastName || ""}`.trim(),
          email: appt.patientDetails.email,
          phone: appt.patientDetails.phone,
          visitCount: 0,
          lastVisit: null,  
          status: "Inactive", // Default
          history: []       // We will fill this
        });
      }

      const patient = patientMap.get(email);
      patient.visitCount += 1;

      // Determine Status & Primary Date
      const apptDate = new Date(appt.date);
      
      if (apptDate > now) {
          patient.status = "Active"; // They have an upcoming booking
          patient.lastVisit = appt.date; // Show next visit date
      } else if (!patient.lastVisit && patient.status !== "Active") {
          patient.lastVisit = appt.date; // Show last past visit
      }

      // Add to history list
      patient.history.push({
        date: appt.date,
        reason: appt.reason,
        status: appt.status // Scheduled/Completed/Cancelled
      });
    });

    return res.status(200).json({
      success: true,
      data: Array.from(patientMap.values()),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching patients" });
  }
};

// =================================================================
// 1. GET APPOINTMENT SCHEDULE (Flat List for Appointments Page)
// =================================================================
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id; // From Auth Middleware

    // Fetch appointments sorted by date (Ascending: Earliest first)
    // .lean() converts mongoose docs to plain JS objects for performance
    const appointments = await Appointment.find({ doctor: doctorId })
      .sort({ date: 1 }) 
      .lean(); 

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });

  } catch (error) {
    console.error("GET_APPOINTMENTS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment schedule",
      error: error.message,
    });
  }
};

// =================================================================
// 2. UPDATE APPOINTMENT STATUS (Cancel, Confirm, etc.)
// =================================================================
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body; 

    // Validate Status against your Schema Enum
    const validStatuses = ["Scheduled", "Confirmed", "Cancelled", "Completed", "Pending"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status provided" 
      });
    }

    // Find and Update
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: status },
      { new: true } // Return the updated document
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Logic: If Cancelling, free up the TimeSlot
    // This makes the slot available for booking again
    if (status === "Cancelled" && appointment.timeSlotId) {
       await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, { isBooked: false });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: appointment,
    });

  } catch (error) {
    console.error("UPDATE_STATUS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message,
    });
  }
};


exports.getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // 1. Get Doctor Details (for name)
    const doctor = await Doctor.findById(doctorId).select("firstName lastName");

    // 2. Define Time Ranges
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 3. Count Today's Appointments
    const todayAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "Cancelled" } // Exclude cancelled
    });

    // 4. Count Total Unique Patients
    // We get all distinct patient IDs from appointments associated with this doctor
    const uniquePatients = await Appointment.distinct("patient", {
      doctor: doctorId
    });
    const totalPatientsCount = uniquePatients.length;

    // 5. Count Total Completed Appointments (Lifetime)
    const totalCompletedCount = await Appointment.countDocuments({
      doctor: doctorId,
      status: "Completed"
    });

    // 6. Get Recent/Upcoming Activity (Next 3 Appointments)
    const recentAppointments = await Appointment.find({
        doctor: doctorId,
        status: "Scheduled",
        date: { $gte: new Date() } // Future dates only
    })
    .sort({ date: 1, timeSlot: 1 }) // Earliest first
    .limit(3)
    .populate("patientDetails", "firstName lastName");

    return res.status(200).json({
      success: true,
      data: {
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        todayCount: todayAppointmentsCount,
        totalPatients: totalPatientsCount,
        totalCompleted: totalCompletedCount,
        recentActivity: recentAppointments
      }
    });

  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};
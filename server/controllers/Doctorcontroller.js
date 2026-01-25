const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const TimeSlot = require("../models/Slot"); 
const Patient = require("../models/Patient"); 
const mailSender = require("../utils/mailSender"); 
const appointmentPendingTemplate = require("../mail/templates/AppointmentPendingMail");

// Helper to prevent Regex Injection (Server Crash)
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// =============================================
// UPDATE DOCTOR PROFILE
// =============================================
exports.updateDoctorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Destructure all possible fields from frontend
        const {
            firstName,
            lastName,
            phoneno,       
            address,       
            dob,
            age,
            gender,
            bloodGroup,
            department,
            specialization,
            qualification, 
            experience,
            consultationFee,
            about
        } = req.body;

        // 2. Find Doctor
        const doctor = await Doctor.findById(userId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // 3. Update Fields (Only if provided)
        if (firstName) doctor.firstName = firstName;
        if (lastName) doctor.lastName = lastName;
        
        if (phoneno) doctor.phoneno = phoneno;
        if (address) doctor.address = address;

        if (dob) doctor.dob = dob;
        if (age) doctor.age = age;
        if (gender) doctor.gender = gender;
        if (bloodGroup) doctor.bloodGroup = bloodGroup;

        if (department) doctor.department = department;
        if (specialization) doctor.specialization = specialization;
        if (qualification) doctor.qualification = qualification;
        if (experience) doctor.experience = experience;
        if (consultationFee) doctor.consultationFee = consultationFee;
        if (about) doctor.about = about;

        // 4. Save Updates
        await doctor.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: doctor,
        });

    } catch (error) {
        console.error("Update Doctor Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
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

    // 1. Handle Search Text (SECURE FIX: Escape Regex)
    if (searchQuery) {
      const safeSearch = escapeRegex(searchQuery); // Prevents Server Crash
      const regex = new RegExp(safeSearch, "i");
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
    const { date } = req.query; 

    if (!date || !doctorId) {
      return res.status(400).json({ success: false, message: "Date and Doctor ID required" });
    }

    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

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

exports.bookAppointment = async (req, res) => {
  try {
    const { 
      doctorId, date, timeSlotId, 
      firstName, lastName, email, phone, reason, symptoms 
    } = req.body;

    // 1. Strict Auth Check
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Please login to book an appointment." });
    }
    const patientId = req.user.id;

    // 2. ATOMIC LOCK (Prevents Double Booking)
    const slotDoc = await TimeSlot.findOneAndUpdate(
        { _id: timeSlotId, isBooked: false },
        { isBooked: true },
        { new: true }
    );

    if (!slotDoc) {
      return res.status(400).json({ 
          success: false, 
          message: "This slot has just been booked by another user. Please choose another." 
      });
    }

    // 3. Create Appointment (Status: Pending)
    const newAppointment = await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      patientDetails: { firstName, lastName, email, phone },
      date: slotDoc.date,
      timeSlotId: slotDoc._id,
      timeSlot: slotDoc.startTime,
      reason,
      symptoms,
      status: "Pending"
    });

    // 4. Link Appointment ID back to Slot
    slotDoc.appointmentId = newAppointment._id;
    await slotDoc.save();

    // 5. Send Email Notification
    try {
      // NEW: Fetch Doctor details specifically for the email
      const doctorDetails = await Doctor.findById(doctorId).select("firstName lastName department");

      const emailContent = appointmentPendingTemplate(
          firstName, 
          slotDoc.date,      
          slotDoc.startTime, 
          reason,
          // NEW: Pass Doctor Data
          `${doctorDetails.firstName} ${doctorDetails.lastName}`, 
          doctorDetails.department
      );
      
      await mailSender(
          email, 
          "Appointment Request Pending | MediCare", 
          emailContent
      );
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
    }

    return res.status(200).json({
      success: true,
      message: "Appointment request sent successfully",
      data: newAppointment
    });

  } catch (error) {
    console.error("BOOK_APPOINTMENT_ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// =================================================================
// 6. GET DOCTOR PATIENTS
// =================================================================

exports.getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const now = new Date();

    // 1. POPULATE PATIENT: Fetches the live profile data (Address, Blood Group, etc.)
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("patient") // <--- This is the key fix
      .sort({ date: -1 });

    const patientMap = new Map();

    appointments.forEach((appt) => {
      // Use the Live Profile email if available, otherwise fallback to the snapshot
      // (This handles cases where a user might have deleted their account but the appointment remains)
      const email = appt.patient ? appt.patient.email : appt.patientDetails.email;

      if (!patientMap.has(email)) {
        
        // Define sources for data
        const profile = appt.patient || {};
        const snapshot = appt.patientDetails || {};

        patientMap.set(email, {
          id: appt._id, 
          
          // Name: Prefer Live Profile -> Fallback to Snapshot
          name: profile.firstName 
            ? `${profile.firstName} ${profile.lastName}` 
            : `${snapshot.firstName} ${snapshot.lastName}`,
            
          email: email,
          phone: profile.phoneno || snapshot.phone || "N/A",
          
          // --- FULL DETAILS NOW AVAILABLE ---
          gender: profile.gender || "Not specified",
          bloodGroup: profile.bloodGroup || "Not specified",
          address: profile.address || "No address on file",
          
          visitCount: 0,
          lastVisit: null,
          nextVisit: null,
          status: "Inactive",
          history: []
        });
      }

      const patient = patientMap.get(email);
      patient.visitCount += 1;
      const apptDate = new Date(appt.date);

      // --- DATE LOGIC ---
      // Future: Confirmed or Pending appointments count as "Next Visit"
      if (apptDate > now && (appt.status === "Confirmed" || appt.status === "Pending")) {
          patient.status = "Active"; 
          // Find the earliest upcoming date
          if (!patient.nextVisit || apptDate < new Date(patient.nextVisit)) {
             patient.nextVisit = appt.date;
          }
      } else {
          // Past: Only Completed appointments count as "Last Visit"
          // (We ignore Cancelled here so "Last Visit" means last actual consultation)
          if (!patient.lastVisit && appt.status === "Completed") {
              patient.lastVisit = appt.date;
          }
      }

      // Add to full history list (Includes Cancelled)
      patient.history.push({
        date: appt.date,
        reason: appt.reason,
        status: appt.status
      });
    });

    return res.status(200).json({
      success: true,
      data: Array.from(patientMap.values()),
    });

  } catch (error) {
    console.error("GET_PATIENTS_ERROR:", error);
    return res.status(500).json({ success: false, message: "Error fetching patients" });
  }
};

// =================================================================
// 6. APPOINTMENT SCHEDULE
// =================================================================
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id; 

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
// 7. UPDATE APPOINTMENT STATUS
// =================================================================
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body; 

    const appointment = await Appointment.findById(appointmentId).populate("patient"); 
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    // If Cancelled, Free up TimeSlot
    if (status === "Cancelled" && appointment.timeSlotId) {
       await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, { 
           isBooked: false, 
           appointmentId: null 
       });
       appointment.timeSlotId = null;
    }

    if (appointment.patientDetails?.email) {
        try {
            let subject = `Appointment Status Update: ${status}`;
            let body = `<p>Your appointment status has changed to: <strong>${status}</strong>.</p>`;
            await mailSender(appointment.patientDetails.email, subject, body);
        } catch (mailError) {
            console.error("Mail Error:", mailError);
        }
    }

    return res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}`,
      data: appointment,
    });

  } catch (error) {
    console.error("UPDATE_STATUS_ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};


// =================================================================
// 8. DELETE TIME SLOT
// =================================================================
exports.deleteTimeSlot = async (req, res) => {
    try {
        const { slotId } = req.body;

        const slot = await TimeSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ success: false, message: "Slot not found" });
        }

        if (slot.isBooked) {
            return res.status(400).json({ 
                success: false, 
                message: "Cannot delete a slot that is Booked or Pending." 
            });
        }

        await TimeSlot.findByIdAndDelete(slotId);

        return res.status(200).json({ success: true, message: "Time slot deleted successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// =================================================================
// 9. DASHBOARD STATS (Fixed Populate)
// =================================================================
exports.getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const currentMoment = new Date();

    const doctor = await Doctor.findById(doctorId).select("firstName lastName");

    // --- AUTO-CANCEL EXPIRED PENDING APPOINTMENTS ---
    const expiredAppointments = await Appointment.find({
      doctor: doctorId,
      status: "Pending",
      date: { $lt: currentMoment }
    }); 
    // FIX: Removed invalid .populate("patientDetails") since it is an embedded object

    if (expiredAppointments.length > 0) {
      for (const appt of expiredAppointments) {
        appt.status = "Cancelled";
        await appt.save();

        if (appt.patientDetails?.email) {
          try {
            await mailSender(
              appt.patientDetails.email,
              "Appointment Cancelled - No Show / Expired",
              `<p>Your pending appointment for ${new Date(appt.date).toDateString()} has expired.</p>`
            );
          } catch (e) { console.error("Mail fail", e); }
        }
      }
    }

    // --- STATS ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "Cancelled" }
    });

    const uniquePatients = await Appointment.distinct("patient", { doctor: doctorId });
    
    const totalCompletedCount = await Appointment.countDocuments({
      doctor: doctorId,
      status: "Completed"
    });

    const recentAppointments = await Appointment.find({
        doctor: doctorId,
        status: { $in: ["Pending", "Confirmed"] },
        date: { $gte: currentMoment }
    })
    .sort({ date: 1, timeSlot: 1 })
    .limit(3);
    // FIX: Removed invalid .populate("patientDetails")

    return res.status(200).json({
      success: true,
      data: {
        doctorName: `${doctor.firstName} ${doctor.lastName}`,
        todayCount: todayAppointmentsCount,
        totalPatients: uniquePatients.length,
        totalCompleted: totalCompletedCount,
        recentActivity: recentAppointments
      }
    });

  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};
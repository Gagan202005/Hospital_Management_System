const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const TimeSlot = require("../models/Slot"); 
const Patient = require("../models/Patient"); 
const mailSender = require("../utils/mailSender"); 

// --- Import Templates ---
const appointmentPendingTemplate = require("../mail/templates/AppointmentPendingMail");
const { appointmentStatusUpdateEmail } = require("../mail/templates/AppointmentStatusUpdateMail");
const { appointmentExpiryEmail } = require("../mail/templates/AppointmentExpiryMail");

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
        const {
            firstName, lastName, phoneno, address, dob, age, gender, bloodGroup,
            department, specialization, qualification, experience, consultationFee, about
        } = req.body;

        const doctor = await Doctor.findById(userId);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

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

        await doctor.save();

        return res.status(200).json({ success: true, message: "Profile updated", data: doctor });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =================================================================
// 2. TIME SLOT MANAGEMENT
// =================================================================

exports.createTimeSlot = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const doctorId = req.user.id; 

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "Fields missing" });
    }

    const newSlot = await TimeSlot.create({ doctorId, date, startTime, endTime, isBooked: false });
    return res.status(200).json({ success: true, message: "Slot created", data: newSlot });

  } catch (error) {
    if (error.message.includes("overlaps")) return res.status(409).json({ success: false, message: "Slot overlaps" });
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTimeSlots = async (req, res) => {
  try {
    const slots = await TimeSlot.find({ doctorId: req.user.id }).sort({ date: 1, startTime: 1 });
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =================================================================
// 3. PUBLIC SEARCH & DETAILS
// =================================================================

exports.getPublicDoctors = async (req, res) => {
  try {
    const { searchQuery, specialty } = req.query;
    let query = { status: "Active", active: true };

    if (searchQuery) {
      const safeSearch = escapeRegex(searchQuery);
      const regex = new RegExp(safeSearch, "i");
      query.$or = [{ firstName: regex }, { lastName: regex }, { specialization: regex }, { department: regex }];
    }

    if (specialty && specialty !== "All specialties") query.specialization = specialty;

    let doctors = await Doctor.find(query)
      .select("firstName lastName specialization image experience qualification phoneno consultationFee doctorID rating")
      .lean();

    doctors.sort((a, b) => (parseInt(b.experience) || 0) - (parseInt(a.experience) || 0));

    if (!searchQuery && (!specialty || specialty === "All specialties")) doctors = doctors.slice(0, 8);

    return res.status(200).json({ success: true, count: doctors.length, data: doctors });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

exports.getDoctorDetails = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password -token -resetPasswordExpires").lean();
    if (!doctor) return res.status(404).json({ success: false, message: "Not found" });
    return res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Invalid ID" });
  }
};

// =================================================================
// 4. APPOINTMENT BOOKING
// =================================================================

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; 

    if (!date || !doctorId) return res.status(400).json({ success: false });

    const queryDate = new Date(date);
    queryDate.setUTCHours(0, 0, 0, 0);

    const availableSlots = await TimeSlot.find({ doctorId, date: queryDate, isBooked: false })
    .sort({ startTime: 1 }).select("startTime endTime _id");

    return res.status(200).json({ success: true, data: availableSlots });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed" });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlotId, firstName, lastName, email, phone, reason, symptoms } = req.body;

    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: "Login required" });
    const patientId = req.user.id;

    // ATOMIC LOCK
    const slotDoc = await TimeSlot.findOneAndUpdate(
        { _id: timeSlotId, isBooked: false }, { isBooked: true }, { new: true }
    );

    if (!slotDoc) return res.status(400).json({ success: false, message: "Slot unavailable" });

    const newAppointment = await Appointment.create({
      doctor: doctorId, patient: patientId,
      patientDetails: { firstName, lastName, email, phone },
      date: slotDoc.date, timeSlotId: slotDoc._id, timeSlot: `${slotDoc.startTime} - ${slotDoc.endTime}`,
      reason, symptoms, status: "Pending"
    });

    slotDoc.appointmentId = newAppointment._id; await slotDoc.save();

    // Email
    try {
      const doctorDetails = await Doctor.findById(doctorId).select("firstName lastName department");
      const emailContent = appointmentPendingTemplate(
          firstName, slotDoc.date, slotDoc.startTime, reason,
          `${doctorDetails.firstName} ${doctorDetails.lastName}`, doctorDetails.department
      );
      await mailSender(email, "Request Pending | MediCare", emailContent);
    } catch (e) { console.error("Mail Fail:", e); }

    return res.status(200).json({ success: true, message: "Requested", data: newAppointment });

  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =================================================================
// 6. PATIENT & SCHEDULE MANAGEMENT
// =================================================================

exports.getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const now = new Date();

    const appointments = await Appointment.find({ doctor: doctorId }).populate("patient").sort({ date: -1 });
    const patientMap = new Map();

    appointments.forEach((appt) => {
      const email = appt.patient ? appt.patient.email : appt.patientDetails.email;

      if (!patientMap.has(email)) {
        const profile = appt.patient || {};
        const snapshot = appt.patientDetails || {};

        patientMap.set(email, {
          id: appt._id, 
          name: profile.firstName ? `${profile.firstName} ${profile.lastName}` : `${snapshot.firstName} ${snapshot.lastName}`,
          email: email,
          phone: profile.phoneno || snapshot.phone || "N/A",
          gender: profile.gender || "Not specified",
          bloodGroup: profile.bloodGroup || "Not specified",
          address: profile.address || "No address on file",
          visitCount: 0, lastVisit: null, nextVisit: null, status: "Inactive", history: []
        });
      }

      const patient = patientMap.get(email);
      patient.visitCount += 1;
      const apptDate = new Date(appt.date);

      if (apptDate > now && (appt.status === "Confirmed" || appt.status === "Pending")) {
          patient.status = "Active"; 
          if (!patient.nextVisit || apptDate < new Date(patient.nextVisit)) patient.nextVisit = appt.date;
      } else {
          if (!patient.lastVisit && appt.status === "Completed") patient.lastVisit = appt.date;
      }

      patient.history.push({ date: appt.date, reason: appt.reason, status: appt.status });
    });

    return res.status(200).json({ success: true, data: Array.from(patientMap.values()) });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching patients" });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.id }).sort({ date: 1 }).lean(); 
    return res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =================================================================
// 7. UPDATE STATUS & SEND EMAIL
// =================================================================
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body; 
    const doctorId = req.user.id;

    const appointment = await Appointment.findById(appointmentId).populate("patient"); 
    if (!appointment) return res.status(404).json({ success: false, message: "Not found" });

    appointment.status = status;
    await appointment.save();

    // Logic: Free up slot if Cancelled
    if (status === "Cancelled" && appointment.timeSlotId) {
       await TimeSlot.findByIdAndUpdate(appointment.timeSlotId, { isBooked: false, appointmentId: null });
       appointment.timeSlotId = null;
    }

    // Send Detailed Status Email
    if (appointment.patientDetails?.email) {
        try {
            const doctor = await Doctor.findById(doctorId).select("firstName lastName");
            const emailContent = appointmentStatusUpdateEmail(
                appointment.patientDetails.firstName,
                appointment.date,
                appointment.timeSlot, // e.g. "10:00 AM"
                status,
                `${doctor.firstName} ${doctor.lastName}`
            );
            await mailSender(appointment.patientDetails.email, `Appointment ${status}`, emailContent);
        } catch (e) { console.error("Mail Fail:", e); }
    }

    return res.status(200).json({ success: true, message: `Marked as ${status}`, data: appointment });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};

exports.deleteTimeSlot = async (req, res) => {
    try {
        const { slotId } = req.body;
        const slot = await TimeSlot.findById(slotId);
        if (!slot) return res.status(404).json({ success: false });
        if (slot.isBooked) return res.status(400).json({ success: false, message: "Slot booked" });
        await TimeSlot.findByIdAndDelete(slotId);
        return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

// =================================================================
// 9. DASHBOARD STATS (Auto-Cancel & Stats)
// =================================================================
exports.getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const currentMoment = new Date();

    const doctor = await Doctor.findById(doctorId).select("firstName lastName");

    // --- AUTO-CANCEL EXPIRED ---
    const expiredAppointments = await Appointment.find({
      doctor: doctorId,
      status: "Pending",
      date: { $lt: currentMoment }
    }); 

    if (expiredAppointments.length > 0) {
      for (const appt of expiredAppointments) {
        appt.status = "Cancelled";
        await appt.save();

        // Send Expiry Email
        if (appt.patientDetails?.email) {
          try {
            const emailContent = appointmentExpiryEmail(
                appt.patientDetails.firstName,
                appt.date,
                `${doctor.firstName} ${doctor.lastName}`
            );
            await mailSender(appt.patientDetails.email, "Appointment Request Expired", emailContent);
          } catch (e) { console.error("Mail fail", e); }
        }
      }
    }

    // --- STATS ---
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);

    const todayAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId, date: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: "Cancelled" }
    });

    const uniquePatients = await Appointment.distinct("patient", { doctor: doctorId });
    const totalCompletedCount = await Appointment.countDocuments({ doctor: doctorId, status: "Completed" });

    const recentAppointments = await Appointment.find({
        doctor: doctorId, status: { $in: ["Pending", "Confirmed"] }, date: { $gte: currentMoment }
    }).sort({ date: 1, timeSlot: 1 }).limit(3);

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
    return res.status(500).json({ success: false, message: "Stats failed" });
  }
};
const MedicalRecord = require("../models/Medicalrecord");
const Appointment = require("../models/Appointment");

// =================================================================
// CREATE VISIT REPORT (Complete Appointment)
// =================================================================
exports.createVisitReport = async (req, res) => {
  try {
    // 1. Destructure Data from Request Body
    const { 
      appointmentId, 
      diagnosis, 
      symptoms, 
      bp, 
      weight, 
      temperature, 
      spo2,       
      heartRate,
      doctorNotes,
      patientAdvice, // Optional, can be part of doctorNotes or separate
      prescription   // Expecting an array of medicine objects
    } = req.body;

    const doctorId = req.user.id; // From Auth Middleware

    // 2. Validate Appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // 3. Create Medical Record
    const newRecord = await MedicalRecord.create({
      appointmentId,
      doctor: doctorId,
      patient: appointment.patient || null, // Link to User ID if logged in
      
      // Save snapshot of patient details (Immutable record)
      patientDetails: {
          name: `${appointment.patientDetails.firstName} ${appointment.patientDetails.lastName}`,
          email: appointment.patientDetails.email,
          phone: appointment.patientDetails.phone
      },
      
      diagnosis,
      symptoms,
      
      // Group Vitals
      vitalSigns: { 
        bp, 
        weight, 
        temperature,
        spo2,       // Optional based on your schema
        heartRate   // Optional based on your schema
      },
      
      doctorNotes,
      prescription: prescription || []
    });

    // 4. Mark Appointment as Completed
    appointment.status = "Completed";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Visit Report created successfully",
      data: newRecord
    });

  } catch (error) {
    console.error("CREATE_REPORT_ERROR:", error);
    
    // Handle Duplicate Key Error (If report already exists for this appointment)
    if (error.code === 11000) {
       return res.status(400).json({
         success: false,
         message: "A report already exists for this appointment."
       });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message
    });
  }
};

// =================================================================
// GET REPORT BY APPOINTMENT ID (For Viewing Later)
// =================================================================
exports.getReportByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        
        const report = await MedicalRecord.findOne({ appointmentId })
            .populate("appointmentId")
            .populate("doctor", "firstName lastName");

        if(!report) {
            return res.status(404).json({ success: false, message: "No report found for this appointment"});
        }

        return res.status(200).json({ success: true, data: report });

    } catch (error) {
        console.error("GET_REPORT_ERROR:", error);
        return res.status(500).json({ success: false, message: "Error fetching report" });
    }
};
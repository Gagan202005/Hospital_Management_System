const MedicalRecord = require("../models/Medicalrecord");
const Appointment = require("../models/Appointment");
const { uploadImageToCloudinary } = require("../utils/FileUploader");

// =================================================================
// 1. CREATE VISIT REPORT
// =================================================================
// Description: Creates a new medical record, handles file uploads for lab reports,
// parses prescriptions, and marks the appointment as "Completed".
exports.createVisitReport = async (req, res) => {
  try {
    // --- Destructure Input Data ---
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
      patientAdvice,
    } = req.body;

    const doctorId = req.user.id;

    // --- 1. Parse Prescription Data ---
    // Frontend might send JSON string or object depending on submission method (FormData vs JSON)
    let prescription = [];
    if (req.body.prescription) {
      try {
        prescription =
          typeof req.body.prescription === "string"
            ? JSON.parse(req.body.prescription)
            : req.body.prescription;
      } catch (e) {
        console.error("Prescription Parse Error:", e);
      }
    }

    // --- 2. Handle Lab Report File Uploads ---
    let labReports = [];
    if (req.files && req.files.labReports) {
      // Normalize to array (handle single file vs multiple files)
      const files = Array.isArray(req.files.labReports)
        ? req.files.labReports
        : [req.files.labReports];

      for (const file of files) {
        // Upload to Cloudinary folder "LabReports"
        const uploadedFile = await uploadImageToCloudinary(file, "LabReports");

        // Push standardized file object to array
        labReports.push({
          originalName: file.name,
          url: uploadedFile.secure_url, // Always use secure_url (HTTPS)
          public_id: uploadedFile.public_id, // Store for future deletion logic
          resource_type: uploadedFile.resource_type, // "image" or "raw" (for PDFs)
          format: uploadedFile.format || null,
        });
      }
    }

    // --- 3. Validate Appointment ---
    const appointment = await Appointment.findById(appointmentId).populate(
      "patientDetails"
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // --- 4. Create Medical Record in DB ---
    const newRecord = await MedicalRecord.create({
      appointmentId,
      doctor: doctorId,
      // Link to registered patient if exists, otherwise null
      patient: appointment.patient || null,
      // Snapshot of patient details (Preserves history if user updates profile later)
      patientDetails: {
        name: `${appointment.patientDetails.firstName} ${appointment.patientDetails.lastName}`,
        email: appointment.patientDetails.email,
        phone: appointment.patientDetails.phone,
      },
      diagnosis,
      symptoms,
      vitalSigns: { bp, weight, temperature, spo2, heartRate },
      doctorNotes,
      patientAdvice,
      prescription,
      labReports,
    });

    // --- 5. Close the Appointment ---
    appointment.status = "Completed";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Visit Report created successfully",
      data: newRecord,
    });

  } catch (error) {
    console.error("CREATE_REPORT_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create report",
      error: error.message,
    });
  }
};


// =================================================================
// 2. UPDATE VISIT REPORT
// =================================================================
// Description: Allows doctor to edit diagnosis, vitals, prescriptions,
// and add/remove lab reports from an existing record.
exports.updateVisitReport = async (req, res) => {
  try {
    const {
      reportId,
      diagnosis,
      symptoms,
      bp,
      weight,
      temperature,
      spo2,
      heartRate,
      doctorNotes,
      patientAdvice,
      deletedLabReports, // Expecting a JSON string of URLs to remove
    } = req.body;

    const record = await MedicalRecord.findById(reportId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Ensure array exists
    if (!record.labReports) record.labReports = [];

    // --- 1. Remove Deleted Files ---
    if (deletedLabReports) {
      let filesToDelete = [];
      try {
        filesToDelete = JSON.parse(deletedLabReports);
      } catch (e) {
        console.error("Parse Error deletedLabReports");
      }

      // Filter out files whose URLs match the deletion list
      if (Array.isArray(filesToDelete) && filesToDelete.length > 0) {
        record.labReports = record.labReports.filter(
          (file) => !filesToDelete.includes(file.url)
        );
      }
    }

    // --- 2. Upload New Files ---
    if (req.files && req.files.labReports) {
      const files = Array.isArray(req.files.labReports)
        ? req.files.labReports
        : [req.files.labReports];

      for (const file of files) {
        const uploadedFile = await uploadImageToCloudinary(file, "LabReports");

        record.labReports.push({
          originalName: file.name,
          url: uploadedFile.secure_url,
          public_id: uploadedFile.public_id,
          resource_type: uploadedFile.resource_type,
          format: uploadedFile.format || null,
        });
      }
    }

    // --- 3. Update Text Fields (Only if provided) ---
    if (diagnosis !== undefined) record.diagnosis = diagnosis;
    if (symptoms !== undefined) record.symptoms = symptoms;
    if (doctorNotes !== undefined) record.doctorNotes = doctorNotes;
    if (patientAdvice !== undefined) record.patientAdvice = patientAdvice;

    // --- 4. Update Vitals (Partial updates allowed) ---
    record.vitalSigns = {
      bp: bp !== undefined ? bp : record.vitalSigns?.bp,
      weight: weight !== undefined ? weight : record.vitalSigns?.weight,
      temperature:
        temperature !== undefined ? temperature : record.vitalSigns?.temperature,
      spo2: spo2 !== undefined ? spo2 : record.vitalSigns?.spo2,
      heartRate:
        heartRate !== undefined ? heartRate : record.vitalSigns?.heartRate,
    };

    // --- 5. Update Prescription ---
    if (req.body.prescription) {
      try {
        const parsedPrescription =
          typeof req.body.prescription === "string"
            ? JSON.parse(req.body.prescription)
            : req.body.prescription;
        record.prescription = parsedPrescription;
      } catch (e) {
        console.error("Prescription Update Parse Error");
      }
    }

    // Save changes
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: record,
    });

  } catch (error) {
    console.error("UPDATE_REPORT_ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update report",
    });
  }
};


// =================================================================
// 3. GET REPORT BY APPOINTMENT ID
// =================================================================
// Description: Fetches the full medical record for a specific appointment.
exports.getReportByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const report = await MedicalRecord.findOne({ appointmentId })
      .populate("appointmentId") // Get date/time details
      .populate("doctor", "firstName lastName"); // Get Doctor name

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "No report found for this appointment",
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });

  } catch (error) {
    console.error("GET_REPORT_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching report",
    });
  }
};
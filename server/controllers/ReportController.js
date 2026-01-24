const MedicalRecord = require("../models/Medicalrecord");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor"); 
const Patient = require("../models/Patient");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// ... createVisitReport remains the same ...
exports.createVisitReport = async (req, res) => {
  try {
    const { 
      appointmentId, diagnosis, symptoms, bp, weight, 
      temperature, spo2, heartRate, doctorNotes, patientAdvice 
    } = req.body;

    const doctorId = req.user.id; 

    // Handle Prescription
    let prescription = [];
    if (req.body.prescription) {
        prescription = typeof req.body.prescription === 'string' 
            ? JSON.parse(req.body.prescription) 
            : req.body.prescription;
    }

    // Handle Files
    let labReports = [];
    if (req.files && req.files.labReports) {
        const files = Array.isArray(req.files.labReports) ? req.files.labReports : [req.files.labReports];
        
        for (const file of files) {
            const uploadedFile = await uploadImageToCloudinary(file, "LabReports");
            labReports.push({
                originalName: file.name,
                url: uploadedFile.secure_url
            });
        }
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const newRecord = await MedicalRecord.create({
      appointmentId,
      doctor: doctorId,
      patient: appointment.patient || null,
      patientDetails: {
          name: `${appointment.patientDetails.firstName} ${appointment.patientDetails.lastName}`,
          email: appointment.patientDetails.email,
          phone: appointment.patientDetails.phone
      },
      diagnosis,
      symptoms,
      vitalSigns: { bp, weight, temperature, spo2, heartRate },
      doctorNotes,
      patientAdvice,
      prescription,
      labReports
    });

    appointment.status = "Completed";
    await appointment.save();

    if (appointment && appointment.patientDetails?.email) {
            try {
                await mailSender(
                    appointment.patientDetails.email,
                    "Medical Report Generated",
                    `<div style="font-family: sans-serif;">
                        <h2>Your Visit is Completed</h2>
                        <p>Dr. has generated your medical report.</p>
                        <p>You can login to the patient portal to view and download your prescription and diagnosis.</p>
                        <a href="https://your-website.com/patient-dashboard/appointments">View Report</a>
                    </div>`
                );
            } catch (e) {
                console.error("Report Mail Error", e);
            }
        }

        
    return res.status(200).json({
      success: true,
      message: "Visit Report created successfully",
      data: newRecord
    });

  } catch (error) {
    console.error("CREATE_REPORT_ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to create report", error: error.message });
  }
};


// UPDATE REPORT
exports.updateVisitReport = async (req, res) => {
    try {
        const { 
            reportId, diagnosis, symptoms, bp, weight, 
            temperature, spo2, heartRate, doctorNotes, patientAdvice,
            deletedLabReports
        } = req.body;

        const record = await MedicalRecord.findById(reportId);
        if (!record) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        if (!record.labReports) record.labReports = [];

        // 1. Handle Deletions
        if (deletedLabReports) {
            const filesToDelete = JSON.parse(deletedLabReports);
            if (filesToDelete.length > 0) {
                record.labReports = record.labReports.filter(
                    file => !filesToDelete.includes(file.url)
                );
            }
        }

        // 2. Handle New Uploads
        if (req.files && req.files.labReports) {
            const files = Array.isArray(req.files.labReports) ? req.files.labReports : [req.files.labReports];
            for (const file of files) {
                const uploadedFile = await uploadImageToCloudinary(file, "LabReports");
                record.labReports.push({
                    originalName: file.name,
                    url: uploadedFile.secure_url
                });
            }
        }

        // 3. Update Text Fields (FIXED LOGIC)
        // Check !== undefined ensures we can save empty strings (clearing the field)
        if (diagnosis !== undefined) record.diagnosis = diagnosis;
        if (symptoms !== undefined) record.symptoms = symptoms;
        if (doctorNotes !== undefined) record.doctorNotes = doctorNotes;
        if (patientAdvice !== undefined) record.patientAdvice = patientAdvice;

        // 4. Update Vitals
        // We use || record... only if the value is strictly undefined, otherwise we accept empty strings to clear vitals
        record.vitalSigns = {
            bp: bp !== undefined ? bp : record.vitalSigns?.bp,
            weight: weight !== undefined ? weight : record.vitalSigns?.weight,
            temperature: temperature !== undefined ? temperature : record.vitalSigns?.temperature,
            spo2: spo2 !== undefined ? spo2 : record.vitalSigns?.spo2,
            heartRate: heartRate !== undefined ? heartRate : record.vitalSigns?.heartRate,
        };

        // 5. Update Prescription
        if (req.body.prescription) {
             const parsedPrescription = typeof req.body.prescription === 'string' 
                ? JSON.parse(req.body.prescription) 
                : req.body.prescription;
             record.prescription = parsedPrescription;
        }

        await record.save();

        return res.status(200).json({
            success: true,
            message: "Report updated successfully",
            data: record
        });

    } catch (error) {
        console.error("UPDATE_REPORT_ERROR", error);
        return res.status(500).json({ success: false, message: "Failed to update report" });
    }
};

// ... getReportByAppointment remains the same ...
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
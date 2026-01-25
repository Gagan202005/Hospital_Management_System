const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    // =================================================================
    // RELATIONSHIPS (Context)
    // =================================================================
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // Ensures one report per appointment
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", 
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // Optional: Links to registered profile if available
    },
    
    // =================================================================
    // IMMUTABLE PATIENT SNAPSHOT
    // =================================================================
    // Stores patient info at the time of visit. Useful if the user 
    // deletes their account later, or if this was a guest appointment.
    patientDetails: {
      name: String,
      email: String,
      phone: String,
    },
    
    // =================================================================
    // CLINICAL FINDINGS
    // =================================================================
    diagnosis: { 
      type: String, 
      required: true // The primary conclusion of the visit
    },
    symptoms: { 
      type: String // Patient's reported complaints
    }, 
    
    // =================================================================
    // VITALS
    // =================================================================
    vitalSigns: {
      bp: String,          // Blood Pressure (e.g., "120/80")
      weight: String,      // e.g., "70 kg"
      temperature: String, // e.g., "98.6 F"
      spo2: String,        // Oxygen Saturation
      heartRate: String    // BPM
    },

    // =================================================================
    // ATTACHMENTS
    // =================================================================
    labReports: [
        {
            originalName: { type: String }, // e.g., "blood_test.pdf"
            url: { type: String }           // Cloudinary/S3 URL
        }
    ],

    // =================================================================
    // TREATMENT PLAN
    // =================================================================
    doctorNotes: { type: String },   // Internal/Clinical notes
    patientAdvice: { type: String }, // Lifestyle/Dietary advice for patient

    prescription: [
        {
            medicineName: String,
            dosage: String,      // e.g., "500mg"
            frequency: String,   // e.g., "1-0-1" (Morning-Afternoon-Night)
            duration: String,    // e.g., "5 Days"
            instructions: String,// e.g., "After food"
        },
    ],
  },
  { 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
  }
);

// Prevent model overwrite in serverless environments (optional safety check)
module.exports = mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", medicalRecordSchema);
const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    // CHANGED: Reference 'Doctor' model explicitly
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor", 
      required: true,
    },
    // CHANGED: Reference 'Patient' model explicitly (if patient is registered)
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient"
    },
    
    // Snapshot of patient info (Immutable)
    patientDetails: {
      name: String,
      email: String,
      phone: String,
    },
    
    diagnosis: { type: String, required: true },
    symptoms: { type: String }, 
    
    vitalSigns: {
      bp: String,          
      weight: String,      
      temperature: String, 
      spo2: String,        
      heartRate: String    
    },

    labReports: [
        {
            originalName: { type: String },
            url: { type: String }
        }
    ],

    doctorNotes: { type: String },   
    patientAdvice: { type: String }, 

    prescription: [
        {
            medicineName: String,
            dosage: String,
            frequency: String,
            duration: String,
            instructions: String, 
        },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", medicalRecordSchema);
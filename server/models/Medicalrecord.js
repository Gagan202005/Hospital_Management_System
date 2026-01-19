const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    // Snapshot of patient info at time of visit
    patientDetails: {
      name: String,
      email: String,
      phone: String,
    },
    
    // General Report Fields
    diagnosis: { type: String, required: true },
    symptoms: { type: String }, // What patient complained of
    vitalSigns: {
      bp: String,     // e.g. "120/80"
      weight: String, // e.g. "70kg"
      temperature: String, // e.g. "98F"
    },
    doctorNotes: { type: String }, // Private notes

    // Prescription Array
    prescription: [
      {
        medicineName: String,
        dosage: String,
        frequency: String,
        duration: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
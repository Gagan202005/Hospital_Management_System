const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // =================================================================
    // RELATIONSHIPS (Who is involved?)
    // =================================================================
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", 
      default: null, // Can be null if it's a guest or walk-in appointment
    },

    // =================================================================
    // PATIENT SNAPSHOT
    // =================================================================
    // We store these details directly in the appointment to ensure 
    // we have the contact info even if the Patient user is deleted later.
    patientDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    // =================================================================
    // SCHEDULING DETAILS
    // =================================================================
    date: {
      type: Date,
      required: true, // The specific calendar date of the appointment
    },
    
    // Technical Reference: Used for availability logic (locking the slot)
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: true,
    },
    
    // Display Field: Human-readable string (e.g., "09:00 AM - 09:30 AM")
    // Stored here to avoid multiple populates just to show the time.
    timeSlot: {
      type: String, 
      required: true,
    },

    // =================================================================
    // MEDICAL CONTEXT
    // =================================================================
    reason: { 
      type: String, 
      required: true 
    },
    symptoms: { 
      type: String, 
      default: "" 
    },

    // =================================================================
    // APPOINTMENT STATUS
    // =================================================================
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Confirmed",
    },
  },
  { 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
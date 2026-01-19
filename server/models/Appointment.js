const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", 
      default: null,
    },
    patientDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    
    // --- CHANGED: Link to specific TimeSlot ID ---
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: true,
    },
    
    // We still keep the string for easy reading in admin panels
    timeSlot: {
      type: String, 
      required: true,
    },

    reason: { type: String, required: true },
    symptoms: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
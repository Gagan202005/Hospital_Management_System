const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: true,
      unique: true, // A bed number (e.g., A-101) should be unique across the hospital
      trim: true,
    },
    ward: {
      type: String,
      required: true,
      enum: [
        "emergency",
        "icu",
        "cardiology",
        "orthopedics",
        "pediatrics",
        "maternity",
        "surgery",
        "general",
      ],
    },
    type: {
      type: String,
      required: true,
      enum: [
        "standard",
        "icu",
        "emergency",
        "pediatric",
        "maternity",
        "isolation",
      ],
    },
    roomNumber: {
      type: String, // String allows for values like "104-B" or "ICU-2"
      required: true,
      trim: true,
    },
    floorNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance", "Cleaning"],
      default: "Available",
      required: true,
    },
    // Reference to a Patient model if the bed is Occupied
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", 
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bed", bedSchema);
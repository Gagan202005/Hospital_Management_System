const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    // =================================================================
    // BED IDENTIFICATION
    // =================================================================
    bedID: {
      type: Number,
      unique: true // Internal Auto-Incremented ID (Starts at 1001)
    },
    bedNumber: {
      type: String,
      required: true,
      unique: true, // Human-readable ID (e.g., "ICU-01", "GEN-105")
      trim: true,
    },

    // =================================================================
    // LOCATION & CLASSIFICATION
    // =================================================================
    ward: {
      type: String,
      required: true,
      enum: [
        "Emergency",
        "ICU",
        "Cardiology",
        "Orthopedics",
        "Pediatrics",
        "Maternity",
        "Surgery",
        "General",
      ], // Broad department category
    },
    type: {
      type: String,
      required: true,
      enum: [
        "Standard",
        "ICU",
        "Emergency",
        "Pediatric",
        "Maternity",
        "Isolation",
      ], // Specific functional type of the bed
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    floorNumber: {
      type: Number,
      required: true,
    },

    // =================================================================
    // FINANCIALS
    // =================================================================
    dailyCharge: {
      type: Number,
      required: true,
      default: 0 // Cost per day for occupying this bed
    },

    // =================================================================
    // STATUS & OCCUPANCY
    // =================================================================
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance", "Cleaning"],
      default: "Available",
      required: true,
    },
    // If status is "Occupied", this field links to the current patient
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", 
      default: null,
    },
  },
  { 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
  }
);

// =================================================================
// PRE-SAVE HOOK: AUTO-INCREMENT BED ID
// =================================================================
bedSchema.pre("save", async function (next) {
  // Only run logic if this is a new document
  if (this.isNew) {
      try {
          // Find the bed with the highest ID
          const lastBed = await this.constructor.findOne({}, { bedID: 1 })
              .sort({ bedID: -1 })
              .limit(1);

          // If no bed exists, start at 1001; otherwise increment
          this.bedID = lastBed && lastBed.bedID ? lastBed.bedID + 1 : 1001;
          next();
      } catch (error) {
          next(error);
      }
  } else {
      next();
  }
});

module.exports = mongoose.model("Bed", bedSchema);
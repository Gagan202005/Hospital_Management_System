const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    bedID: {
      type: Number,
      unique: true
    },
    bedNumber: {
      type: String,
      required: true,
      unique: true, // e.g., "ICU-01"
      trim: true,
    },
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
      ],
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
      ],
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
    dailyCharge: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance", "Cleaning"],
      default: "Available",
      required: true,
    },
    // Reference to Patient if Occupied
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", 
      default: null,
    },
  },
  { timestamps: true }
);

// 🚀 AUTO-INCREMENT HOOK
bedSchema.pre("save", async function (next) {
  if (this.isNew) {
      try {
          const lastBed = await mongoose.model("Bed", bedSchema)
              .findOne({}, { bedID: 1 })
              .sort({ bedID: -1 })
              .limit(1);

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
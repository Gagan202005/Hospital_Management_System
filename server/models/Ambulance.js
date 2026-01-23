const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
    {
        ambulanceID: {
            type: Number,
            unique: true
        },
        vehicleNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        model: {
            type: String,
            required: true,
        },
        year: {
            type: String,
            required: true,
        },
        driverName: {
            type: String,
            required: true,
        },
        driverContact: {
            type: String,
            required: true,
        },
        driverLicense: {
            type: String,
            required: true,
        },
        pricePerHour: {
            type: Number,
            required: true,
            default: 0
        },
        // Status tracking
        isAvailable: {
            type: Boolean,
            default: true,
        },
        // Details of the active trip (if active)
        currentTrip: {
            patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", default: null },
            address: { type: String, default: "" },
            reason: { type: String, default: "" },
            startTime: { type: Date, default: null }
        }
    },
    { timestamps: true }
);

// 🚀 AUTO-INCREMENT HOOK for ambulanceID
ambulanceSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const lastAmb = await mongoose.model("Ambulance", ambulanceSchema)
                .findOne({}, { ambulanceID: 1 })
                .sort({ ambulanceID: -1 })
                .limit(1);

            // Start IDs from 100
            this.ambulanceID = lastAmb && lastAmb.ambulanceID ? lastAmb.ambulanceID + 1 : 101;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("Ambulance", ambulanceSchema);
const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
    {
        // =================================================================
        // VEHICLE IDENTIFICATION
        // =================================================================
        ambulanceID: {
            type: Number,
            unique: true // Custom Auto-Incremented ID (Starts at 101)
        },
        vehicleNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true // License plate number must be unique
        },
        model: {
            type: String,
            required: true, // e.g., "Tata Winger", "Force Traveler"
        },
        year: {
            type: String,
            required: true, // Manufacturing year
        },

        // =================================================================
        // DRIVER DETAILS
        // =================================================================
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
            required: true, // License number for verification
        },

        // =================================================================
        // OPERATIONAL STATUS & PRICING
        // =================================================================
        pricePerHour: {
            type: Number,
            required: true,
            default: 0
        },
        isAvailable: {
            type: Boolean,
            default: true, // True = Ready for booking, False = On a trip
        },

        // =================================================================
        // ACTIVE TRIP TRACKING
        // =================================================================
        // Stores details only when the ambulance is currently booked
        currentTrip: {
            patientId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Patient", 
                default: null 
            },
            address: { 
                type: String, 
                default: "" // Destination/Pickup address
            },
            reason: { 
                type: String, 
                default: "" // Emergency reason
            },
            startTime: { 
                type: Date, 
                default: null // Used to calculate duration/cost later
            }
        }
    },
    { 
        timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
    }
);

// =================================================================
// PRE-SAVE HOOK: AUTO-INCREMENT AMBULANCE ID
// =================================================================
ambulanceSchema.pre("save", async function (next) {
    // Only run this logic if the document is new
    if (this.isNew) {
        try {
            // Find the ambulance with the highest ID
            const lastAmb = await this.constructor.findOne({}, { ambulanceID: 1 })
                .sort({ ambulanceID: -1 })
                .limit(1);

            // If no ambulance exists, start at 101; otherwise increment
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
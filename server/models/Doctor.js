const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        // --- Personal Details ---
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true }, // Added unique
        password: { type: String, required: true },
        
        image: { type: String, required: true },
        dob: { type: String, required: true }, // Format: YYYY-MM-DD
        age: { type: Number, required: true },
        gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
        bloodGroup: { type: String, required: true }, // e.g., "O+", "A-"
        address: { type: String, required: true },
        phoneno: { type: String, required: true, trim: true }, // Changed to String
        
        // --- Professional Details ---
        doctorID: { type: Number, unique: true }, // Auto-incrementing ID
        
        department: { 
            type: String, 
            required: true 
        }, // e.g., "Cardiology"
        
        specialization: { 
            type: String, 
            trim: true 
        }, // e.g., "Interventional Cardiologist"
        
        qualification: [{
            degree: { type: String, required: true }, // e.g., "MBBS"
            college: { type: String, required: true }, // e.g., "AIIMS Delhi"
            year: { type: String }
        }],
        
        experience: { type: String, required: true }, // e.g., "12 Years"
        
        consultationFee: {
            type: Number,
            default: 0
        },

        about: { type: String, trim: true },

        // --- Scheduling & Status ---
        status: {
            type: String,
            enum: ["Active", "On Leave", "Resigned"],
            default: "Active",
        },
        
        // Simple availability tracking (Optional enhancement)
        availability: [{
            day: { type: String }, // e.g., "Monday"
            startTime: { type: String }, // "09:00"
            endTime: { type: String }    // "17:00"
        }],

        // --- Relationships ---
        myAppointments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        }],
        
        // --- System Fields ---
        accountType: { type: String, default: "Doctor" },
        active: { type: Boolean, default: true },
        token: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

// 🚀 AUTO-INCREMENT HOOK for doctorID
doctorSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const lastDoc = await mongoose.model("Doctor", doctorSchema)
                .findOne({}, { doctorID: 1 })
                .sort({ doctorID: -1 })
                .limit(1);

            // Start IDs from 1000 to look professional, or 0 if you prefer
            this.doctorID = lastDoc && lastDoc.doctorID ? lastDoc.doctorID + 1 : 1001;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("Doctor", doctorSchema);
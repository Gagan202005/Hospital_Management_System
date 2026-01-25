const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        // =================================================================
        // PERSONAL DETAILS
        // =================================================================
        firstName: { 
            type: String, 
            required: true, 
            trim: true 
        },
        lastName: { 
            type: String, 
            required: true, 
            trim: true 
        },
        email: { 
            type: String, 
            required: true, 
            trim: true, 
            unique: true // Ensures no duplicate doctor accounts
        },
        password: { 
            type: String, 
            required: true 
        },
        image: { 
            type: String, 
            required: true // URL to profile picture
        },
        dob: { 
            type: String, 
            required: true // Format: YYYY-MM-DD
        }, 
        age: { 
            type: Number, 
            required: true 
        },
        gender: { 
            type: String, 
            required: true, 
            enum: ["Male", "Female", "Other"] 
        },
        bloodGroup: { 
            type: String, 
            required: true // e.g., "O+", "A-"
        },
        address: { 
            type: String, 
            required: true 
        },
        phoneno: { 
            type: String, 
            required: true, 
            trim: true // Stored as string to preserve leading zeros if any
        },

        // =================================================================
        // PROFESSIONAL CREDENTIALS
        // =================================================================
        doctorID: { 
            type: Number, 
            unique: true // Custom Auto-Incremented ID (Starts at 1001)
        },
        
        department: { 
            type: String, 
            required: true // e.g., "Cardiology", "Neurology"
        },
        
        specialization: { 
            type: String, 
            trim: true // e.g., "Interventional Cardiologist"
        },
        
        qualification: [{
            degree: { type: String, required: true }, // e.g., "MBBS", "MD"
            college: { type: String, required: true }, // e.g., "AIIMS Delhi"
            year: { type: String } // Year of graduation
        }],
        
        experience: { 
            type: String, 
            required: true // e.g., "12 Years"
        },
        
        consultationFee: {
            type: Number,
            default: 0 // Base charge per visit
        },

        about: { 
            type: String, 
            trim: true // Short bio/description
        },

        // =================================================================
        // SCHEDULING & STATUS
        // =================================================================
        status: {
            type: String,
            enum: ["Active", "On Leave", "Resigned"],
            default: "Active",
        },
        
        // Basic availability tracking (Can be expanded with TimeSlot model)
        availability: [{
            day: { type: String }, // e.g., "Monday"
            startTime: { type: String }, // "09:00"
            endTime: { type: String }    // "17:00"
        }],

        // =================================================================
        // RELATIONSHIPS
        // =================================================================
        myAppointments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        }],
        
        // =================================================================
        // SYSTEM / METADATA FIELDS
        // =================================================================
        accountType: { 
            type: String, 
            default: "Doctor" 
        },
        active: { 
            type: Boolean, 
            default: true // Soft delete flag
        },
        token: { 
            type: String // For auth persistence
        },
        resetPasswordExpires: { 
            type: Date 
        },
    },
    { 
        timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
    }
);

// =================================================================
// PRE-SAVE HOOK: AUTO-INCREMENT DOCTOR ID
// =================================================================
doctorSchema.pre("save", async function (next) {
    // Only run logic if this is a new document
    if (this.isNew) {
        try {
            // Find the doctor with the highest ID
            const lastDoc = await this.constructor.findOne({}, { doctorID: 1 })
                .sort({ doctorID: -1 })
                .limit(1);

            // If no doctor exists, start at 1001; otherwise increment
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
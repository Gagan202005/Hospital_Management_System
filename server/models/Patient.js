const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        // =================================================================
        // PERSONAL IDENTITY (Required for Signup)
        // =================================================================
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [2, "First name must be at least 2 characters"],
            maxlength: [50, "First name cannot exceed 50 characters"]
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            minlength: [2, "Last name must be at least 2 characters"],
            maxlength: [50, "Last name cannot exceed 50 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            unique: true, // Added unique constraint
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        image: {
            type: String,
            required: true // URL to profile picture
        },

        // =================================================================
        // DEMOGRAPHICS & CONTACT
        // =================================================================
        phoneno: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        dob: {
            type: Date,
            default: null,
        },
        gender: {
            type: String,
            default: "Not specified",
            enum: ["Male", "Female", "Other", "Prefer not to say", "Not specified"]
        },
        bloodGroup: { // Standardized to camelCase
            type: String,
            default: "Not specified",
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not specified"]
        },
        address: {
            type: String,
            default: "",
            trim: true,
            maxlength: [200, "Address cannot exceed 200 characters"]
        },

        // =================================================================
        // MEDICAL STATUS
        // =================================================================
        admitted: {
            type: String,
            default: "not admitted",
            enum: ["admitted", "not admitted", "discharged"]
        },
        // If admitted, which bed are they in?
        bed: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            default: null
        },
        emergencyContactName: {
            type: String,
            default: ""
        },
        emergencyContactPhone: {
            type: String,
            default: ""
        },

        // =================================================================
        // SYSTEM & METADATA
        // =================================================================
        patientID: {
            type: Number,
            unique: true,
            // default is handled by pre-save hook
        },
        accountType: {
            type: String,
            default: "Patient",
        },
        active: {
            type: Boolean,
            default: true
        },
        registrationDate: {
            type: Date,
            default: Date.now
        },
        token: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },

        // =================================================================
        // RELATIONSHIPS
        // =================================================================
        myAppointments: [{ // Standardized to camelCase
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        }],
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// =================================================================
// PRE-SAVE HOOK: AUTO-INCREMENT PATIENT ID
// =================================================================
patientSchema.pre('save', async function(next) {
    // Only generate ID if the document is new
    if (this.isNew) {
        try {
            // Find the patient with the highest patientID
            const lastPatient = await this.constructor.findOne({}, { patientID: 1 })
                .sort({ patientID: -1 });
            
            // If exists, increment; otherwise start at 1
            this.patientID = lastPatient && lastPatient.patientID ? lastPatient.patientID + 1 : 1;
            next();
        } catch (error) {
            return next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("Patient", patientSchema);
const mongoose = require("mongoose");

const patientschema = new mongoose.Schema(
    {
        // Personal Information - Required for signup
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
        },
        phoneno: {
            type: String,
            required: [true, "Phone number is required"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        
        // Account Information - Defaults
        accountType: {
            type: String,
            default: "Patient",
        },
        active: {
            type: Boolean,
            default: true
        },
        
        // Profile Information - Optional with defaults
        image: {
            type: String,
        },
        bloodgroup: {
            type: String,
            default: null,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not specified"]
        },
        gender: {
            type: String,
            default: null,
            enum: ["male", "female", "other", "prefer not to say", "Not specified"]
        },
        address: {
            type: String,
            default: "",
            trim: true,
            maxlength: [200, "Address cannot exceed 200 characters"]
        },
        DOB: {
            type: Date,
            default: null,
        },
        
        // Patient Identification
        patientID: {
            type: Number,
            unique: true,
            default: 1
        },
        
        // Date Information
        registrationDate: {
            type: Date,
            default: Date.now
        },
        
        // Medical Information - Defaults
        admitted: {
            type: String,
            default: "not admitted",
            enum: ["admitted", "not admitted", "discharged"]
        },
        bed: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            default: null
        },
        
        myappointments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        }],
        emergencyContactName: {
            
                type: String,
                default: ""
        },
        emergencyContactPhone: {
            type: String,
            default: ""
        },
        
        
        
        // Authentication - Optional
        token: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Pre-save middleware to auto-increment patientID
patientschema.pre('save', async function(next) {
    // Auto-increment patientID (only for new patients)
    if (this.isNew) {
        try {
            const lastPatient = await mongoose.model('Patient').findOne({}, {}, { sort: { 'patientID': -1 } });
            this.patientID = lastPatient ? lastPatient.patientID + 1 : 1;
        } catch (error) {
            return next(error);
        }
    }
    next();
});
module.exports = mongoose.model("Patient", patientschema);
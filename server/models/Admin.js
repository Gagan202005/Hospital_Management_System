const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
            unique: true // Ensures no duplicate admin accounts
        },
        password: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true // URL to the profile picture (e.g., Cloudinary)
        },
        dob: {
            type: Date,
            required: true
        },
        
        // Derived Field: Should be calculated based on DOB before saving
        age: {
            type: Number,
            required: true
        },

        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"] // Restricts values to these options
        },
        address: {
            type: String,
            required: true
        },
        phoneno: {
            type: String,
            required: true,
            trim: true
        },

        // =================================================================
        // SYSTEM / METADATA FIELDS
        // =================================================================
        adminID: {
            type: Number,
            unique: true // Custom Auto-Incremented ID
        },
        accountType: {
            type: String,
            default: "Admin" // Role identifier
        },
        active: {
            type: Boolean,
            default: true // Soft delete flag
        },
        token: {
            type: String // Used for authentication persistence or reset flows
        },
        resetPasswordExpires: {
            type: Date // Expiration time for password reset tokens
        },
    },
    { 
        timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
    }
);

// =================================================================
// PRE-SAVE HOOK: AUTO-INCREMENT ADMIN ID
// =================================================================
// This middleware runs before saving a new document to assign a sequential adminID.
adminSchema.pre("save", async function (next) {
    // Only generate ID if the document is new
    if (this.isNew) {
        try {
            // Find the most recently created admin to get the last ID
            const lastAdmin = await this.constructor.findOne({}, { adminID: 1 })
                .sort({ adminID: -1 })
                .limit(1);

            // If an admin exists, increment the ID; otherwise, start at 1
            this.adminID = lastAdmin && lastAdmin.adminID ? lastAdmin.adminID + 1 : 1;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("Admin", adminSchema);
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        // ... (Keep all your existing fields: firstName, lastName, etc.) ...
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        password: { type: String, required: true },
        
        // Profile Details
        phoneno: { type: String, trim: true },
        age: { type: Number, required: true },
        gender: { type: String, required: true },
        address: { type: String, required: true },
        dob: { type: String, required: true },
        image: { type: String, required: true },
        
        // Auto-Incrementing ID
        adminID: { 
            type: Number, // Changed from String to Number
            unique: true 
        },

        active: { type: Boolean, default: true },
        token: { type: String },
        resetPasswordExpires: { type: Date },
        about: { type: String },
        accountType: { type: String, default: "Admin" },
    },
    { timestamps: true }
);

// 🚀 AUTO-INCREMENT HOOK
adminSchema.pre("save", async function (next) {
    // Only generate ID if it's a new document
    if (this.isNew) {
        try {
            // Find the Admin with the highest adminID
            const lastAdmin = await mongoose.model("Admin", adminSchema)
                .findOne({}, { adminID: 1 }) // Select only the ID field
                .sort({ adminID: -1 })       // Sort descending (highest first)
                .limit(1);

            // If an admin exists, increment. If not, start at 0.
            this.adminID = lastAdmin && lastAdmin.adminID !== undefined 
                ? lastAdmin.adminID + 1 
                : 1;
                
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("Admin", adminSchema);
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        // --- Personal Details ---
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true },
        password: { type: String, required: true },
        
        image: { type: String, required: true },
        dob: { type: Date, required: true },
        
        // Auto-calculated in backend
        age: { type: Number, required: true },
        
        gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
        address: { type: String, required: true },
        phoneno: { type: String, required: true, trim: true },
        
        // --- System Fields ---
        adminID: { type: Number, unique: true }, // Auto-increment
        accountType: { type: String, default: "Admin" },
        active: { type: Boolean, default: true },
        token: { type: String },
        resetPasswordExpires: { type: Date },
    },
    { timestamps: true }
);

// 🚀 AUTO-INCREMENT HOOK for adminID
adminSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const lastAdmin = await mongoose.model("Admin", adminSchema)
                .findOne({}, { adminID: 1 })
                .sort({ adminID: -1 })
                .limit(1);

            // Start Admin IDs from 1
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
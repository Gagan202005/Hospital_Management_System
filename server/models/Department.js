const mongoose = require("mongoose");

const departmentschema = new mongoose.Schema({
    // =================================================================
    // DEPARTMENT DETAILS
    // =================================================================
    name: {
        type: String,
        required: true, // A department must have a name
        unique: true,   // Prevent duplicates (e.g., two "Cardiology" departments)
        trim: true,     // Removes whitespace
    },

    // =================================================================
    // STAFF ASSOCIATION
    // =================================================================
    // Array of references to Doctor documents that belong to this department
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    }],
},
{ 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model("Department", departmentschema);
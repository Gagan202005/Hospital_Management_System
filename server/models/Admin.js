const mongoose = require("mongoose");

const adminschema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        // Define the email field with type String, required, and trimmed
        email: {
            type: String,
            required: true,
            trim: true,
        },

        // Define the password field with type String and required
        password: {
            type: String,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
        token: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        },
        image: {
            type: String,
            required: true,
        },
        phoneno:{
            type: Number,
            minlength: 10,
        },
        age: {
            type: Number,
            required:true,
        },
        gender:{
            type: String,
            required: true,
        },
        address:{
            type:String,
            required:true,
        },
        adminID:{
            type:String,
        },
        date: {
            type: Date,
        },
        DOB: {
            type: String,
        },
        about:{
            type: String,
        },
        accountType: {
			type: String,
			default:"Admin",
		},
    },
    { timestamps: true }
);


module.exports = mongoose.model("Admin", adminschema);

const mongoose = require("mongoose");

const nurseschema = new mongoose.Schema(
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
        email: {
            type: String,
            required: true,
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
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
        nurseID:{
            type:String,
        },
        date: {
            type: Date,
        },
        DOB: {
            type: String,
        },
        accountType: {
			type: String,
			default:"nurse",
		},
        department:[{
            type:String,
            required:true,
        }],
        qualification:[{
            degree:{
                type:String,
            },
            college:{
                type:String,
            },
        }],
        experience:{
            type:Number,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Nurse", nurseschema);

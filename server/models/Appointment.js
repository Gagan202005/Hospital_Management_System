const mongoose = require("mongoose");

const appointmentschema = new mongoose.Schema(
    {
    patient :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    date:{
        type: Date,
        required:true,
    },
    time:{
        type:String,
        required:true,
    },
    disease:{
        type:String,
        required:true,
    }
},
{ timestamps: true },
);

module.exports =mongoose.model("Appointment", appointmentschema);
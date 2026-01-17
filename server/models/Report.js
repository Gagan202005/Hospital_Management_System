const mongoose = require("mongoose");

const reportschema = new mongoose.Schema(
    {
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required:true,
    },
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required:true,
    },
    date:{
        type: Date,
        required:true,
    },
    disease:{
        type:String,
        required:true,
    },
    test_report:[{
        testname : String,
        testvalue : String,
    }],
    medicines:[{
        name : String,
        dosage : Number,
        time:String,
    }],
    suggestions:{
        type: String,
    }
},
{ timestamps: true }
);


module.exports = mongoose.model("Report", reportschema);

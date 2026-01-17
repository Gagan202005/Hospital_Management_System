const mongoose = require("mongoose");
const { string } = require("zod");

const ambulanceschema = new mongoose.Schema(
    {
    driverName:{
        type:String,
        required:true,
    },
    driverContact:{
        type:String,
        required:true,
        length : 10,
    },
    vehicleNumber:{
        type:String,
        required:true,
    },
    availability:{
        type:Boolean,
        required:true,
        default:true,
    },
    year:{
        type:string,
        required:true,
    },
    model:{
        type:string,
        required:true,
    },
    driverLicense:{
        type:string,
        required:true,
    },
    }
);


module.exports = mongoose.model("Ambulance", ambulanceschema);

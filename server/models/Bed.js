const mongoose = require("mongoose");
const Patient = require("./Patient");

const bedschema = new mongoose.Schema(
    {
    bed_number:{
        type:String,
    },
    room_number:{
        type:String,
    },
    availability:{
        type:Boolean,
        default:true,
    },
    patient:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Patient",
        default:null,
    }
}
);

module.exports = mongoose.model("Bed", bedschema);

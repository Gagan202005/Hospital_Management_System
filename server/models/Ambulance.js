const mongoose = require("mongoose");

const ambulanceschema = new mongoose.Schema(
    {
    drivername:{
        type:String,
    },
    MobileNo:{
        type:String,
        length : 10,
    },
    numberplate:{
        type:String,
    },
    charges:{
        type:Number,
    },
    availability:{
        type:Boolean,
        default:true,
    }
}
);


module.exports = mongoose.model("Ambulance", ambulanceschema);

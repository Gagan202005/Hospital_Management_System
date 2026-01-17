const mongoose = require("mongoose");

const departmentschema = new mongoose.Schema({
    name:{
        type:String,
    },
    doctors:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required:true,
    }],
}
);

module.exports = mongoose.model("Department", departmentschema);

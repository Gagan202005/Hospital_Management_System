const Admin = require("../models/Admin");
const Ambulance = require("../models/Ambulance");
const Bed = require("../models/Bed");
const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient")


exports.getallUser = async (req,res) => {
    try{
        const {accountType} = req.body;
        let users;
        if(!accountType){
            return res.status(500).json({
                success : false,
                message : "accountType is missing",
            });
        }
        if(accountType==="patient"){
            users = await Patient.find({});
        }
        if(accountType==="doctor"){
            users = await Doctor.find({});
        }
        if(accountType==="admin"){
            users = await Admin.find({});
        }
        if(accountType==="nurse"){
            users = await Nurse.find({});
        }
        return res.status(200).json({
            success : true,
            message : "data fetched successfully",
            users,
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message,
        });
    }
}

exports.getallAmbulance = async (req,res) => {
    try{
        const ambulances = await Ambulance.find({});
        return res.status(200).json({
            success : true,
            message : "ambulances data fetched successfully",
            ambulances,
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message,
        });
    }
}

exports.getallBed = async (req,res) => {
    try{
        const Beds = await Bed.find({});
        return res.status(200).json({
            success : true,
            message : "ambulances data fetched successfully",
            Beds,
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message,
        });
    }
}


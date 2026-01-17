const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Slot = require("../models/Slot");

exports.makingreport = async (req,res) => {
    try{
        const {doctor} = req.doctor;
        const {email,name,disease,suggestions,test_report,medicines} = req.body;
    }
    catch(err){
        return res.status(500).json({
            success : false,
            error : err,
        });
    }
}


exports.add_slot = async (req,res) => {
    try{
        const {time,doc_id,charges} = req.body;
        if(!time || !doc_id || !charges){
            return res.status(500).json({
                success : false,
                message : "all fields are req",
            });
        }
        const existingSlot = await Slot.findOne({time:time,docID:doc_id});
        if(existingSlot){
            return res.status(500).json({
                success : false,
                message : "already exists",
            });
        }
        const slot = await Slot.create({
            time,
            docID:doc_id,
            charges,
        });
        return res.status(200).json({
            success : true,
            message : "slot added successfully",
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            error : err,
        });
    }
}
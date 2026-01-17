const Admin = require("../models/Admin");
const Ambulance = require("../models/Ambulance");
const Bed = require("../models/Bed");
const Doctor = require("../models/Doctor");
const Nurse = require("../models/Nurse");
const Patient = require("../models/Patient")


exports.getallUser = async (req, res) => {
    try {
        // FIX: GET requests send data in the Query String (URL), not Body.
        const { accountType } = req.query; 

        if (!accountType) {
            return res.status(400).json({
                success: false,
                message: "Account Type is missing",
            });
        }

        let users = [];

        // Clean logic with case-insensitivity
        switch (accountType.toLowerCase()) {
            case "patient":
                users = await Patient.find({});
                break;
            case "doctor":
                users = await Doctor.find({});
                break;
            case "admin":
                users = await Admin.find({});
                break;
            case "nurse":
                users = await Nurse.find({});
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid Account Type provided",
                });
        }

        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data: users, 
        });

    } catch (err) {
        console.error("Fetch Users Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: err.message,
        });
    }
};


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


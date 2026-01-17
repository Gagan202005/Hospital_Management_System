const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator");
const Appointment = require("../models/Appointment");
const Admin = require("../models/Admin");
const Bed = require("../models/Bed");
const Nurse = require("../models/Nurse");
const Ambulance = require("../models/Ambulance");
const Slot = require("../models/Slot");
require("dotenv").config();

exports.Add_Doctor = async (req,res) =>{
    try{
        const {firstName,lastName,email,password,bloodgroup,phoneno,age,gender,
            address,DOB,about,department,qualification,experience,otp,confirmpassword} = req.body;
            if(!firstName || !lastName || !email || !password || !confirmpassword
             || !bloodgroup || !phoneno || !age
            || !gender || !address || !DOB || !about || !department
            || !qualification || !experience || !otp){
                return res.status(500).json({
                    success : false,
                    message : "all fields are required",
                });
            }
        const existingUser = await Doctor.findOne({email});
        if(existingUser){
            return res.status(500).json({
            success : false,
            message : "you are already registered with us",
            });
        }
        if(password!==confirmpassword){
            return res.status(500).json({
            success : false,
            message : "password is wrong",
            });
        }
        const response = await OTP.find({email}).sort({ createdAt: -1 }).limit(1);
        if(!response){
            // Invalid OTP
            return res.status(500).json({
            success : false,
            message : "otp is wrong",
            });
        }
        else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}
        // Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

        const doctor = await Doctor.create({
            firstName,lastName,email,
            bloodgroup,phoneno,age,gender,
            address,DOB,about,department,
            qualification,experience,
            password: hashedPassword,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
        });
        return res.status(200).json({
			success: true,
			user:doctor,
			message: "User registered successfully",
		});
    }
    catch{
        return res.status(500).json({
            success : false,
            message : "something went wrong",
        });
    }
};


exports.fix_appointment = async (req,res) =>{
    try{
        const {doc_email,pat_email,disease,date,time} = req.body;
        if(!doc_email || !pat_email || !disease || !date || !time){
            return res.status(500).json({
            success : false,
            message : 'all fields are required',
            })
        }
        const patient = await Patient.findOne({email : pat_email});
        const doctor = await Doctor.findById({email : doc_email});
        const existingSlot = await Slot.findOne({time:time,docID:doctor._id});
        if(existingSlot){
            await Slot.findByIdAndDelete(existingSlot._id);
        }
        const appointment = await Appointment.create({
            patient : patient._id,
            doctor : doctor._id,
            time,
            date,
            disease,
        });
        patient.myappointments.push({appointment});
        doctor.myappointments.push({appointment});
        return res.status(200).json({
            success:true,
            message:'appointment fixed',
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message,
        })
        
    }
}

exports.add_admin = async (req,res) => {
    try{
        const {firstName,lastName,email,password,phoneno,age,gender,
            address,otp,confirmpassword} = req.body;
            if(!firstName || !lastName || !email || !password || !confirmpassword
             || !phoneno || !age || !gender || !address || !otp){
                return res.status(500).json({
                    success : false,
                    message : "all fields are required",
                });
            }
        const existingUser = await Admin.findOne({email});
        if(existingUser){
            return res.status(500).json({
            success : false,
            message : "you are already registered with us",
            });
        }
        if(password!==confirmpassword){
            return res.status(500).json({
            success : false,
            message : "password is wrong",
            });
        }
        const response = await OTP.find({email}).sort({ createdAt: -1 }).limit(1);
        if(!response){
            // Invalid OTP
            return res.status(500).json({
            success : false,
            message : "otp is wrong",
            });
        }
        else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}
        // Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            firstName,lastName,email,
            bloodgroup,phoneno,age,gender,
            address,DOB,about,
            password: hashedPassword,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
        });
        return res.status(200).json({
			success: true,
			user:admin,
			message: "User registered successfully",
		});
    }
    catch{
        return res.status(500).json({
            success : false,
            message : "something went wrong",
        });
    }
}


exports.add_bed = async (req,res) => {
    try{
        const {bed_number,room_number} = req.body;
        if(!bed_number || !room_number){
            return res.status(500).json({
                success : false,
                message : "all fields are req",
            });
        }
        const existingbed = await Bed.findOne({bed_number});
        if(existingbed){
            return res.status(500).json({
            success : false,
            message : "already added",
        });
        }
        const bed = await Bed.create({
            bed_number ,
            room_number,
        });
        return res.status(200).json({
            success : true,
            message : "bed is added",
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message,
        });
    }
}

exports.add_nurse = async (req,res) => {
    try{
        const {firstName,lastName,email,phoneno,age,gender,
            address,DOB,department,qualification,experience} = req.body;
            if(!firstName || !lastName || !email
             ||!phoneno || !age
            || !gender || !address || !DOB  || !department
            || !qualification || !experience){
                return res.status(500).json({
                    success : false,
                    message : "all fields are required",
                });
            }
        const existingUser = await Nurse.findOne({email});
        if(existingUser){
            return res.status(500).json({
            success : false,
            message : "you are already registered with us",
            });
        }

        const nurse = await Nurse.create({
            firstName,lastName,email,
            phoneno,age,gender,
            address,DOB,department,
            qualification,experience,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
        });
        return res.status(200).json({
			success: true,
			user:nurse,
			message: "User registered successfully",
		});
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "something went wrong",
        });
    }
}

exports.add_ambulance = async (req,res) => {
    try{
        const {drivername,MobileNo,numberplate,charges} = req.body;
        if(!drivername || !MobileNo || !numberplate || !charges){
            return res.status(500).json({
                success : false,
                message : "all fields are req",
            });
        }
        const existingambulance = await Ambulance.findOne({numberplate});
        if(existingambulance){
            return res.status(500).json({
            success : false,
            message : "already added",
        });
        }
        const ambulance = await Ambulance.create({
            drivername,MobileNo,numberplate,charges
        });
        return res.status(200).json({
            success : true,
            message : "ambulance added successfully",
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "something went wrong",
        });
    }
}


exports.book_ambulance = async (req,res) => {
    const {amb_id} = req.body;
    if(!amb_id){
        return res.status(500).json({
            success : false,
            message : "all fields are req",
        });
    }
    const amb = await Ambulance.findById({amb_id});
    amb.updateOne({availability:false});
    await amb.save();
}


exports.allocateBed = async (req,res) => {
    try{
        const {bed_id,pat_id} = req.body;
        if(!bed_id || !pat_id){
            return res.status(500).json({
            success : false,
            message : "all fields are req",
            });
        }
        const bed = await Bed.findById({_id : bed_id});
        const patient = await Patient.findById({_id : pat_id});
        bed.updateOne({availability:false, patient:patient._id});
        patient.updateOne({admitted:"Yes",bed:bed._id});
        return res.status(200).json({
            success : true,
            message : "bed allocated successfully",
        });
    }
    catch(err){
        return res.status(500).json({
        success : false,
        message : err.message,
        });
    }
}


exports.discharge_patient = async (req,res) => {
    try{
        const {patient_id} = req.body;
        if(!patient_id){
            return res.status(500).json({
            success : false,
            message : "all fields are req",
            });
        }
        const patient = await Patient.findById({_id:patient_id});
        if(!patient){
            return res.status(500).json({
            success : false,
            message : "patient id is wrong",
            });
        }
        patient.updateOne({admitted:"Not admitted",bed:null});
        return res.status(200).json({
            success : true,
            message : "discharged successfully",
        });
    }
    catch(err){
        return res.status(500).json({
        success : false,
        message : err.message,
        });
    }
}


















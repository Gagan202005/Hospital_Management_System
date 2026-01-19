const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const Appointment = require("../models/Appointment");
const Admin = require("../models/Admin");
const Bed = require("../models/Bed");
const Nurse = require("../models/Nurse");
const Ambulance = require("../models/Ambulance");
const Slot = require("../models/Slot");
require("dotenv").config();

exports.Add_Doctor = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phoneno,
            password, confirmPassword,
            dob, age, gender, bloodGroup, address,
            department, specialization, experience, consultationFee,
            degree, college // These come as separate strings from frontend
        } = req.body;

        // 1. Validation
        if (!firstName || !lastName || !email || !password || !department || !consultationFee) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // 2. Check Existing
        const existingUser = await Doctor.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "Doctor email already registered" });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Construct Qualification Array
        const qualificationList = [];
        if (degree && college) {
            qualificationList.push({ degree, college });
        }

        // 5. Create Doctor
        const doctor = await Doctor.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneno,
            dob,
            age,
            gender,
            bloodGroup,
            address,
            department,
            specialization,
            experience,
            consultationFee,
            qualification: qualificationList, // Save the array
            image: `https://api.dicebear.com/6.x/initials/svg?seed=Dr ${lastName}&backgroundColor=00acc1`,
            accountType: "Doctor"
        });

        return res.status(200).json({
            success: true,
            data: doctor,
            message: "Doctor registered successfully",
        });

    } catch (error) {
        console.error("Add Doctor Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to register doctor",
            error: error.message,
        });
    }
};

exports.Add_Patient = async (req, res) => {
    try {
        // 1. Destructure using FRONTEND variable names
        // (The frontend sends 'dob', 'phone', 'confirmPassword')
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword, // Matches frontend
            phone,           // Matches frontend
            age,
            gender,
            address,
            dob,             // Matches frontend (format: "YYYY-MM-DD")
            emergencyContact // Optional: Add if your model has this field
        } = req.body;

        // 2. Validate all fields are present
        if (
            !firstName || !lastName || !email || !password || 
            !confirmPassword || !phone || !age || !gender || 
            !address || !dob
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // 3. Check if user already exists
        const existingUser = await Patient.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ // 409 = Conflict
                success: false,
                message: "User is already registered with us",
            });
        }

        // 4. Validate Passwords
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        // 5. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Create the Patient Entry
        // Mongoose automatically casts the "YYYY-MM-DD" string from 'dob' to a Date object
        const patient = await Patient.create({
            firstName,
            lastName,
            email,
            phoneno: phone,   // MAP: frontend 'phone' -> db 'phoneno'
            age,
            gender,
            address,
            DOB: dob,         // MAP: frontend 'dob' -> db 'DOB'
            password: hashedPassword,
            emergencyContactPhone:emergencyContact,
            image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
        });

        // 7. Success Response
        return res.status(200).json({
            success: true,
            user: patient,
            message: "Patient registered successfully",
        });

    } catch (error) {
        console.error("Registration Error:", error); // Log error for debugging
        return res.status(500).json({
            success: false,
            message: "Something went wrong while registering patient",
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
        const {firstName, lastName, email, phoneno, 
            age, gender, dob, address, 
            password, confirmPassword } = req.body;
            if(!firstName || !lastName || !email || !password || !confirmPassword
             || !phoneno || !age || !gender || !address || !dob){
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
        if(password!==confirmPassword){
            return res.status(500).json({
            success : false,
            message : "password is wrong",
            });
        }
        // Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            firstName, lastName, email, phoneno, 
            age, gender, dob, address, 
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
        const {bedNumber,ward,type,roomNumber,floorNumber,status} = req.body;
        if(!bedNumber || !ward || !type || !roomNumber || !floorNumber || !status){
            return res.status(500).json({
                success : false,
                message : "all fields are req",
            });
        }
        const existingbed = await Bed.findOne({bedNumber});
        if(existingbed){
            return res.status(500).json({
            success : false,
            message : "already added",
        });
        }
        const bed = await Bed.create({
            bedNumber,ward,type,roomNumber,floorNumber,status
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
        const {vehicleNumber,model,year,driverName,driverLicense,driverContact} = req.body;
        if(!vehicleNumber || !model || !year || !driverName || !driverLicense || !driverContact){
            return res.status(500).json({
                success : false,
                message : "all fields are req",
            });
        }
        const existingambulance = await Ambulance.findOne({vehicleNumber});
        if(existingambulance){
            return res.status(500).json({
            success : false,
            message : "already added",
        });
        }
        const ambulance = await Ambulance.create({
            vehicleNumber,model,year,driverName,driverLicense,driverContact
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

// --- 1. UPDATE PROFILE DETAILS ---
exports.updateAdminProfile = async (req, res) => {
  try {
    // 1. Get Admin ID from middleware (req.user)
    const adminId = req.user.id;

    // 2. Get data from body
    // We only extract fields that are allowed to be updated via this API
    const {
      firstName,
      lastName,
      phoneno,
      dob,
      age,
      gender,
      address,
      about
    } = req.body;

    // 3. Find the Admin
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found",
      });
    }

    // 4. Update Fields (Only if provided)
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phoneno) admin.phoneno = phoneno;
    if (dob) admin.dob = dob;
    if (age) admin.age = age;
    if (gender) admin.gender = gender;
    if (address) admin.address = address;
    if (about) admin.about = about;

    // 5. Save updates
    await admin.save();

    // 6. Return response
    // Remove sensitive data before sending back
    admin.password = undefined;
    admin.token = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: admin, // This data updates Redux/LocalStorage
    });

  } catch (error) {
    console.error("UPDATE_ADMIN_PROFILE_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};


















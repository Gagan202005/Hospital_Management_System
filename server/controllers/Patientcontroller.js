const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP")
const otpGenerator = require("otp-generator");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const {instance} = require("../config/razorpay");
const crypto = require("crypto");
const Report = require("../models/Medicalrecord")
require("dotenv").config();
const {uploadImageToCloudinary} = require("../utils/imageUploader");
// Signup Controller for Registering USers

exports.signup = async (req, res) => {
	try {
		// Destructure fields from the request body
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			otp,
			phone,

		} = req.body;
		// Check if All Details are there or not
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword ||
			!otp ||
			!phone
		) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
		}
		// Check if password and confirm password match
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message:
					"Password and Confirm Password do not match. Please try again.",
			});
		}

		// Check if user already exists
		const existingUser = await Patient.findOne({ email });
		if (existingUser) {
			return res.status(401).json({
				success: false,
				message: "User already exists. Please login in to continue.",
			});
		}

		// Find the most recent OTP for the email
		const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		console.log(otp);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await Patient.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstName} ${lastName}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300,ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4&backgroundType=solid,gradientLinear&backgroundRotation=0,360,-350,-340,-330,-320&fontFamily=Arial&fontWeight=600`,
			phoneno : phone,
		});

		return res.status(200).json({
			success: true,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};





exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;

		// Check if user is already present
		// Find user with provided email
		const user = await Patient.findOne({ email });
		// to be used in case of signup

		// If user found with provided email
		if (user) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is Already Registered`,
			});
		}

		var otp = otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
		});
		const result = await OTP.findOne({ otp: otp });
		console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
			result = await OTP.findOne({ otp: otp });
		}
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);

		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({ success: false, error: error.message });
	}
};



exports.capturePayment = async (req, res) => {
    const {doctor,amount} = req.body;
    //validation
    try{
        if(doctor) {
            return res.json({
                success:false,
                message:'Please provide valid doctor',
            })
        };
        const options = {
            totalamount: amount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString(),
        };

        try{
            //initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log("payment",paymentResponse);
            //return response
            return res.status(200).json({
                success:true,
                orderId: paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });
        }
        catch(error) {
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    
};



//verify the signature
exports.verifySignature = async (req, res) => {
    //get the payment details
    const {razorpay_payment_id, razorpay_order_id, razorpay_signature} = req.body;
    const {user_id} = req.user.id;
    const {doc_id,disease,time,date} = req.body;
    if(disease && time && date && !doc_id && !user_id){
        return res.status(401).json({
            success:false,
            message:'all fields are required',
        });
    }
    if(!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
            success:false,
            message:'Payment details are incomplete',
        });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const make_appointment = async (user_id,doc_id,disease,date,time) => {
                try{
                    const appointment = await Appointment.create({
                        patient : user_id,
                        doctor : doc_id,
                        time,
                        date,
                        disease,
                    });
                    const user = await Patient.findById({user_id});
                    user.myappointments.push({appointment});
                    const doctor = await Doctor.findById({doc_id});
                    doctor.myappointments.push({appointment});
                    return res.status(200).json({
                        success:true,
                        message:'Payment successful',
                    });
                }
                catch(error) {
                    console.error(error);
                    return res.status(500).json({
                        success:false,
                        message:error.message,
                    });
                }
            
        }

    try{
        //verify the signature
        const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET).update(body.toString()).digest("hex");
        if(generatedSignature === razorpay_signature) {
            await make_appointment(user_id, doc_id,disease,date,time);
        }

    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }

}


exports.getallreports = async (req,res) => {
    try{
        const {patientID} = req.user._id;
        if(!patientID){
            return res.status(500).json({
                success:false,
                message:"patient id is missing",
            });
        }
        const reports = await Report.find({patient:patientID}).populate("doctor");
        return res.status(200).json({
            success:true,
            message:"data fetched successfully",
            reports,
        });
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.editprofile = async (req, res) => {
	try {
		const { firstName,lastName,DOB,gender,phoneno,address,bloodgroup,emergencyContactName,emergencyContactPhone} = req.body;
		const id = req.user.id;
		
		// Find the profile by id
		const profile = await Patient.findById(id);

		// Update the profile fields
		profile.firstName = firstName;
		profile.lastName = lastName;
		profile.DOB = DOB;
		profile.gender=gender;
		profile.phoneno = phoneno;
		profile.address = address ;
		profile.bloodgroup = bloodgroup ;
		profile.emergencyContactName = emergencyContactName;
		profile.emergencyContactPhone=emergencyContactPhone;

		// Save the updated profile
		await profile.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};
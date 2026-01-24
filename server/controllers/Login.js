const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 
const mailSender = require("../utils/mailSender");
exports.login = async(req,res) =>{
    try{
        const {email,password,accountType} = req.body;
        if(!email || !password || !accountType){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            });
        }
        let user;
        if(accountType==="Doctor"){user = await Doctor.findOne({email});}
        if(accountType==="Patient"){user = await Patient.findOne({email});}
        if(accountType==="Admin"){user = await Admin.findOne({email});}
        if(!user){
            return res.status(400).json({
                success:false,
                message:"you are not registered with us",
            });
        }
        if(await bcrypt.compare(password,user.password)){
            const token = jwt.sign(
                { email: user.email, id: user._id, accountType: user.accountType },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h"
                },
            );
            user.token=token;
            user.password=undefined;
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            });
        }
        else{
            return res.status(400).json({
                success:false,
                message:"password is wrong",
            });
        }

    }
    catch(err){
        return res.status(400).json({
                success:false,
                message:err.message,
            });
    }
}


exports.getalluserdetails = async (req,res) => {
    try{
        const user_id = req.user._id;
        const accountType = req.user.accountType;
        let details;
        if(accountType==="Patient"){
            details = await Patient.findById({_id : user_id}).populate({
            path : "myappointments",
            populate :{
                path : "doctor",
            }
        }).populate({
            path : "reports",
            populate : {
                path : "doctor",
            }
        }).populate("bed");
    };
    if(accountType==="Doctor"){
            details = await Doctor.findById({_id : user_id}).populate({
            path : "myappointments",
            populate :{
                path : "patient",
            }
        }).populate({
            path : "reports",
            populate : {
                path : "patient",
            }
        });
    };
    if(accountType==="Admin"){details = await Admin.findById({_id : user_id});};
    if(!details){
        return res.status(400).json({
            success:false,
            message:"you are not registered with us",
        });
    }
    return res.status(200).json({
            success:true,
            message:"details fetched successfully",
            details,
        });
    }
    catch(err){
        return res.status(400).json({
            success:false,
            message:err.message,
        });
    }
}


exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const { id, accountType } = req.user;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New passwords do not match" });
        }

        let UserModel;
        if (accountType === "Patient") UserModel = Patient;
        else if (accountType === "Doctor") UserModel = Doctor;
        else UserModel = Admin;

        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect current password" });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Optional email
        try {
            await mailSender(user.email, "Security Update", "<p>Your password has been changed.</p>");
        } catch (e) { console.error("Mail error", e); }

        return res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
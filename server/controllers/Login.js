const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");
const MedicalRecord = require("../models/Medicalrecord"); // Imported to fetch reports separately
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require("../utils/tokenService");
require("dotenv").config();


// =================================================================
// LOGIN CONTROLLER
// =================================================================
exports.login = async (req, res) => {
    try {
        const { email, password, accountType } = req.body;
        
        // Basic validation
        if (!email || !password || !accountType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Check which collection to search based on user type
        let user;
        if (accountType === "Doctor") { user = await Doctor.findOne({ email }); }
        if (accountType === "Patient") { user = await Patient.findOne({ email }); }
        if (accountType === "Admin") { user = await Admin.findOne({ email }); }

        // If no user found in that collection
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "You are not registered with us",
            });
        }

        // Password Check
        if (await bcrypt.compare(password, user.password)) {
            
            // Create short-lived access token (JWT — 15 min)
            const accessToken = generateAccessToken({
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            });

            // Create long-lived refresh token (UUID — stored in Redis, 7 days)
            const refreshToken = await generateRefreshToken(
                user._id.toString(),
                user.accountType
            );

            // Hide password before sending user data to frontend
            user.password = undefined;

            // Set refresh token in httpOnly cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: "/",
            });

            res.status(200).json({
                success: true,
                accessToken,
                user,
                message: `User Login Success`,
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Password is wrong",
            });
        }

    }
    catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}


// =================================================================
// REFRESH ACCESS TOKEN
// =================================================================
exports.refreshAccessToken = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token provided",
            });
        }

        // Look up the refresh token in Redis
        const tokenData = await verifyRefreshToken(oldRefreshToken);

        if (!tokenData) {
            // Token expired or doesn't exist — clear the cookie
            res.clearCookie("refreshToken", { path: "/" });
            return res.status(401).json({
                success: false,
                message: "Refresh token expired or invalid. Please login again.",
            });
        }

        const { userId, accountType } = tokenData;

        // TOKEN ROTATION: Delete old refresh token, issue a new one
        await revokeRefreshToken(oldRefreshToken);

        // Generate new access token
        const newAccessToken = generateAccessToken({
            id: userId,
            accountType,
        });

        // Generate new refresh token
        const newRefreshToken = await generateRefreshToken(userId, accountType);

        // Set new refresh token cookie
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
            message: "Token refreshed successfully",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


// =================================================================
// LOGOUT
// =================================================================
exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        // Revoke the refresh token from Redis (if it exists)
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }

        // Clear the cookie
        res.clearCookie("refreshToken", { path: "/" });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


// =================================================================
// CHANGE PASSWORD
// =================================================================
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const id = req.user.id; 
        const accountType = req.user.accountType;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New passwords do not match" });
        }

        // Select the correct collection
        let UserModel;
        if (accountType === "Patient") UserModel = Patient;
        else if (accountType === "Doctor") UserModel = Doctor;
        else UserModel = Admin;

        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Verify the old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Incorrect current password" });

        // Hash and save the new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        // Revoke current refresh token so other sessions are logged out
        const currentRefreshToken = req.cookies.refreshToken;
        if (currentRefreshToken) {
            await revokeRefreshToken(currentRefreshToken);
        }

        // Send a notification email
        try {
            await mailSender(user.email, "Security Update", "<p>Your password has been changed.</p>");
        } catch (e) { console.error("Mail error", e); }

        return res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// =================================================================
// FETCH USER DETAILS (Profile + Appointments + Reports)
// =================================================================
exports.getalluserdetails = async (req, res) => {
    try {
        // We get _id from req.user because your auth middleware attaches the full user document
        const user_id = req.user.id; 
        const accountType = req.user.accountType;
        
        let userProfile = null;
        let medicalHistory = []; // We will store reports here

        // --- PATIENT LOGIC ---
        if (accountType === "Patient") {
            // 1. Fetch the Patient Profile & Appointments
            // We use 'populate' to replace the appointment IDs with actual Appointment data
            userProfile = await Patient.findById(user_id)
                .populate({
                    path: "myAppointments", // This must match the field name in your Patient Schema
                    populate: {
                        path: "doctor", // Inside the appointment, populate the doctor's details
                        select: "firstName lastName department image" // Only pick these fields
                    }
                })
                .populate("bed"); // If they are admitted, show bed details

            // 2. Fetch Medical Reports
            // Reports are stored in the 'MedicalRecord' collection, not inside the Patient document.
            // So we perform a separate search to find all records belonging to this patient.
            medicalHistory = await MedicalRecord.find({ patient: user_id })
                .populate("doctor", "firstName lastName")
                .sort({ createdAt: -1 });
        }

        // --- DOCTOR LOGIC ---
        if (accountType === "Doctor") {
            // 1. Fetch Doctor Profile & Appointments
            userProfile = await Doctor.findById(user_id)
                .populate({
                    path: "myAppointments", 
                    populate: {
                        path: "patient", // Inside the appointment, populate the patient's details
                        select: "firstName lastName image"
                    }
                });

            // 2. Fetch Reports created by this doctor
            // We search for records where the 'doctor' field matches this user's ID
            medicalHistory = await MedicalRecord.find({ doctor: user_id })
                .populate("patient", "firstName lastName")
                .sort({ createdAt: -1 });
        }

        // --- ADMIN LOGIC ---
        if (accountType === "Admin") {
            userProfile = await Admin.findById(user_id);
        }

        // Safety check
        if (!userProfile) {
            return res.status(400).json({
                success: false,
                message: "User details not found",
            });
        }

        // Combine the Profile and Reports into one response object
        // We use .toObject() to convert the Mongoose document to a plain JavaScript object
        // This allows us to attach the new 'reports' property to it.
        const finalResponse = userProfile.toObject ? userProfile.toObject() : userProfile;
        finalResponse.reports = medicalHistory;

        return res.status(200).json({
            success: true,
            message: "Details fetched successfully",
            details: finalResponse,
        });

    } catch (err) {
        console.error("Fetch Details Error:", err);
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}
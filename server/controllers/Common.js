const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mailSender = require("../utils/mailSender"); // ✅ CORRECT
require("dotenv").config();


// =============================================
// UPDATE DISPLAY PICTURE
// =============================================
exports.updateDisplayPicture = async (req, res) => {
    try {
        const id = req.user.id;
        const accountType = req.user.accountType;

        // 1. Determine Model
        let UserModel;
        if (accountType === "Patient") UserModel = Patient;
        else if (accountType === "Doctor") UserModel = Doctor;
        else if (accountType === "Admin") UserModel = Admin;
        else return res.status(400).json({ success: false, message: "Invalid Account Type" });

        // 2. Check File
        const image = req.files?.pfp;
        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        // 3. Upload to Cloudinary
        const uploadDetails = await uploadImageToCloudinary(
            image,
            process.env.FOLDER_NAME
        );

        // 4. Update User Document
        const updatedUser = await UserModel.findByIdAndUpdate(
            { _id: id },
            { image: uploadDetails.secure_url },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data: updatedUser, // Frontend expects response.data.data.image
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update image",
            error: error.message,
        });
    }
};


// =============================================
// UNIFIED CHANGE PASSWORD
// =============================================
exports.changePassword = async (req, res) => {
    try {
        // 1. Get Data
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const { id, accountType } = req.user; // Extracted from Auth Middleware

        // 2. Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: "New passwords do not match" });
        }

        // 3. Select Correct Model
        let UserModel;
        if (accountType === "Patient") UserModel = Patient;
        else if (accountType === "Doctor") UserModel = Doctor;
        else if (accountType === "Admin") UserModel = Admin; // Or whatever your Admin model is
        else return res.status(400).json({ success: false, message: "Invalid Account Type" });

        // 4. Find User
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 5. Verify Old Password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

        // 6. Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // 7. Send Notification
        try {
            await mailSender(
                user.email,
                "Security Update",
                `<p>Your password for <strong>City Care Hospital</strong> has been changed successfully.</p>`
            );
        } catch (mailError) {
            console.error("Mail Error:", mailError);
        }

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to change password. Please try again.",
        });
    }
};


exports.contactUs = async (req, res) => {
  const { name, email, phone, department, subject, message } = req.body;

  try {
    // 1. Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // 2. Email Body for Hospital Admin (Notification)
    const adminEmailBody = `
      <div style="font-family: sans-serif; font-size: 14px;">
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Department:</strong> ${department || "General"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      </div>
    `;

    // 3. Email Body for User (Confirmation)
    const userEmailBody = `
      <div style="font-family: sans-serif; font-size: 14px;">
        <h2>Thank You for Contacting MediCare</h2>
        <p>Dear ${name},</p>
        <p>We have received your message regarding "<strong>${subject}</strong>".</p>
        <p>Our ${department ? department + " " : ""}team will review your inquiry and get back to you within 24 hours.</p>
        <br/>
        <p>Best Regards,</p>
        <p>MediCare Hospital Support Team</p>
      </div>
    `;

    // 4. Send Emails (Run in parallel for speed)
    // Send to Admin (Your support email)
    const adminMail = mailSender(
      process.env.MAIL_USER, // Admin/Support Email
      `New Inquiry: ${subject}`,
      adminEmailBody
    );

    // Send to User
    const userMail = mailSender(
      email,
      "We received your message | MediCare Hospital",
      userEmailBody
    );

    await Promise.all([adminMail, userMail]);

    // 5. Success Response
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("CONTACT_US_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the message",
      error: error.message,
    });
  }
};
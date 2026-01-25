const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");

// Utilities
const { uploadImageToCloudinary } = require("../utils/FileUploader");
const mailSender = require("../utils/mailSender");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();


// =================================================================
// 1. PROFILE MANAGEMENT: UPDATE DISPLAY PICTURE
// =================================================================
/**
 * Updates the profile picture for any user type (Patient, Doctor, Admin).
 * Handles the logic dynamically based on req.user.accountType.
 */
exports.updateDisplayPicture = async (req, res) => {
    try {
        const id = req.user.id;
        const accountType = req.user.accountType;

        // 1. Determine which Database Model to use
        let UserModel;
        if (accountType === "Patient") UserModel = Patient;
        else if (accountType === "Doctor") UserModel = Doctor;
        else if (accountType === "Admin") UserModel = Admin;
        else {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Account Type" 
            });
        }

        // 2. Validate File Input
        const image = req.files?.pfp; // Expecting key 'pfp'
        if (!image) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        // 3. Upload to Cloudinary
        // Folder name comes from .env to separate Prod/Dev files
        const uploadDetails = await uploadImageToCloudinary(
            image,
            process.env.FOLDER_NAME
        );

        // 4. Update User Document
        const updatedUser = await UserModel.findByIdAndUpdate(
            { _id: id },
            { image: uploadDetails.secure_url },
            { new: true } // Return the updated document
        );

        return res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data: updatedUser,
        });

    } catch (error) {
        console.error("UPDATE_PFP_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update image",
            error: error.message,
        });
    }
};


// =================================================================
// 2. COMMUNICATION: CONTACT US FORM
// =================================================================
/**
 * Handles the "Contact Us" form submission.
 * Sends two emails:
 * 1. Notification to Hospital Admin.
 * 2. Acknowledgement to the User.
 */
exports.contactUs = async (req, res) => {
  const { name, email, phone, department, subject, message } = req.body;

  try {
    // 1. Input Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // 2. Prepare Admin Email (Notification)
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
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">
          ${message}
        </blockquote>
      </div>
    `;

    // 3. Prepare User Email (Auto-Reply)
    const userEmailBody = `
      <div style="font-family: sans-serif; font-size: 14px;">
        <h2>Thank You for Contacting MediCare</h2>
        <p>Dear ${name},</p>
        <p>We have received your message regarding "<strong>${subject}</strong>".</p>
        <p>Our ${department ? department + " " : ""}team will review your inquiry and get back to you within 24 hours.</p>
        <br/>
        <p>Best Regards,</p>
        <p><strong>MediCare Hospital Support Team</strong></p>
      </div>
    `;

    // 4. Send Emails in Parallel (Optimization)
    const adminMailPromise = mailSender(
      process.env.MAIL_USER, 
      `New Inquiry: ${subject}`,
      adminEmailBody
    );

    const userMailPromise = mailSender(
      email,
      "We received your message | MediCare Hospital",
      userEmailBody
    );

    await Promise.all([adminMailPromise, userMailPromise]);

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


// =================================================================
// 3. AI SERVICES: GEMINI CHATBOT
// =================================================================

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Handles AI Chat queries. 
 * Includes System Prompts to restrict the AI to medical/hospital contexts only.
 */
exports.getGeminiResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // Initialize Model (Flash is faster and cheaper for chat)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- SYSTEM CONTEXT & RULES ---
    const systemInstruction = `
      You are the helpful AI Assistant for "MediCare Hospital".
      
      ### YOUR KNOWLEDGE BASE (Website Routes):
      - **Home:** "/" (General info)
      - **Find Doctor:** "/find-doctor" (Book appointments)
      - **About Us:** "/about" (History & mission)
      - **Contact:** "/contact" (Support & location)
      - **Login:** "/login"
      - **Sign Up:** "/signup"
      - **AI Chat:** "/ai-chat"

      ### YOUR RULES:
      1. **Topic Restriction:** You are strictly limited to **health, wellness, symptoms, and hospital-related** queries. 
         - If a user asks about unrelated topics (coding, math, movies, politics), politely refuse: "I'm sorry, I can only assist with health and hospital-related questions."
      
      2. **Medical Advice Strategy:**
         - You **CAN** suggest general, well-known home remedies and OTC (Over-the-Counter) suggestions for common issues.
         - Be helpful, warm, and empathetic. Do not sound robotic.
      
      3. **MANDATORY SAFETY DISCLAIMER:**
         - If the user mentions *any* symptom or medical condition, you **MUST** end your response with this exact line:
         > *"Please note: I am an AI. For a proper diagnosis and prescription, please consult our doctors at /find-doctor Page."*

      ### USER QUERY:
      "${prompt}"
    `;

    // Generate Content
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      success: true,
      data: text,
    });

  } catch (error) {
    console.error("GEMINI API ERROR:", error);

    // Handle Rate Limits gracefully (HTTP 429)
    if (error.response?.status === 429 || error.status === 429) {
      return res.status(429).json({
        success: false,
        message: "I'm a bit busy right now. Please try again in 30 seconds.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "AI Service Unavailable.",
      error: error.message,
    });
  }
};
const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const TimeSlot = require("../models/Slot");

exports.updateDoctorProfile = async (req, res) => {
  try {
    // 1. Get Doctor ID from authenticated request (Middleware)
    // We assume your auth middleware puts the doctor's _id into req.user.id
    const doctorId = req.user.id;

    // 2. Get data from body
    const {
      firstName,
      lastName,
      phoneno,    // Matches schema field 'phoneno'
      dob,
      age,
      gender,
      bloodGroup,
      address,
      department,
      specialization,
      experience,
      consultationFee,
      about,
      qualification // Expected to be an array of objects
    } = req.body;

    // 3. Find the Doctor by ID
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // 4. Update Fields
    // We update fields only if they are provided in the request body.
    // This allows partial updates (e.g., updating just the fee).
    
    if (firstName) doctor.firstName = firstName;
    if (lastName) doctor.lastName = lastName;
    if (phoneno) doctor.phoneno = phoneno;
    if (dob) doctor.dob = dob;
    if (age) doctor.age = age;
    if (gender) doctor.gender = gender;
    if (bloodGroup) doctor.bloodGroup = bloodGroup;
    if (address) doctor.address = address;
    
    if (department) doctor.department = department;
    if (specialization) doctor.specialization = specialization;
    if (experience) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (about) doctor.about = about;

    // Update Qualifications
    // If sent, we replace the entire array. Ensure frontend sends the full list.
    if (qualification && Array.isArray(qualification)) {
      doctor.qualification = qualification;
    }

    // 5. Save the updated document
    await doctor.save();

    // 6. Return Response
    // We return the updated doctor object so Redux can update the UI immediately
    
    // Safety: Exclude password/token from response
    doctor.password = undefined;
    doctor.token = undefined;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: doctor, // The updated doctor object
    });

  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};


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


// --- CREATE TIME SLOT ---
exports.createTimeSlot = async (req, res) => {
  try {
    // 1. Get data from body
    // Note: We ignore 'token' here because Middleware should handle authentication
    const { date, startTime, endTime } = req.body;

    // 2. Get Doctor ID from the authenticated user (Middleware)
    const doctorId = req.user.id; 

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All fields (date, startTime, endTime) are required",
      });
    }

    // 3. Create the slot
    // The Schema's pre('save') hook will automatically check for overlaps!
    const newSlot = await TimeSlot.create({
      doctorId,
      date,
      startTime,
      endTime,
      isBooked: false,
    });

    return res.status(200).json({
      success: true,
      message: "Time slot created successfully",
      data: newSlot,
    });

  } catch (error) {
    console.error("CREATE_SLOT_ERROR:", error);

    // Check if the error is the Overlap Error thrown by our Schema
    if (error.message.includes("overlaps")) {
      return res.status(409).json({ // 409 Conflict
        success: false,
        message: "This time slot overlaps with an existing slot.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create time slot",
      error: error.message,
    });
  }
};

// --- GET TIME SLOTS ---
exports.getTimeSlots = async (req, res) => {
  try {
    const doctorId = req.user.id; // From Middleware

    // Fetch slots and sort by Date (ascending) then Start Time (ascending)
    const slots = await TimeSlot.find({ doctorId })
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      data: slots,
    });

  } catch (error) {
    console.error("GET_SLOTS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch time slots",
      error: error.message,
    });
  }
};

// --- DELETE TIME SLOT ---
exports.deleteTimeSlot = async (req, res) => {
  try {
    // We expect the ID to be passed in the Body or Params
    // Based on your frontend code, you likely need to send it in the body 
    // OR append it to the URL. I will support receiving it via body for this example.
    const { slotId } = req.body; 

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: "Slot ID is required",
      });
    }

    // Find and delete, ensuring the slot belongs to this doctor
    const deletedSlot = await TimeSlot.findOneAndDelete({
      _id: slotId,
      doctorId: req.user.id, // Security: Prevent deleting other doctors' slots
    });

    if (!deletedSlot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found or you are not authorized to delete it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Time slot deleted successfully",
    });

  } catch (error) {
    console.error("DELETE_SLOT_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete time slot",
      error: error.message,
    });
  }
};
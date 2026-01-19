const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
	try {

	const id = req.user.id;
	const accountType = req.user.accountType;

	const UserModel = accountType === "Patient" ? Patient : accountType === "Doctor" ? Doctor : Admin;
	const user = await UserModel.findById(id);
    console.log(req.user.accountType);
	if (!user) {
		return res.status(404).json({
            success: false,
            message: "User not found",
        });
	}
	const image = req.files.pfp;
	if (!image) {
		return res.status(404).json({
            success: false,
            message: "Image not found",
        });
    }
	const uploadDetails = await uploadImageToCloudinary(
		image,
		process.env.FOLDER_NAME
	);
	// console.log(uploadDetails);

	const updatedImage = await UserModel.findByIdAndUpdate(
		{ _id: id },
		{ image: uploadDetails.secure_url },
		{ new: true }
	);

    res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
    });
		
	} catch (error) {
		return res.status(500).json({
            success: false,
            message: error.message,
        });
		
	}
}

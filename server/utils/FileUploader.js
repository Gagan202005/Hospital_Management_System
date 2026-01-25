const cloudinary = require("cloudinary").v2;

/**
 * Upload any file to Cloudinary (Images + Documents like PDF/DOCX)
 * * @param {Object} file - The file object from express-fileupload
 * @param {String} folder - Cloudinary folder name
 * @param {Number} height - (Optional) Resize height for images
 * @param {Number} quality - (Optional) Compression quality for images
 */
exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    // =================================================================
    // 1. INPUT VALIDATION
    // =================================================================
    if (!file || !file.tempFilePath) {
        throw new Error("File not found or tempFilePath missing");
    }

    // =================================================================
    // 2. BASE CONFIGURATION
    // =================================================================
    const options = {
        folder: folder || "uploads",
        resource_type: "auto", // ✅ Crucial: Auto-detects image vs. raw (PDF/Doc) vs. video
        use_filename: true,
        unique_filename: true,
        overwrite: false,
    };

    // =================================================================
    // 3. IMAGE-SPECIFIC TRANSFORMATIONS
    // =================================================================
    // Cloudinary throws errors if you try to resize/compress non-image files (like PDFs).
    // We strictly apply these options only if the mime type indicates an image.
    const isImage = file.mimetype?.startsWith("image/");
    
    if (isImage) {
        if (height) {
            options.height = height;
        }
        if (quality) {
            options.quality = quality;
        }
        options.crop = "limit"; // Maintains aspect ratio
    }

    // =================================================================
    // 4. EXECUTE UPLOAD
    // =================================================================
    return await cloudinary.uploader.upload(file.tempFilePath, options);
};
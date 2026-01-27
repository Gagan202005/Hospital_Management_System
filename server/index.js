const express = require("express");
const app = express();

// =================================================================
// IMPORTS
// =================================================================
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// Config & Utilities
const database = require("./config/database");
const { cloudinaryconnect } = require("./config/cloudinary");

// Routes
const AuthRoutes = require("./routes/Auth_routes");
const PatientRoutes = require("./routes/Patient_routes");
const DoctorRoutes = require("./routes/Doctor_routes");
const AdminRoutes = require("./routes/Admin_routes");
const medicalRecordRoutes = require("./routes/Report_routes");

// =================================================================
// CONFIGURATION
// =================================================================
dotenv.config();

const PORT = process.env.PORT || 5000;

// DB & Cloudinary
database.connect();
cloudinaryconnect();

// =================================================================
// MIDDLEWARE (ORDER MATTERS)
// =================================================================

// Parse JSON
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// ✅ FINAL CORS SETUP (NO CRASH, NO BUGS)
const allowedOrigin = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: allowedOrigin, // MUST be a real URL, not "*"
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// File uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// =================================================================
// ROUTES
// =================================================================

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/Patient", PatientRoutes);
app.use("/api/v1/Doctor", DoctorRoutes);
app.use("/api/v1/Admin", AdminRoutes);
app.use("/api/v1/medical-record", medicalRecordRoutes);

// =================================================================
// ROOT & SERVER START
// =================================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Hospital Management API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

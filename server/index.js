const express = require("express");
const app = express();

// =================================================================
// IMPORTS
// =================================================================
// 1. Standard Libraries & Third-Party Modules
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// 2. Configuration & Utilities
const database = require("./config/database");
const { cloudinaryconnect } = require("./config/cloudinary");

// 3. Route Handlers
const AuthRoutes = require("./routes/Auth_routes");
const PatientRoutes = require("./routes/Patient_routes");
const DoctorRoutes = require("./routes/Doctor_routes");
const AdminRoutes = require("./routes/Admin_routes");
const medicalRecordRoutes = require("./routes/Report_routes");


// =================================================================
// CONFIGURATION
// =================================================================
// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
database.connect();

// Connect to Cloudinary (for image uploads)
cloudinaryconnect();


// =================================================================
// MIDDLEWARE
// =================================================================
// Parse JSON bodies
app.use(express.json());

// Parse Cookies
app.use(cookieParser());

// CORS Configuration (Cross-Origin Resource Sharing)
// Allows frontend at specific URLs to talk to this backend
const whitelist = process.env.CORS_ORIGIN
  ? JSON.parse(process.env.CORS_ORIGIN) // e.g., ["http://localhost:3000"]
  : ["*"]; // Fallback (Not recommended for production)

app.use(
  cors({
    origin: whitelist, 
    credentials: true, // Allow cookies to be sent
    maxAge: 14400, // Cache preflight response for 4 hours
  })
);

// File Upload Middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);


// =================================================================
// API ROUTES
// =================================================================
// Base URL: http://localhost:5000/api/v1/...

app.use("/api/v1/auth", AuthRoutes);           // Login, Signup, OTP
app.use("/api/v1/Patient", PatientRoutes);     // Patient Profile & Ops
app.use("/api/v1/Doctor", DoctorRoutes);       // Doctor Profile & Ops
app.use("/api/v1/Admin", AdminRoutes);         // Admin Dashboard Ops
app.use("/api/v1/medical-record", medicalRecordRoutes); // Clinical Records


// =================================================================
// ROOT & SERVER START
// =================================================================

// Default Route (Health Check)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Hospital Management API",
  });
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
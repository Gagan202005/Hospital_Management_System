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

// Connect to Cloudinary
cloudinaryconnect();

// =================================================================
// MIDDLEWARE (ORDER MATTERS)
// =================================================================

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// ✅ CORS CONFIGURATION (FIXED & SAFE)
const allowedOrigin = process.env.CORS_ORIGIN || "*";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 14400, // cache preflight for 4 hours
  })
);

// Handle preflight requests
app.options("*", cors());

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// =================================================================
// API ROUTES
// =================================================================

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/Patient", PatientRoutes);
app.use("/api/v1/Doctor", DoctorRoutes);
app.use("/api/v1/Admin", AdminRoutes);
app.use("/api/v1/medical-record", medicalRecordRoutes);

// =================================================================
// ROOT & SERVER START
// =================================================================

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Hospital Management API",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

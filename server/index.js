const express = require("express");

const app = express();

const PatientRoutes = require("./routes/Patient_routes");
const AdminRoutes = require("./routes/Admin_routes");
const AuthRoutes = require("./routes/Auth_routes");
const DoctorRoutes = require("./routes/Doctor_routes");
const AppointmentRoutes = require("./routes/Appointment_routes");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const { cloudinaryconnect } = require("./config/cloudinary");

const dotenv = require("dotenv");
dotenv.config(); // Loads .env file contents into process.env

const PORT = process.env.PORT || 5000;
database.connect();

app.use(express.json());
app.use(cookieParser());

const whitelist = process.env.CORS_ORIGIN
  ? JSON.parse(process.env.CORS_ORIGIN)
  : ["*"];

app.use(
  cors({
    origin: whitelist,// Allow only requests from this origin
    credentials: true,
    maxAge: 14400,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudinaryconnect();

app.use("/api/v1/Patient", PatientRoutes);

app.use("/api/v1/Admin", AdminRoutes);

app.use("/api/v1/auth", AuthRoutes);

app.use("/api/v1/Doctor", DoctorRoutes);

app.use("/api/v1/appointment", AppointmentRoutes);


app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

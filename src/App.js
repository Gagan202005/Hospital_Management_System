import './App.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { setToken } from './Slices/authslice';
import { setUser } from './Slices/profileslice';
import { axiosInstance } from './services/apiConnector';

// Components
import OpenRoute from './Components/Common/Openroute.jsx';
import PrivateRoute from './Components/Common/Privateroute.jsx';
import { Toaster } from './Components/ui/toaster';
import ScrollToTop from './Components/Common/ScrollToTop.jsx';

// Pages
import Home from "./Pages/Home";
import Login from "./Pages/Login.jsx"
import Signup from './Pages/Signup.jsx';
import Verify_email from './Pages/Verify-email.jsx';
import FindDoctor from './Pages/FindDoctor.jsx';
import About from './Pages/About.jsx';
import Contact from './Pages/Contact.jsx';
import AiChat from "./Pages/AI_Help.jsx";

// Dashboards
import DoctorDashboard from './Pages/DoctorDashboard';
import PatientDashboard from './Pages/PatientDashboard';
import AdminDashboard from './Pages/AdminDashboard';

// Sub-Sections (Find Doctor)
import DoctorProfile from './Components/Core/FindDoctor/DoctorProfile.jsx';
import BookAppointment from './Components/Core/FindDoctor/BookAppointmentSection.jsx';

// Admin Sections
import { AddPatientSection } from "./Components/Core/Admin/AddPatientSection.jsx";
import { AddDoctorSection } from "./Components/Core/Admin/AddDoctorSection";
import { AddAmbulanceSection } from "./Components/Core/Admin/AddAmbulanceSection";
import { AddBedSection } from "./Components/Core/Admin/AddBedSection";
import { OverviewSection } from "./Components/Core/Admin/OverviewSection";
import { AddAdminSection } from "./Components/Core/Admin/AddAdminSection.jsx";
import { AdminProfileSection } from "./Components/Core/Admin/AdminProfileSection.jsx";
import { FixAppointment } from "./Components/Core/Admin/FixAppointment.jsx";

// Doctor Sections
import { TimeSlotManager } from "./Components/Core/Doctor/TimeSlotManager";
import AppointmentSection from "./Components/Core/Doctor/AppointmentSection";
import { PatientsSection } from "./Components/Core/Doctor/PatientsSection";
import { DoctorProfileSection } from "./Components/Core/Doctor/DoctorProfileSection";
import DoctorOverview from "./Components/Core/Doctor/Overview";

// Patient Sections
import PatientAppointmentsSection from "./Components/Core/Patient/PatientAppointmentSection";
import PatientProfileSection from "./Components/Core/Patient/PatientProfileSection";
import PatientOverview from "./Components/Core/Patient/PatientOverview";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- AUTOMATIC TOKEN REFRESH ON EXPIRY ---
  useEffect(() => {
    const checkTokenExpiration = async () => {
      const raw = localStorage.getItem("token");
      if (raw) {
        try {
          // Token is stored via JSON.stringify, so parse it first
          const token = JSON.parse(raw);
          // Decode token to find expiration time (exp is in seconds)
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          // If access token expired, try to silently refresh using the refresh token cookie
          if (decodedToken.exp < currentTime) {
            console.warn("Access token expired. Attempting silent refresh...");
            try {
              const BASE_URL = process.env.REACT_APP_BASE_URL;
              const { data } = await axiosInstance.post(`${BASE_URL}/auth/refresh`);
              const newToken = data.accessToken;

              // Update localStorage and Redux with the fresh access token
              localStorage.setItem("token", JSON.stringify(newToken));
              dispatch(setToken(newToken));
              console.log("Token refreshed successfully.");
            } catch (refreshError) {
              // Refresh token also expired or invalid — force logout
              console.warn("Refresh token invalid. Logging out...");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              dispatch(setToken(null));
              dispatch(setUser(null));
              navigate("/login");
            }
          }
        } catch (error) {
          // If token is malformed/corrupt
          console.error("Invalid token detected.", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch(setToken(null));
          dispatch(setUser(null));
          navigate("/login");
        }
      }
    };

    checkTokenExpiration();
  }, [navigate, dispatch]);

  return (
    <div>
      <ScrollToTop />
      <Routes>
        {/* --- AUTH --- */}
        <Route path="/login" element={<OpenRoute><Login /></OpenRoute>} />
        <Route path="/signup" element={<OpenRoute><Signup /></OpenRoute>} />
        <Route path='/verify-email' element={<Verify_email />} />
        
        {/* --- PUBLIC --- */}
        <Route path="/" element={<Home />} />
        <Route path="/find-doctor" element={<FindDoctor />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/doctor/:id/book" element={<BookAppointment />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ai-chat" element={<AiChat />} />

        {/* --- ADMIN DASHBOARD --- */}
        <Route 
          path="/admin-dashboard" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewSection />} />
          <Route path="appointment" element={<FixAppointment />} />
          <Route path="patients" element={<AddPatientSection />} />
          <Route path="doctors" element={<AddDoctorSection />} />
          <Route path="ambulances" element={<AddAmbulanceSection />} />
          <Route path="beds" element={<AddBedSection />} />
          <Route path="admins" element={<AddAdminSection />} />
          <Route path="profile" element={<AdminProfileSection />} />
        </Route>

        {/* --- DOCTOR DASHBOARD --- */}
        <Route 
          path="/doctor-dashboard" 
          element={
            <PrivateRoute>
              <DoctorDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DoctorOverview />} />
          <Route path="appointments" element={<AppointmentSection />} />
          <Route path="timeslots" element={<TimeSlotManager />} />
          <Route path="patients" element={<PatientsSection />} />
          <Route path="profile" element={<DoctorProfileSection />} />
        </Route>

        {/* --- PATIENT DASHBOARD --- */}
        <Route 
          path="/patient-dashboard" 
          element={
            <PrivateRoute>
              <PatientDashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<PatientOverview />} />
          <Route path="appointments" element={<PatientAppointmentsSection />} />
          <Route path="profile" element={<PatientProfileSection />} />
        </Route>

      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
import './App.css';
import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

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

  // --- AUTOMATIC LOGOUT ON TOKEN EXPIRY ---
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Decode token to find expiration time (exp is in seconds)
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          // If token expired, clear storage and kick user out
          if (decodedToken.exp < currentTime) {
            console.warn("Session expired. Logging out...");
            localStorage.clear();
            navigate("/login");
          }
        } catch (error) {
          // If token is malformed/corrupt
          console.error("Invalid token detected.", error);
          localStorage.clear();
          navigate("/login");
        }
      }
    };

    checkTokenExpiration();
  }, [navigate]);

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
import './App.css';
import OpenRoute from './Components/Common/Openroute.jsx';
import NavBar from './Components/Common/Navbar';
import { setProgress } from "./Slices/loadingbarslice";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Routes,Route } from 'react-router';
import Home from "./Pages/Home";
import Login from "./Pages/Login.jsx"
import Signup from './Pages/Signup.jsx';
import Verify_email from './Pages/Verify-email.jsx';
import PrivateRoute from './Components/Common/Privateroute.jsx';
import DoctorDashboard from './Pages/DoctorDashboard';
import PatientDashboard from './Pages/PatientDashboard';
import AdminDashboard from './Pages/AdminDashboard';
import FindDoctor from './Pages/FindDoctor.jsx';
import DoctorProfile from './Components/Core/FindDoctor/DoctorProfile.jsx';
import BookAppointment from './Components/Core/FindDoctor/BookAppointmentSection.jsx';
import { AddPatientSection } from "./Components/Core/Admin/AddPatientSection.jsx";
import { AddDoctorSection } from "./Components/Core/Admin/AddDoctorSection";
import { AddAmbulanceSection } from "./Components/Core/Admin/AddAmbulanceSection";
import { AddBedSection } from "./Components/Core/Admin/AddBedSection";
import { OverviewSection } from "./Components/Core/Admin/OverviewSection";
import { AddAdminSection } from "./Components/Core/Admin/AddAdminSection.jsx";
import { AdminProfileSection } from "./Components/Core/Admin/AdminProfileSection.jsx";
import { FixAppointment } from "./Components/Core/Admin/FixAppointment.jsx";
import { Toaster } from './Components/ui/toaster';
import { Navigate } from 'react-router';
function App() {
  const user = useSelector((state) => state.profile.user);
  const progress = useSelector((state) => state.loadingBar);
  const dispatch = useDispatch();
  return (
    <div>
      <Routes>
        
        <Route path="/login" element={<OpenRoute>
          <Login />
        </OpenRoute>} />
        <Route path="/" element={
          <>
          <NavBar setProgress={setProgress}></NavBar>
          <Home />
          </>
          } />
        <Route path="/signup" element={<OpenRoute>
          <Signup />
        </OpenRoute>} />
        <Route path='/verify-email' element={<Verify_email/>}></Route>
        <Route path="/doctor-dashboard/*" element={<PrivateRoute><NavBar setProgress={setProgress}></NavBar><DoctorDashboard /></PrivateRoute>} />
        <Route path="/patient-dashboard/*" element={<PrivateRoute><><NavBar setProgress={setProgress}></NavBar><PatientDashboard /></></PrivateRoute>} />
        <Route path="/find-doctor" element={<FindDoctor />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/doctor/:id/book" element={<BookAppointment />} />
        <Route 
  path="/admin-dashboard" 
  element={
    <PrivateRoute>
      <AdminDashboard />
    </PrivateRoute>
  }
>
  {/* Default redirect to 'overview' when opening /admin-dashboard */}
  <Route index element={<Navigate to="overview" replace />} />

  {/* Nested Routes (No slash at start) */}
  <Route path="overview" element={<OverviewSection />} />
  <Route path="appointment" element={<FixAppointment />} />
  <Route path="patients" element={<AddPatientSection />} />
  <Route path="doctors" element={<AddDoctorSection />} />
  <Route path="ambulances" element={<AddAmbulanceSection />} />
  <Route path="beds" element={<AddBedSection />} />
  <Route path="admins" element={<AddAdminSection />} />
  <Route path="profile" element={<AdminProfileSection />} />

</Route>


      </Routes>
      <Toaster />
    </div>
  );
}
export default App;

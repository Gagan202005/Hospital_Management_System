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
import { Toaster } from './Components/ui/toaster';
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
        <Route path="/doctor-dashboard" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
        <Route path="/patient-dashboard/*" element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      </Routes>
      <Toaster />
    </div>
  );
}
export default App;

import { SidebarProvider, SidebarTrigger } from "../Components/ui/sidebar";
import PatientSidebar  from "../Components/Core/Patient/PatientSidebar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import  PatientAppointmentsSection  from "../Components/Core/Patient/PatientAppointmentSection";
import  PatientProfileSection  from "../Components/Core/Patient/PatientProfileSection";
import  PatientReportsSection  from "../Components/Core/Patient/PatientReportsSection";
import PatientOverview from "../Components/Core/Patient/PatientOverview";
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../services/operations/authApi"


const PatientDashboard = () => {
  const location = useLocation();
  
  const { user } = useSelector((state) => state.profile)
  const accountType = user.accountType;
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout(navigate));
  };
  console.log(accountType);
  return (
    <>
    {
        accountType === "Patient" 
        ? <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PatientSidebar  
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6 lg:p-8">
          <div className="lg:hidden mb-4">
            <SidebarTrigger />
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/patient-dashboard/overview" replace />} />
            <Route path="/overview" element={<PatientOverview />} />
            <Route path="/appointments" element={<PatientAppointmentsSection />} />
            <Route path="/reports" element={<PatientReportsSection />} />
            <Route path="/profile" element={<PatientProfileSection />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
    : <Navigate to={"/login"}/>
    }
    </>
  );
};

export default PatientDashboard;
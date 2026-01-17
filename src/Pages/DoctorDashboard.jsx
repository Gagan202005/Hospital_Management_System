// import { SidebarProvider, SidebarTrigger } from "../Components/ui/sidebar";
// import { DoctorSidebar } from "../Components/Core/dashboard/DoctorSidebar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { TimeSlotManager } from "../Components/Core/dashboard/TimeSlotManager";
// import { AppointmentsSection } from "../Components/Core/dashboard/AppointmentsSection";
// import { PatientsSection } from "../Components/Core/dashboard/PatientsSection";
// import { DoctorProfileSection } from "../Components/Core/dashboard/DoctorProfileSection";
// import { PatientReportsGenerator } from "../components/core/dashboard/PatientReportsGenerator";
// import DoctorOverview from "../Components/Core/dashboard/DoctorOverview";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const DoctorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const accountType = useSelector((state) => state.profile.user.accountType);
  const handleLogout = () => {
    // In a real app, this would handle authentication logout
    console.log("Logging out...");
    alert("Logout functionality would be implemented here");
  };

  // Get current section from pathname
  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.includes('/timeslots')) return 'timeslots';
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/patients')) return 'patients';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/profile')) return 'profile';
    return 'overview';
  };

  return (
    <>
    {/* {accountType === "Doctor" ? <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DoctorSidebar 
          activeSection={getCurrentSection()} 
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6 lg:p-8">
          <div className="lg:hidden mb-4">
            <SidebarTrigger />
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/doctor-dashboard/overview" replace />} />
            <Route path="/overview" element={<DoctorOverview />} />
            <Route path="/timeslots" element={<TimeSlotManager />} />
            <Route path="/appointments" element={<AppointmentsSection />} />
            <Route path="/patients" element={<PatientsSection />} />
            <Route path="/reports" element={<PatientReportsGenerator />} />
            <Route path="/profile" element={<DoctorProfileSection />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider> : navigate("./login")
    } */}
    </>
    
  );
};

export default DoctorDashboard;
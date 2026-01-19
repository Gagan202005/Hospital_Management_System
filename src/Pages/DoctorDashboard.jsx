import { SidebarProvider, SidebarTrigger } from "../Components/ui/sidebar";
import { DoctorSidebar } from "../Components/Core/Doctor/DoctorSidebar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TimeSlotManager } from "../Components/Core/Doctor/TimeSlotManager";
import AppointmentSection from "../Components/Core/Doctor/AppointmentSection";
import { PatientsSection } from "../Components/Core/Doctor/PatientsSection";
import { DoctorProfileSection } from "../Components/Core/Doctor/DoctorProfileSection";
import { PatientReportsGenerator } from "../Components/Core/Doctor/PatientReportsGenerator";
import { DoctorStatusManager } from "../Components/Core/Doctor/DoctorStatusManager";
import { PrescriptionManager } from "../Components/Core/Doctor/PrescriptionManager";
import DoctorOverview from "../Components/Core/Doctor/Overview";

const DoctorDashboard = () => {
  const location = useLocation();
  
  const handleLogout = () => {
    console.log("Logging out...");
    // Add your actual logout logic here (e.g., dispatch(logout()))
  };

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.includes('/timeslots')) return 'timeslots';
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/patients')) return 'patients';
    if (path.includes('/prescriptions')) return 'prescriptions';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/status')) return 'status';
    if (path.includes('/profile')) return 'profile';
    return 'overview';
  };

  return (
    <SidebarProvider>
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
            <Route path="/appointments" element={<AppointmentSection />} />
            <Route path="/patients" element={<PatientsSection />} />
            <Route path="/prescriptions" element={<PrescriptionManager />} />
            <Route path="/reports" element={<PatientReportsGenerator />} />
            <Route path="/status" element={<DoctorStatusManager />} />
            <Route path="/profile" element={<DoctorProfileSection />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DoctorDashboard;
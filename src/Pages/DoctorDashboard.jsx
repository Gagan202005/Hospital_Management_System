import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";
import Navbar from "../Components/Common/Navbar.jsx"; 
import HospitalFooter from "../Components/Common/Footer.jsx";
import { Button } from "../Components/ui/button.jsx";
import { 
  Activity, CalendarClock, Clock, Users, UserCog, 
  Menu, X, Stethoscope 
} from "lucide-react";
import { useSelector } from "react-redux";

/**
 * DoctorDashboard Layout
 * ----------------------
 * Primary wrapper for the Doctor's interface.
 * Handles RBAC, responsive navigation, and layout structure.
 */
const DoctorDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useSelector((state) => state.profile);

  // --- Scroll Lock Effect ---
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  // --- RBAC Check ---
  if (user?.accountType !== "Doctor") {
    return <Navigate to="/login" replace />;
  }

  // --- Navigation Config ---
  // Using professional clinical terminology
  const navItems = [
    { path: "overview", label: "Clinical Dashboard", icon: Activity },
    { path: "appointments", label: "Patient Visits", icon: CalendarClock },
    { path: "timeslots", label: "Schedule Management", icon: Clock },
    { path: "patients", label: "Patient Records", icon: Users },
    { path: "profile", label: "Profile & Settings", icon: UserCog },
  ];

  // Helper to get current page title
  const getCurrentLabel = () => {
    const currentItem = navItems.find(item => location.pathname.includes(item.path));
    return currentItem ? currentItem.label : "Doctor Portal";
  };

  const getCurrentIcon = () => {
    const currentItem = navItems.find(item => location.pathname.includes(item.path));
    return currentItem ? currentItem.icon : Activity;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. Global Header */}
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      {/* 2. Main Layout Container */}
      <div className="flex flex-1 pt-14 relative mt-[130px]">
        
        {/* --- DESKTOP SIDEBAR (Sticky) --- */}
        <aside className="hidden md:block w-64 bg-white border-r border-slate-200 sticky h-[calc(100vh-3.5rem)] overflow-y-auto shrink-0 z-30 shadow-sm custom-scrollbar">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Doctor Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">Clinical Management System</p>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "overview"}
                className={({ isActive }) => `
                  flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
              >
                <item.icon className={`w-5 h-5 mr-3 ${location.pathname.includes(item.path) ? "text-blue-600" : "text-slate-400"}`} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col w-full min-w-0">
          
          {/* Mobile Header */}
          <div className="md:hidden sticky top-14 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                {React.createElement(getCurrentIcon(), { className: "w-5 h-5 text-blue-600" })}
                <span className="font-bold text-slate-800">{getCurrentLabel()}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-slate-700" />
            </Button>
          </div>

          {/* Dynamic Page Content */}
          <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* 3. Global Footer */}
      <div className="z-40 relative border-t border-slate-200">
        <HospitalFooter />
      </div>

      {/* --- MOBILE DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b bg-blue-50 flex justify-between items-center">
              <h2 className="font-bold text-lg text-blue-900 flex gap-2"><Activity className="w-5 h-5"/> Navigation</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-blue-700" /></Button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all ${isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
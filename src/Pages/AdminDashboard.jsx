import React, { useState, useEffect } from "react";
// 1. IMPORT ROUTER HOOKS
import { Outlet, NavLink, useLocation } from "react-router-dom"; 
import Navbar from "../Components/Common/Navbar.jsx"; 
import { Button } from "../Components/ui/button.jsx";
import { 
  Users, Truck, Bed, BarChart3, Stethoscope, 
  UserCircle, ShieldAlert, CalendarCheck, Menu, X, LayoutDashboard 
} from "lucide-react";

const AdminDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // To track current URL for the title

  // 2. DEFINE ROUTES (Paths must match your App.js child routes)
  const navItems = [
    { path: "overview", label: "Overview", icon: BarChart3 },
    { path: "appointment", label: "Book Appt.", icon: CalendarCheck },
    { path: "patients", label: "Patients", icon: Users },
    { path: "doctors", label: "Doctors", icon: Stethoscope },
    { path: "ambulances", label: "Fleet", icon: Truck },
    { path: "beds", label: "Bed Management", icon: Bed },
    { path: "admins", label: "Admins", icon: ShieldAlert },
    { path: "profile", label: "Profile", icon: UserCircle },
  ];

  // Helper to get current page title based on URL
  const getCurrentLabel = () => {
    // Matches the current path segment (e.g. /admin/patients -> "patients")
    const currentItem = navItems.find(item => location.pathname.includes(item.path));
    return currentItem ? currentItem.label : "Dashboard";
  };

  const getCurrentIcon = () => {
    const currentItem = navItems.find(item => location.pathname.includes(item.path));
    return currentItem ? currentItem.icon : LayoutDashboard;
  };

  // --- SCROLL LOCK EFFECT ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. FIXED TOP NAVBAR */}
      <div className="fixed top-0 w-full z-[50]">
        <Navbar />
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 pt-16 h-screen overflow-hidden relative mt-[100px]">
        
        {/* =======================================================
            2. DESKTOP SIDEBAR (Hidden on Mobile)
           ======================================================= */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full fixed left-0 top-16 bottom-0 z-40 shadow-sm mt-[120px]">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              Admin Panel
            </h2>
            <p className="text-xs text-slate-500 mt-1">Manage Hospital Resources</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {navItems.map((item) => (
              /* 3. USE NAVLINK INSTEAD OF BUTTON */
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "overview"} // 'end' ensures exact match for root path if needed
                className={({ isActive }) => `
                  flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}
                `}
              >
                {/* Icon Rendering Logic */}
                <item.icon className={`w-5 h-5 mr-3`} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* =======================================================
            3. MAIN CONTENT AREA
           ======================================================= */}
        <main 
          className="flex-1 overflow-y-auto bg-gray-50/50 w-full md:ml-64 transition-all duration-200 mt-[10px]"
        >
          {/* MOBILE HEADER (Visible only on Mobile) */}
          <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                {React.createElement(getCurrentIcon(), { className: "w-5 h-5 text-indigo-600" })}
                <span className="font-bold text-slate-800">
                    {getCurrentLabel()}
                </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6 text-slate-700" />
            </Button>
          </div>

          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Desktop Title (Hidden on Mobile) */}
            <div className="hidden md:block mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
                    {React.createElement(getCurrentIcon(), { className: "w-7 h-7 text-indigo-600" })}
                    {getCurrentLabel()}
                </h1>
                <p className="text-sm text-slate-500 mt-1 ml-9">
                    Hospital Management System &gt; Admin
                </p>
            </div>

            {/* 4. RENDER CHILD ROUTES HERE */}
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <Outlet />
            </div>
          </div>
        </main>

        {/* =======================================================
            4. MOBILE DRAWER OVERLAY
           ======================================================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex md:hidden">
            {/* Dark Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Drawer Content */}
            <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="p-5 border-b flex justify-between items-center bg-indigo-50">
                <h2 className="font-bold text-lg text-indigo-900 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5" /> Menu
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-indigo-100 text-indigo-700 rounded-full">
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)} // Close drawer on click
                    className={({ isActive }) => `
                      flex items-center w-full px-4 py-3 text-base font-medium rounded-xl transition-all
                      ${isActive 
                        ? "bg-indigo-600 text-white shadow-md" 
                        : "text-slate-600 hover:bg-slate-100"}
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              
              <div className="p-4 border-t text-xs text-center text-slate-400">
                  v1.0.0 • Hospital Admin
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
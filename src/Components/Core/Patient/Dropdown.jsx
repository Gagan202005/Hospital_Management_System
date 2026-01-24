import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useOnClickOutside from "../../../hooks/useOnClickOutside";
import { logout } from "../../../services/operations/authApi";

// Icons
import { LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";

export default function ProfileDropdown() {
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useOnClickOutside(ref, () => setOpen(false));

  // Handle Missing User State Safely
  if (!user) return null;

  // Determine Dashboard Route based on Role
  const getDashboardRoute = (type) => {
    switch (type) {
      case "Patient": return "/patient-dashboard/overview";
      case "Doctor": return "/doctor-dashboard/overview";
      case "Admin": return "/admin-dashboard/overview";
      default: return "/";
    }
  };

  const dashboardRoute = getDashboardRoute(user.accountType);

  const handleLogout = (e) => {
    e.preventDefault();
    setOpen(false);
    dispatch(logout(navigate));
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 focus:outline-none group p-1 rounded-full hover:bg-slate-100 transition-all duration-200"
      >
        <Avatar className="h-9 w-9 border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
          <AvatarImage src={user?.image} alt={user?.firstName} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        
        {/* Optional: Show Name on larger screens */}
        <div className="hidden md:block text-left mr-1">
            <p className="text-sm font-semibold text-slate-700 leading-none">{user.firstName}</p>
            <p className="text-[10px] text-slate-500 font-medium">{user.accountType}</p>
        </div>

        <ChevronDown 
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full right-0 mt-2 w-56 z-50 origin-top-right bg-white rounded-xl shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Section */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          {/* Links Section */}
          <div className="py-1">
            <Link 
              to={dashboardRoute} 
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
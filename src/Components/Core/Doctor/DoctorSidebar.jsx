import { 
  BarChart3, 
  Calendar, 
  CalendarDays, 
  Clock, 
  FileText, 
  LogOut, 
  Pill, 
  Settings, 
  Activity, 
  Stethoscope, 
  Users 
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../../ui/sidebar";
import { cn } from "../../../lib/utils";
import { Link, useLocation } from "react-router-dom";

export function DoctorSidebar({ onLogout }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const BASE_PATH = "/doctor-dashboard";

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3, path: `${BASE_PATH}/overview` },
    { id: "timeslots", label: "Time Slots", icon: Clock, path: `${BASE_PATH}/timeslots` },
    { id: "appointments", label: "Appointments", icon: Calendar, path: `${BASE_PATH}/appointments` },
    { id: "patients", label: "Patients", icon: Users, path: `${BASE_PATH}/patients` },
    { id: "profile", label: "Profile", icon: Settings, path: `${BASE_PATH}/profile` },
  ];

  return (
    <Sidebar className={cn(
      "border-r border-slate-200 bg-white mt-[190px] transition-all duration-300 ease-in-out", 
      collapsed ? "w-[80px]" : "w-[280px]"
    )}>
      <SidebarHeader className="h-20 flex items-center justify-center border-b border-slate-300 px-6">
        <div className={cn("flex items-center gap-4 transition-all duration-300", collapsed ? "justify-center" : "w-full")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Stethoscope className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden transition-opacity duration-300">
              <span className="truncate text-lg font-bold tracking-tight text-slate-900">MediCare</span>
              <span className="truncate text-xs font-medium text-slate-500">Doctor Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between p-4">
        <SidebarMenu className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.label}
                  // We disable the default shadcn hover here so we can control it fully in the Link
                  className="h-auto p-0 hover:bg-transparent active:bg-transparent" 
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "group flex h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
                      
                      isActive 
                        // --- ACTIVE STATE ---
                        // We strictly set hover:bg-blue-600 to prevent it from turning gray.
                        // We DO NOT add hover:pl-4 here, so it stays static.
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-600" 
                        
                        // --- INACTIVE STATE ---
                        // Here we apply the gray hover and the padding slide (pl-4).
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:pl-4"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200", 
                        collapsed ? "mx-auto" : "mr-1",
                        // Only bounce the icon if it is NOT active
                        !isActive && "group-hover:scale-110" 
                      )} 
                    />
                    {!collapsed && (
                      <span className="truncate tracking-wide">{item.label}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <div className="mt-auto border-t border-slate-100 pt-6">
          <Button
            onClick={onLogout}
            variant="ghost"
            className={cn(
              "group flex h-11 w-full justify-start gap-3 rounded-lg px-3 transition-all duration-200 hover:bg-red-50 hover:pl-4",
              collapsed ? "justify-center px-0 hover:pl-0" : ""
            )}
          >
            <LogOut className="h-5 w-5 shrink-0 text-slate-500 transition-colors group-hover:text-red-600" />
            {!collapsed && (
              <span className="font-medium text-slate-600 transition-colors group-hover:text-red-700">
                Log Out
              </span>
            )}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
import {LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "../../ui/sidebar";
import { Button } from "../../ui/button";
import { NavLink } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { patientsidebardata } from "../../../Data/sidebarlinks";
export default function PatientSidebar({ onLogout }) {

  return (
    <Sidebar className="w-64 pt-[200px]">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-lg">Patient Portal</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {patientsidebardata.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      "w-full justify-start flex items-center py-2 px-3 rounded-md transition-colors",
                     !isActive && "hover:bg-accent/50 hover:text-accent-foreground",
                      isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          onClick={onLogout}
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
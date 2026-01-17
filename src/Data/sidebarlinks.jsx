import { Calendar, User, FileText, Home } from "lucide-react";
export const patientsidebardata = [
    {
      title: "Dashboard",
      icon: Home,
      section: "overview",
      path: "/patient-dashboard/overview",
    },
    {
      title: "Appointments",
      icon: Calendar,
      section: "appointments",
      path: "/patient-dashboard/appointments",
    },
    {
      title: "Medical Reports",
      icon: FileText,
      section: "reports",
      path: "/patient-dashboard/reports",
    },
    {
      title: "Profile",
      icon: User,
      section: "profile",
      path: "/patient-dashboard/profile",
    },
]

 export const doctorsidebardata = [
    {
        name : "view/edit-profile",
        link : "/edit-profile",
        icon : "CgProfile",
    },
    {
        name : "My Appointments",
        link : "/my-appointments",
        icon : "FaFileMedical",
    },
    {
        name : "Make Reports",
        link : "/make-reports",
        icon : "AiFillFileAdd",
    },
    {
        name : "Settings",
        link : "/setting",
        icon : "IoIosSettings",
    },
]

export const adminsidebardata = [
    {
        name : "view/edit-profile",
        link : "/edit-profile",
        icon : "CgProfile",
    },
    {
        name : "overview",
        link : "/overview",
        icon : "PiHospital",
    },
    {
        name : "Add a patient",
        link : "/add-patient",
        icon : "IoPersonAddSharp",
    },
    {
        name : "Add a doctor",
        link : "/add-doctor",
        icon : "FaUserMd",
    },
    {
        name : "Add a Nurse",
        link : "/add-nurse",
        icon : "LiaUserNurseSolid",
    },
    {
        name : "Add a admin",
        link : "/add-admin",
        icon : "RiAdminLine",
    },
    {
        name : "Add Bed",
        link : "/add-bed",
        icon : "GiBed",
    },
    {
        name : "Allocate Bed",
        link : "/allocate-bed",
        icon : "FaBed",
    },
    {
        name : "Add Ambulance",
        link : "/add-ambulance",
        icon : "FaAmbulance",
    },
    {
        name : "Book Ambulance",
        link : "/book-ambulance",
        icon : "GiAmbulance",
    },
]

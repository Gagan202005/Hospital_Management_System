import React, { useState } from "react";
import Navbar from "../Components/Common/Navbar.jsx";
import HospitalFooter from "../Components/Common/Footer.jsx";
import { Button } from "../Components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/Users/gagansinghal/Desktop/projects/hospital_management_system/src/Components/ui/card.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/Users/gagansinghal/Desktop/projects/hospital_management_system/src/Components/ui/tabs.jsx";
import { Users, Truck, Bed, BarChart3, Stethoscope } from "lucide-react";
import { AddPatientSection } from "../Components/Core/Admin/AddPatientSection.jsx";
import { AddDoctorSection } from "../Components/Core/Admin/AddDoctorSection";
import { AddAmbulanceSection } from "../Components/Core/Admin/AddAmbulanceSection";
import { AddBedSection } from "../Components/Core/Admin/AddBedSection";
import { OverviewSection } from "../Components/Core/Admin/OverviewSection";
import { AddAdminSection } from "../Components/Core/Admin/AddAdminSection.jsx";
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-care-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-900 mb-2">
            Hospital Admin Dashboard
          </h1>
          <p className="text-medical-600">
            Manage hospital operations, staff, and resources
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Doctors
            </TabsTrigger>
            <TabsTrigger value="ambulances" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Ambulances
            </TabsTrigger>
            <TabsTrigger value="beds" className="flex items-center gap-2">
              <Bed className="w-4 h-4" />
              Beds
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Admins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewSection />
          </TabsContent>

          <TabsContent value="patients">
            <AddPatientSection />
          </TabsContent>

          <TabsContent value="doctors">
            <AddDoctorSection />
          </TabsContent>

          <TabsContent value="ambulances">
            <AddAmbulanceSection />
          </TabsContent>

          <TabsContent value="beds">
            <AddBedSection />
          </TabsContent>

          <TabsContent value="admins">
            <AddAdminSection/>
          </TabsContent>
        </Tabs>
      </main>

      <HospitalFooter />
    </div>
  );
};

export default AdminDashboard;
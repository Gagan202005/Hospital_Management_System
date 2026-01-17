import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Stethoscope, Search, Edit, Trash2, Clock, Loader2, IndianRupee } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Import your API functions
import { Add_Doctor, GetAll_Users } from "../../../services/operations/AdminApi"; // Create these

export const AddDoctorSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // 1. Comprehensive Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneno: "",
    password: "",
    confirmPassword: "",
    dob: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
    department: "",
    specialization: "",
    experience: "",
    consultationFee: "",
    degree: "",   // For qualification
    college: "",  // For qualification
  });

  const [doctors, setDoctors] = useState([]);

  // 2. Fetch Doctors
  const fetchDoctors = async () => {
    setIsFetching(true);
    try {
      const response = await GetAll_Users(token,"Doctor",dispatch);
      if (Array.isArray(response)) {
        setDoctors(response);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setDoctors([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token]);

  // 3. Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // API Call
      await Add_Doctor(formData, token, dispatch);
      
      toast.success("Doctor Added Successfully");
      fetchDoctors();

      // Reset Form
      setFormData({
        firstName: "", lastName: "", email: "", phoneno: "",
        password: "", confirmPassword: "", dob: "", age: "",
        gender: "", bloodGroup: "", address: "", department: "",
        specialization: "", experience: "", consultationFee: "",
        degree: "", college: ""
      });

    } catch (error) {
      console.error("Error adding doctor:", error);
      // Toast handled in service
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Add Doctor Form */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-medical-600" />
              Add New Doctor
            </CardTitle>
            <CardDescription>Register a new medical professional</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="doctor@hospital.com" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="phoneno">Phone</Label>
                  <Input id="phoneno" placeholder="+1 234 567 890" value={formData.phoneno} onChange={handleInputChange} required />
                </div>
              </div>

              {/* Personal Details Row */}
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Age" value={formData.age} onChange={handleInputChange} required />
                </div>
                <div className="col-span-1">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(val) => handleSelectChange("gender", val)} value={formData.gender}>
                        <SelectTrigger><SelectValue placeholder="Sex" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="col-span-1">
                  <Label htmlFor="bloodGroup">Blood</Label>
                  <Input id="bloodGroup" placeholder="O+" value={formData.bloodGroup} onChange={handleInputChange} required />
                </div>
                 <div className="col-span-1">
                  <Label htmlFor="dob">DOB</Label>
                  <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
                </div>
              </div>

              {/* Professional Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={(val) => handleSelectChange("department", val)} value={formData.department}>
                    <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="General Surgery">General Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input id="specialization" placeholder="e.g. Heart Surgeon" value={formData.specialization} onChange={handleInputChange} />
                </div>
              </div>

               {/* Professional Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input id="degree" placeholder="e.g. MBBS, MD" value={formData.degree} onChange={handleInputChange} required />
                </div>
                <div>
                   <Label htmlFor="college">College/University</Label>
                   <Input id="college" placeholder="e.g. Harvard Med" value={formData.college} onChange={handleInputChange} required />
                </div>
              </div>

               {/* Professional Row 3 */}
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <Input id="experience" placeholder="e.g. 5 Years" value={formData.experience} onChange={handleInputChange} required />
                </div>
                <div>
                   <Label htmlFor="consultationFee">Consultation Fee</Label>
                   <div className="relative">
                     <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                     <Input id="consultationFee" type="number" className="pl-8" placeholder="500" value={formData.consultationFee} onChange={handleInputChange} required />
                   </div>
                </div>
              </div>
              
              <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Residential Address" value={formData.address} onChange={handleInputChange} required />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="******" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="******" value={formData.confirmPassword} onChange={handleInputChange} required />
                </div>
              </div>

              <Button type="submit" variant="medical" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Doctor...</> : "Add Doctor"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RIGHT: Doctor List */}
        <Card className="bg-white/80 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle>Medical Staff</CardTitle>
            <CardDescription>Manage active doctors</CardDescription>
            <div className="flex gap-2">
              <Input placeholder="Search doctors..." className="flex-1" />
              <Button variant="outline" size="icon"><Search className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {isFetching ? (
               <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : (
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {doctors.length === 0 ? (
                    <p className="text-center text-gray-500">No doctors found.</p>
                  ) : (
                    doctors.map((doc) => (
                        <div key={doc._id || doc.id} className="flex items-start justify-between p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex gap-3">
                            {/* Avatar Fallback */}
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {doc.firstName?.charAt(0)}{doc.lastName?.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">Dr. {doc.firstName} {doc.lastName}</h4>
                                <p className="text-xs text-muted-foreground">{doc.department} • {doc.specialization}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge variant="outline" className="text-[10px]">{doc.experience}</Badge>
                                    <Badge variant="secondary" className="text-[10px]">₹{doc.consultationFee}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4 text-gray-500" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                        </div>
                    ))
                  )}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
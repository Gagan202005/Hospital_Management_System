import { useState, useEffect } from "react"; // 1. Import useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { useToast } from "../../../hooks/use-toast";
import { UserPlus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Add_Patient,GetAll_Users } from "../../../services/operations/AdminApi"; // Assuming you have a Get_All_Patients here too
import { useDispatch, useSelector } from "react-redux";

// Helper to simulate API call if you don't have the import ready yet
// import { GetAll_Patients } from "../../../services/operations/AdminApi"; 

export const AddPatientSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const { toast } = useToast();
  const dispatch = useDispatch();

  // 1. Updated State with new fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    dob: "",              
    password: "",         
    confirmPassword: "",  
  });

  // 2. Changed to empty array for real data
  const [patients, setPatients] = useState([]);
  const [isFetching, setIsFetching] = useState(true); // To show loading state for list

  // 3. Define the Fetch Function
  const fetchPatients = async () => {
  setIsFetching(true);
  try {
    // 1. Call the function
    const result = await GetAll_Users(token, "patient", dispatch);
    
    // 2. Check if result exists before setting state
    if (result) {
      setPatients(result);
    }
  } catch (error) {
    console.error("Error fetching patients:", error);
  } finally {
    setIsFetching(false);
  }
};

  // 4. UseEffect to fetch on component mount
  useEffect(() => {
    fetchPatients();
  }, [token]); // Re-run if token changes

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleGenderChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match. Please check again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Assuming Add_Patient returns a promise. Added 'await' so we wait for success.
      Add_Patient(formData, token, dispatch);
      
      // 5. Success! Refresh the list immediately
      fetchPatients();

      // Reset Form
      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        emergencyContact: "",
        dob: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Error adding patient:", error);
      // Toast is likely handled in your Add_Patient slice/service, 
      // but keeping this here just in case.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Patient Form */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add New Patient
            </CardTitle>
            <CardDescription>Register a new patient in the hospital system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPatient} className="space-y-4">
              {/* ... (Form Fields remain exactly the same as before) ... */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="Age" value={formData.age} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={handleGenderChange} value={formData.gender}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Phone number" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email address" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Create password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleInputChange} required />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Enter patient address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" placeholder="Emergency contact number" value={formData.emergencyContact} onChange={handleInputChange} required />
              </div>

              <Button type="submit" variant="medical" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Patient...</> : "Add Patient"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Current Patients</CardTitle>
            <CardDescription>Manage existing patient records</CardDescription>
            <div className="flex gap-2">
              <Input placeholder="Search patients..." className="flex-1" />
              <Button variant="outline" size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 6. Added Loading State for List */}
            {isFetching ? (
               <div className="flex justify-center items-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
               </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {patients.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No patients found.</p>
                ) : (
                    patients.map((patient) => (
                      <div key={patient._id || patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{patient.firstName} {patient.lastName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {/* Adjust these fields based on your backend response */}
                            Age: {patient.age} | Ph: {patient.phoneno || patient.phone}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="medical">{patient.gender}</Badge>
                            {/* Only show badge if department exists in backend data */}
                            {patient.department && (
                                <Badge variant="care">{patient.department}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
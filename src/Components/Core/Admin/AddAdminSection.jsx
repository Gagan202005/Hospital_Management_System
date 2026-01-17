import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Add_Admin } from "../../../services/operations/AdminApi";

export const AddAdminSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // 1. Complete Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneno: "",
    age: "",
    gender: "",
    dob: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // 2. Input Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  // 3. Submit Handler
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select a gender");
      return;
    }

    setIsLoading(true);
    try {
      // API Call
      await Add_Admin(formData, token, dispatch);

      // Reset Form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneno: "",
        age: "",
        gender: "",
        dob: "",
        address: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      console.error("Error adding admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Add New Administrator
          </CardTitle>
          <CardDescription>
            Create a new administrative account with full system access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-6">
            
            {/* Row 1: Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            {/* Row 2: Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@hospital.com" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneno">Phone Number</Label>
                <Input 
                  id="phoneno" 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={formData.phoneno} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            {/* Row 3: Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Age" 
                  value={formData.age} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={handleSelectChange} value={formData.gender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input 
                  id="dob" 
                  type="date" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            {/* Row 4: Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter full residential address" 
                value={formData.address} 
                onChange={handleInputChange} 
                required 
                className="resize-none"
              />
            </div>

            {/* Row 5: Security */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create strong password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm password" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Administrator...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
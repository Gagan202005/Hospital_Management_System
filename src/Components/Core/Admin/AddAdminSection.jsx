import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { ShieldAlert, Loader2, Copy } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Add_Admin } from "../../../services/operations/AdminApi";

export const AddAdminSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // 1. Form State (Removed Password, Age)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneno: "",
    gender: "",
    dob: "",
    address: "",
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
    
    if (!formData.gender) {
      toast.error("Please select a gender");
      return;
    }

    setIsLoading(true);
    try {
      // API Call
      const response = await Add_Admin(formData, token);

      // Success Toast with Password
      if(response?.generatedPassword) {
           toast.success(
             (t) => (
               <div className="flex flex-col gap-1">
                 <span className="font-bold">Admin Account Created!</span>
                 <div className="flex items-center gap-2 text-sm bg-white/20 p-1 rounded mt-1">
                   Pass: <code className="font-mono font-bold">{response.generatedPassword}</code>
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText(response.generatedPassword);
                       toast.success("Copied!");
                     }}
                     className="p-1 hover:bg-black/10 rounded"
                     title="Copy Password"
                   >
                     <Copy className="w-3 h-3" />
                   </button>
                 </div>
                 <span className="text-[10px] opacity-80">Credentials sent via Email.</span>
               </div>
             ),
             { duration: 6000, position: "top-center" }
           );
      } else if (response?.success) {
          toast.success("Admin Added Successfully");
      }

      // Reset Form
      setFormData({
        firstName: "", lastName: "", email: "", phoneno: "",
        gender: "", dob: "", address: "",
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="w-6 h-6 text-slate-700" />
            Add New Administrator
          </CardTitle>
          <CardDescription>
            Create an admin account with full system access. Credentials will be auto-generated.
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
                  placeholder="+91 98765 43210" 
                  value={formData.phoneno} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>

            {/* Row 3: Personal Details (Removed Age) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="resize-none min-h-[80px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg mt-4" 
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
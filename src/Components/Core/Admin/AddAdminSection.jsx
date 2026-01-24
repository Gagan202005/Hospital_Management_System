import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { ShieldAlert, Loader2, Copy, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Add_Admin } from "../../../services/operations/AdminApi";

export const AddAdminSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phoneno: "",
    gender: "", dob: "", address: "",
  });

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!formData.gender) { toast.error("Gender is required."); return; }

    setIsLoading(true);
    try {
      const response = await Add_Admin(formData, token);

      if(response?.generatedPassword) {
           toast.success(
             (t) => (
               <div className="flex flex-col gap-1">
                 <span className="font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Admin Created!</span>
                 <div className="flex items-center gap-2 text-sm bg-white/20 p-2 rounded mt-1 border border-white/10">
                   Pass: <code className="font-mono font-bold tracking-wider">{response.generatedPassword}</code>
                   <button onClick={() => { navigator.clipboard.writeText(response.generatedPassword); toast.success("Copied to clipboard"); }} className="p-1 hover:bg-black/10 rounded" title="Copy Password"><Copy className="w-3 h-3" /></button>
                 </div>
                 <span className="text-[10px] opacity-80">Credentials sent via Email.</span>
               </div>
             ),
             { duration: 8000, position: "top-center" }
           );
      } 

      setFormData({ firstName: "", lastName: "", email: "", phoneno: "", gender: "", dob: "", address: "" });

    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Admin Control</h1>
        <p className="text-slate-500">Grant system access to new administrators.</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200 border-t-4 border-t-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            New Administrator Setup
          </CardTitle>
          <CardDescription>Create an admin account with full system privileges. Credentials will be auto-generated.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>First Name</Label><Input id="firstName" placeholder="e.g. Sarah" value={formData.firstName} onChange={handleInputChange} required /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input id="lastName" placeholder="e.g. Connor" value={formData.lastName} onChange={handleInputChange} required /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Official Email</Label><Input id="email" type="email" placeholder="admin@hospital.com" value={formData.email} onChange={handleInputChange} required /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input id="phoneno" type="tel" placeholder="+91 98765 43210" value={formData.phoneno} onChange={handleInputChange} required /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Date of Birth</Label><Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} required /></div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select onValueChange={handleSelectChange} value={formData.gender}>
                  <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Residential Address</Label>
              <Textarea id="address" placeholder="Full address..." value={formData.address} onChange={handleInputChange} required className="min-h-[80px]" />
            </div>

            <div className="pt-4">
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 shadow-lg" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Provisioning Account...</> : "Create Administrator Account"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
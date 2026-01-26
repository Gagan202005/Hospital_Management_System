import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { CalendarRange, User, Stethoscope, Loader2, CheckCircle, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { getAllUsers, fixAppointment } from "../../../services/operations/AdminApi";

export const FixAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const [doctors, setDoctors] = useState([]);
  
  const [formData, setFormData] = useState({
    doctorId: "", date: "", startTime: "", endTime: "",
    firstName: "", lastName: "", email: "", phone: "", reason: "", symptoms: ""
  });

  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await getAllUsers(token, "doctor");
        if (Array.isArray(docs)) setDoctors(docs);
      } catch (error) {
        console.error("FETCH DOCTORS ERROR:", error);
        // Optional: toast.error("Failed to load doctor list");
      }
    };
    loadDocs();
  }, [token]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSelectChange = (val) => setFormData({ ...formData, doctorId: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.startTime >= formData.endTime) {
        toast.error("End time must be after start time");
        setIsLoading(false);
        return;
    }

    try {
        const response = await fixAppointment(formData, token);
        
        // Success Handling
        if (response?.success) {
            setFormData({ doctorId: "", date: "", startTime: "", endTime: "", firstName: "", lastName: "", email: "", phone: "", reason: "", symptoms: "" });
            
            if (response.newPatientCreated) {
                toast.success(`New Patient Account Created! Password: ${response.generatedPassword}`, { duration: 8000 });
            } else {
                toast.success("Appointment Scheduled Successfully");
            }
        }
    } catch (error) {
        console.error("BOOKING ERROR:", error);
        // >>> UPDATED: Show Backend Error Message <<<
        const errorMessage = error.response?.data?.message || error.message || "Failed to book appointment.";
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Schedule Manager</h1>
        <p className="text-slate-500">Manually book appointments and register walk-in patients.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: MAIN FORM */}
        <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Doctor Selection */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Stethoscope className="w-5 h-5 text-indigo-600"/> Provider & Timeline</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Medical Provider</Label>
                            <Select onValueChange={handleSelectChange} value={formData.doctorId}>
                                <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                                <SelectContent>
                                    {doctors.map((doc) => (
                                        <SelectItem key={doc._id} value={doc._id}>Dr. {doc.firstName} {doc.lastName} - {doc.department}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Date</Label><Input type="date" id="date" value={formData.date} onChange={handleInputChange} required /></div>
                        <div className="space-y-2"><Label>Start Time</Label><Input type="time" id="startTime" value={formData.startTime} onChange={handleInputChange} required /></div>
                        <div className="space-y-2"><Label>End Time</Label><Input type="time" id="endTime" value={formData.endTime} onChange={handleInputChange} required /></div>
                    </CardContent>
                </Card>

                {/* 2. Patient Data */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5 text-indigo-600"/> Patient Demographics</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>First Name</Label><Input id="firstName" value={formData.firstName} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label>Last Name</Label><Input id="lastName" value={formData.lastName} onChange={handleInputChange} required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Email</Label><Input type="email" id="email" value={formData.email} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input id="phone" value={formData.phone} onChange={handleInputChange} required /></div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Medical Reason */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CalendarRange className="w-5 h-5 text-indigo-600"/> Clinical Context</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2"><Label>Reason for Visit</Label><Input id="reason" value={formData.reason} onChange={handleInputChange} required /></div>
                        <div className="space-y-2"><Label>Symptoms (Optional)</Label><Textarea id="symptoms" value={formData.symptoms} onChange={handleInputChange} /></div>
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-12" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Processing...</> : "Confirm Booking"}
                </Button>
            </form>
        </div>

        {/* RIGHT: HELPER PANEL */}
        <div className="lg:w-80 space-y-6">
            <Card className="bg-blue-50 border-blue-100 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-blue-800 text-base flex items-center gap-2"><Info className="w-4 h-4"/> Auto-Registration</CardTitle></CardHeader>
                <CardContent className="text-sm text-blue-700">
                    If the email provided is not in our system, a new <strong>Patient Account</strong> will be created automatically. Login credentials will be generated.
                </CardContent>
            </Card>
            
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4">Checklist</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> Verify doctor availability.</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> Ensure email is accurate for notifications.</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> Confirm time slot duration.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Calendar as CalendarIcon, Clock, User, Stethoscope, Loader2, Copy } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// 1. Import 'getAllUsers' from AdminApi
import { getAllUsers } from "../../../services/operations/AdminApi";
// 2. Import 'fixAppointment' from AppointmentApi
import { fixAppointment } from "../../../services/operations/AdminApi";

export const FixAppointment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);

  // Data State
  const [doctors, setDoctors] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    startTime: "", // "HH:mm"
    endTime: "",   // "HH:mm"
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "",
    symptoms: ""
  });

  // =========================================================
  // FETCH DOCTORS USING EXISTING 'getAllUsers' API
  // =========================================================
  useEffect(() => {
    const loadData = async () => {
      // Pass "doctor" as the type parameter
      const docs = await getAllUsers(token, "doctor");
      if (Array.isArray(docs)) {
        setDoctors(docs);
      }
    };
    loadData();
  }, [token]);

  // Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, doctorId: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation: End time > Start time
      if (formData.startTime >= formData.endTime) {
          toast.error("End time must be after start time");
          setIsLoading(false);
          return;
      }

      const response = await fixAppointment(formData, token);

      if (response?.success) {
        // Reset Form
        setFormData({
            doctorId: "", date: "", startTime: "", endTime: "",
            firstName: "", lastName: "", email: "", phone: "",
            reason: "", symptoms: ""
        });

        // Show Password Toast if new user
        if (response.newPatientCreated && response.generatedPassword) {
            toast.success((t) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold">New Patient Account Created!</span>
                    <div className="flex items-center gap-2 bg-white/20 p-2 rounded text-sm">
                        Password: <code className="font-mono font-bold">{response.generatedPassword}</code>
                        <button onClick={() => { navigator.clipboard.writeText(response.generatedPassword); toast.success("Copied!"); }}><Copy className="w-3 h-3"/></button>
                    </div>
                    <span className="text-[10px] opacity-90">Please share this with the patient.</span>
                </div>
            ), { duration: 8000 });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* LEFT: FORM */}
        <Card className="flex-1 bg-white/80 backdrop-blur-sm shadow-md border-t-4 border-indigo-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <CalendarIcon className="w-5 h-5" />
              Fix Appointment
            </CardTitle>
            <CardDescription>
              Manually schedule a slot. Checks for overlaps automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Doctor & Time Section */}
              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-4">
                  <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> Doctor & Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Select Doctor</Label>
                        <Select onValueChange={handleSelectChange} value={formData.doctorId}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Choose a Doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.length > 0 ? (
                                    doctors.map((doc) => (
                                        <SelectItem key={doc._id} value={doc._id}>
                                            Dr. {doc.firstName} {doc.lastName} <span className="text-gray-400 text-xs">({doc.department})</span>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>No doctors found</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input 
                            id="date" 
                            type="date" 
                            value={formData.date} 
                            onChange={handleInputChange} 
                            required 
                            className="bg-white"
                        />
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label>Start Time</Label>
                          <div className="relative">
                              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                              <Input 
                                  id="startTime" 
                                  type="time"
                                  value={formData.startTime} 
                                  onChange={handleInputChange} 
                                  required 
                                  className="pl-9 bg-white"
                              />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label>End Time</Label>
                          <div className="relative">
                              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                              <Input 
                                  id="endTime" 
                                  type="time"
                                  value={formData.endTime} 
                                  onChange={handleInputChange} 
                                  required 
                                  className="pl-9 bg-white"
                              />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Patient Details Section */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4" /> Patient Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} required className="bg-white" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} required className="bg-white" />
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="patient@example.com" value={formData.email} onChange={handleInputChange} required className="bg-white" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" placeholder="9876543210" value={formData.phone} onChange={handleInputChange} required className="bg-white" />
                      </div>
                  </div>
              </div>

              {/* Medical Details */}
              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Input id="reason" placeholder="e.g. Fever, Checkup..." value={formData.reason} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                      <Textarea id="symptoms" placeholder="Describe symptoms..." value={formData.symptoms} onChange={handleInputChange} />
                  </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-6" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Scheduling...</> : "Confirm Appointment"}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* RIGHT: Quick Info */}
        <div className="md:w-1/3 space-y-6">
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-800 text-lg">New Patient?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 space-y-2">
                    <p>If the entered email does not exist, a <strong>new Patient Account</strong> will be created automatically.</p>
                    <p>A random password will be generated upon success.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Instructions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-500 space-y-3">
                    <div className="flex gap-2">
                        <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs h-fit">1</span>
                        <p>Select Doctor and Date.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs h-fit">2</span>
                        <p>Set Start and End times. Ensure they don't overlap with existing slots.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-xs h-fit">3</span>
                        <p>Enter patient details correctly.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
};
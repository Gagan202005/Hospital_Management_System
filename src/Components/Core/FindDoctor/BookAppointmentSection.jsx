import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, User, Loader2, IndianRupee, AlertCircle, Lock, LogIn } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../hooks/use-toast";
import { useSelector } from "react-redux";
import Navbar from "../../Common/Navbar";
import Footer from "../../Common/Footer";

// API
import { fetchDoctorDetails, fetchTimeSlotsbyDate, bookAppointmentApi } from "../../../services/operations/DoctorApi";

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, user } = useSelector((state) => state.auth);

  // Data States
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]); 
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form States
  const [selectedDate, setSelectedDate] = useState();
  const [selectedSlotId, setSelectedSlotId] = useState(""); 
  const [displayTime, setDisplayTime] = useState(""); 
  const [isBooking, setIsBooking] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "", 
    lastName: user?.lastName || "", 
    email: user?.email || "", 
    phone: user?.phoneno || "", 
    reason: "", 
    symptoms: ""
  });

  // --- VALIDATION CHECK ---
  const isFormValid = 
    selectedDate && 
    selectedSlotId && 
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.reason.trim() !== "" &&
    formData.symptoms.trim() !== "";

  // --- 1. Load Doctor ---
  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const data = await fetchDoctorDetails(id);
        if (data) setDoctor(data);
      } catch (error) {
        console.error("FETCH DOCTOR ERROR:", error);
        const errorMessage = error.response?.data?.message || "Failed to load doctor details.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      }
    };
    if (id) loadDoctor();
  }, [id, toast]);

  // --- 2. Load Slots ---
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate || !id) return;
      
      setLoadingSlots(true); 
      setSelectedSlotId(""); 
      setDisplayTime("");
      setAvailableSlots([]);

      try {
        const slots = await fetchTimeSlotsbyDate(id, format(selectedDate, "yyyy-MM-dd"));
        setAvailableSlots(slots || []);
      } catch (error) { 
        console.error("FETCH SLOTS ERROR:", error);
        const errorMessage = error.response?.data?.message || "Failed to load time slots.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally { 
        setLoadingSlots(false); 
      }
    };
    loadSlots();
  }, [selectedDate, id, toast]);

  const handleBook = async () => {
    if (!token) { 
        toast({ title: "Authentication Required", description: "Please login to continue.", variant: "destructive" }); 
        return navigate("/login"); 
    }
    
    if (!isFormValid) { 
        return toast({
            title: "Missing Information", 
            description: "Please fill all required fields marked with *",
            variant: "destructive"
        }); 
    }

    setIsBooking(true);
    try {
        const payload = { 
            doctorId: id, 
            date: format(selectedDate, "yyyy-MM-dd"), 
            timeSlotId: selectedSlotId, 
            ...formData 
        };
        
        await bookAppointmentApi(payload, token, navigate);
        
        // Success Toast
        toast({ 
            title: "Success", 
            description: "Appointment request sent successfully!", 
            className: "bg-green-600 text-white border-none" 
        });

    } catch (error) {
        console.error("BOOKING ERROR:", error);
        const errorMessage = error.response?.data?.message || "Booking failed. Please try again.";
        toast({ title: "Booking Failed", description: errorMessage, variant: "destructive" });
    } finally {
        setIsBooking(false);
    }
  };

  // --- Guest View ---
  if (!token) {
      return (
        <div className="flex flex-col min-h-screen bg-slate-50 mt-[150px]">
            <div className="fixed top-0 w-full z-50"><Navbar /></div>
            <main className="flex-1 flex items-center justify-center pt-20 px-4 mb-[50px]">
                <Card className="max-w-md w-full text-center p-6 shadow-lg border-t-4 border-t-blue-600">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Required</h2>
                    <p className="text-slate-500 mb-6">To ensure secure medical records, you must be logged in to book an appointment.</p>
                    <div className="space-y-3">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/login")}>
                            <LogIn className="w-4 h-4 mr-2" /> Login
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => navigate("/signup")}>Create Account</Button>
                    </div>
                </Card>
            </main>
            <Footer />
        </div>
      );
  }

  if (!doctor) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 mt-[122px]">
      <div className="fixed top-0 w-full z-50"><Navbar /></div>

      <main className="flex-1 pt-14">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 py-6">
            <div className="container mx-auto px-4">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-slate-500 hover:text-slate-900 p-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="flex items-center gap-4">
                    <img src={doctor.image} className="w-16 h-16 rounded-full object-cover border border-slate-200" alt="Doctor"/>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
                        <p className="text-slate-500">Dr. {doctor.firstName} {doctor.lastName} • {doctor.specialization}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* FORM */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Schedule Section */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader><CardTitle className="text-lg flex gap-2 items-center"><CalendarIcon className="w-5 h-5 text-blue-600"/> Select Schedule</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Date <span className="text-red-500">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" /> {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date()} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Time Slot <span className="text-red-500">*</span></Label>
                                <Select 
                                    value={selectedSlotId} 
                                    onValueChange={(val) => {
                                        setSelectedSlotId(val); 
                                        // UPDATED: Find full slot details to show start and end time
                                        const slot = availableSlots.find(s => s._id === val);
                                        if (slot) setDisplayTime(`${slot.startTime} - ${slot.endTime}`);
                                    }} 
                                    disabled={!selectedDate || loadingSlots}
                                >
                                    <SelectTrigger><SelectValue placeholder={loadingSlots ? "Loading..." : "Select Time"} /></SelectTrigger>
                                    <SelectContent>
                                        {availableSlots.length > 0 ? (
                                            availableSlots.map(s => (
                                                <SelectItem key={s._id} value={s._id}>
                                                    {s.startTime} - {s.endTime}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem disabled>No slots available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details Section */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader><CardTitle className="text-lg flex gap-2 items-center"><User className="w-5 h-5 text-blue-600"/> Personal Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name <span className="text-red-500">*</span></Label>
                                    <Input value={formData.firstName} onChange={(e)=>setFormData({...formData, firstName:e.target.value})} className="bg-slate-50"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name <span className="text-red-500">*</span></Label>
                                    <Input value={formData.lastName} onChange={(e)=>setFormData({...formData, lastName:e.target.value})} className="bg-slate-50"/>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Email <span className="text-red-500">*</span></Label>
                                    <Input value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} className="bg-slate-50"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone <span className="text-red-500">*</span></Label>
                                    <Input value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} className="bg-slate-50"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Reason for Visit <span className="text-red-500">*</span></Label>
                                <Input value={formData.reason} onChange={(e)=>setFormData({...formData, reason:e.target.value})} placeholder="e.g. Fever, Consultation"/>
                            </div>
                            <div className="space-y-2">
                                <Label>Symptoms <span className="text-red-500">*</span></Label>
                                <Input value={formData.symptoms} onChange={(e)=>setFormData({...formData, symptoms:e.target.value})} placeholder="Briefly describe..."/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SUMMARY SIDEBAR */}
                <div>
                    <Card className="sticky top-20 shadow-lg border-t-4 border-t-blue-600">
                        <CardHeader className="bg-slate-50/50 pb-4">
                            <CardTitle>Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{selectedDate ? format(selectedDate, "PPP") : "--"}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{displayTime || "--"}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Consultation Fee</span><span className="font-medium flex items-center"><IndianRupee className="w-3 h-3"/> {doctor.consultationFee}</span></div>
                            </div>
                            
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-700 text-sm font-medium">To Pay Now</span>
                                    <span className="text-green-700 font-bold text-lg flex items-center"><IndianRupee className="w-4 h-4"/> 0</span>
                                </div>
                                <p className="text-[10px] text-green-600 mt-1">Pay consultation fee at the hospital counter.</p>
                            </div>

                            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Your request will be pending confirmation. You will receive an email update shortly.</span>
                            </div>

                            <Button 
                                className={`w-full h-12 text-lg ${!isFormValid ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleBook} 
                                disabled={isBooking || !isFormValid}
                            >
                                {isBooking ? <Loader2 className="animate-spin mr-2"/> : "Confirm Booking"}
                            </Button>
                            
                            {!isFormValid && (
                                <p className="text-xs text-center text-red-500">
                                    * Please complete all required fields
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookAppointment;
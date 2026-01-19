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
import { CalendarIcon, ArrowLeft, User, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../hooks/use-toast";
import { useSelector } from "react-redux";
// Import API Services
import { fetchDoctorDetails } from "../../../services/operations/DoctorApi";
import { fetchTimeSlotsbyDate, bookAppointmentApi } from "../../../services/operations/DoctorApi";
const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
const { token } = useSelector((state) => state.auth);
  // --- States ---
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  
  // Slot States
  const [availableSlots, setAvailableSlots] = useState([]); // Stores objects: [{_id, startTime}]
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form States
  const [selectedDate, setSelectedDate] = useState();
  const [selectedSlotId, setSelectedSlotId] = useState(""); // Stores ID
  const [displayTime, setDisplayTime] = useState(""); // Stores String (e.g., "10:00 AM") for summary
  const [isBooking, setIsBooking] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "", 
    reason: "", 
    symptoms: ""
  });

  // --- 1. Fetch Doctor Details ---
  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const data = await fetchDoctorDetails(id);
        if (data) {
           setDoctor({
             id: data._id,
             name: `${data.firstName} ${data.lastName}`,
             specialty: data.specialization,
             image: data.image,
             location: data.address || "Main Hospital",
             consultationFee: data.consultationFee
           });
        }
      } catch (error) {
        console.error("Doctor Load Error", error);
        toast({ title: "Error", description: "Failed to load doctor", variant: "destructive" });
      } finally {
        setLoadingDoctor(false);
      }
    };
    if (id) loadDoctor();
  }, [id, toast]);

  // --- 2. Fetch Time Slots ---
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate || !id) return;
      
      setLoadingSlots(true);
      setSelectedSlotId(""); 
      setDisplayTime("");
      setAvailableSlots([]); 
      
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const slots = await fetchTimeSlotsbyDate(id, formattedDate);
        setAvailableSlots(slots || []);
      } catch (error) {
        console.error("Slot Load Error", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate, id]);

  // --- Handlers ---
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSlotChange = (slotId) => {
    setSelectedSlotId(slotId);
    // Find the readable time string for the summary view
    const slot = availableSlots.find(s => s._id === slotId);
    if (slot) setDisplayTime(slot.startTime);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlotId || !formData.firstName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);

    const bookingPayload = {
      doctorId: id,
      date: format(selectedDate, "yyyy-MM-dd"),
      timeSlotId: selectedSlotId, // Send ID to backend
      ...formData
    };

    await bookAppointmentApi(bookingPayload,token, navigate);
    setIsBooking(false);
  };

  // --- Loading/Error Views ---
  if (loadingDoctor) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  if (!doctor) {
    return <div className="min-h-screen flex items-center justify-center">Doctor Not Found</div>;
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-full object-cover border-2 bg-white" />
            <div>
              <h1 className="text-2xl font-bold">Book Appointment with Dr. {doctor.name}</h1>
              <p className="text-muted-foreground">{doctor.specialty} • {doctor.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="flex gap-2"><User className="w-5 h-5"/> Patient Details</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} placeholder="John" />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} placeholder="Doe" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="(555) 000-0000" />
                  </div>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date Picker */}
                  <div>
                    <Label className="mb-2 block">Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date() || date.getDay() === 0} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Time Slot Select (Value = ID, Label = Time) */}
                  <div>
                    <Label className="mb-2 block">Time Slot *</Label>
                    <Select 
                      value={selectedSlotId} 
                      onValueChange={handleSlotChange} // Updates ID and DisplayTime
                      disabled={!selectedDate || loadingSlots}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedDate ? "Select Date First" : loadingSlots ? "Loading..." : "Select Time"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => (
                              <SelectItem key={slot._id} value={slot._id}>
                                {slot.startTime} 
                              </SelectItem>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-center text-muted-foreground">
                                {selectedDate ? "No available slots" : "Please select a date"}
                            </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                   <Label>Reason for Visit</Label>
                   <Input value={formData.reason} onChange={(e) => handleInputChange("reason", e.target.value)} placeholder="Reason..." />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader className="bg-muted/30"><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3 border-b pb-4">
                  <img src={doctor.image} alt="doc" className="w-12 h-12 rounded-full object-cover bg-white border" />
                  <div>
                    <div className="font-medium text-sm">Dr. {doctor.name}</div>
                    <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{selectedDate ? format(selectedDate, "PPP") : "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{displayTime || "--"}</span>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg mt-2 border border-primary/10">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total Fee</span>
                    <span className="text-primary text-lg">${doctor.consultationFee}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-2" 
                  size="lg"
                  variant="appointment"
                  onClick={handleBookAppointment}
                  disabled={isBooking || !selectedDate || !selectedSlotId}
                >
                  {isBooking ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
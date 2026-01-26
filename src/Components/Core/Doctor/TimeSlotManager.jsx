import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Clock, Loader2, CalendarRange, Lock } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Calendar } from "../../ui/calendar";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../hooks/use-toast";
import { useSelector } from "react-redux";
import { fetchTimeSlots, createTimeSlot, deleteTimeSlot } from "../../../services/operations/DoctorApi";

export function TimeSlotManager() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { token } = useSelector((state) => state.auth);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const response = await fetchTimeSlots(token);
        if (response?.data) {
          const formatted = response.data.map(slot => ({
            ...slot,
            id: slot._id,
            date: new Date(slot.date)
          }));
          setTimeSlots(formatted);
        }
      } catch (error) { 
          console.error("FETCH SLOTS ERROR:", error);
          // Optional: toast({ title: "Error", description: "Failed to load schedule.", variant: "destructive" });
      } 
      finally { setIsLoading(false); }
    };
    loadData();
  }, [token]);

  const handleAddSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (endTime <= startTime) {
      toast({ title: "Logic Error", description: "End time must be after start time.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createTimeSlot(selectedDate, startTime, endTime, token);
      if (response?.data) {
        const newSlotData = response.data;
        setTimeSlots(prev => [...prev, { ...newSlotData, id: newSlotData._id, date: new Date(newSlotData.date) }]);
        setStartTime(""); setEndTime("");
        toast({ title: "Success", description: "Time slot added." });
      }
    } catch (error) { 
        console.error("ADD SLOT ERROR:", error);
        // >>> UPDATED: Show backend error message <<<
        const errorMessage = error.response?.data?.message || error.message || "Failed to add slot.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } 
    finally { setIsSubmitting(false); }
  };

  const handleRemoveSlot = async (id) => {
    try {
        const success = await deleteTimeSlot(id, token);
        if (success) {
            setTimeSlots(prev => prev.filter(slot => slot.id !== id));
            toast({ title: "Success", description: "Slot removed." });
        }
    } catch (error) {
        console.error("DELETE SLOT ERROR:", error);
        // >>> UPDATED: Show backend error message <<<
        const errorMessage = error.response?.data?.message || error.message || "Failed to delete slot.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const getCurrentDaySlots = () => {
    if (!selectedDate) return [];
    return timeSlots
      .filter(slot => slot.date.toDateString() === selectedDate.toDateString())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const groupedUpcomingSlots = timeSlots
    .filter(slot => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return slot.date >= today;
    })
    .sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.startTime.localeCompare(b.startTime);
    })
    .reduce((groups, slot) => {
      const dateKey = slot.date.toDateString(); 
      if (!groups[dateKey]) groups[dateKey] = { dateObj: slot.date, slots: [] };
      groups[dateKey].slots.push(slot);
      return groups;
    }, {});

  if (isLoading) return <div className="flex h-96 w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Schedule Management</h1>
        <p className="text-slate-500">Configure your availability for patient bookings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ADD SLOT CARD */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-blue-600" /> Define Availability
            </CardTitle>
            <CardDescription>Add a single time block for a specific date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-slate-200", !selectedDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus disabled={(date) => { const y = new Date(); y.setDate(y.getDate()-1); return date < y; }} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="border-slate-200"/>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="border-slate-200"/>
              </div>
            </div>

            <Button onClick={handleAddSlot} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Plus className="h-4 w-4 mr-2"/>}
              {isSubmitting ? "Saving..." : "Add Slot"}
            </Button>
          </CardContent>
        </Card>

        {/* SELECTED DAY SLOTS CARD */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-emerald-600" /> Active Slots
            </CardTitle>
            <CardDescription>{selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date to view"}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {getCurrentDaySlots().length > 0 ? (
                    getCurrentDaySlots().map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <Badge variant={!slot.isBooked ? "default" : "secondary"} className={!slot.isBooked ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-200 text-slate-600"}>
                            {!slot.isBooked ? "Open" : "Booked"}
                          </Badge>
                        </div>
                        
                        {/* --- DELETE BUTTON --- */}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveSlot(slot.id)} 
                          disabled={slot.isBooked}
                          title={slot.isBooked ? "Cannot delete booked slot" : "Delete slot"}
                          className={`h-8 w-8 p-0 ${slot.isBooked ? "text-slate-300 cursor-not-allowed" : "text-red-500 hover:bg-red-50"}`}
                        >
                          {slot.isBooked ? <Lock className="h-4 w-4"/> : <Trash2 className="h-4 w-4" />}
                        </Button>

                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 border border-dashed rounded-lg">
                      <Clock className="h-8 w-8 mb-2 opacity-20" />
                      <p>No slots configured for this date.</p>
                    </div>
                  )}
                </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CalendarIcon className="h-10 w-10 mb-3 opacity-20" />
                <p>Select a date to manage slots.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ALL UPCOMING ACCORDION */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarRange className="w-5 h-5 text-purple-600"/> Upcoming Schedule Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedUpcomingSlots).length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {Object.entries(groupedUpcomingSlots).map(([key, group]) => (
                <AccordionItem key={key} value={key} className="border border-slate-200 rounded-lg px-4 bg-white">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-slate-800">{format(group.dateObj, "MMMM d, yyyy")}</span>
                        <span className="text-xs text-slate-500 font-medium uppercase">{format(group.dateObj, "EEEE")}</span>
                      </div>
                      <Badge variant="secondary" className="ml-2 font-normal bg-slate-100 text-slate-600">{group.slots.length} Slots</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {group.slots.map((slot) => (
                        <div key={slot.id} className={`flex items-center justify-between p-2 pl-3 rounded border ${slot.isBooked ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex flex-col">
                              <span className="font-mono text-xs font-semibold text-slate-700">{slot.startTime} - {slot.endTime}</span>
                              {slot.isBooked && <span className="text-[10px] text-amber-600 font-medium">Booked</span>}
                          </div>
                          
                          {/* --- ACCORDION DELETE BUTTON --- */}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className={`h-6 w-6 ${slot.isBooked ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-red-500"}`}
                            onClick={() => handleRemoveSlot(slot.id)}
                            disabled={slot.isBooked}
                            title={slot.isBooked ? "Cannot delete booked slot" : "Delete"}
                          >
                             {slot.isBooked ? <Lock className="h-3 w-3"/> : <Trash2 className="h-3 w-3" />}
                          </Button>

                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-slate-400">No upcoming schedule found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
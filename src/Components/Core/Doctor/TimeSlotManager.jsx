import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Calendar } from "../../ui/calendar";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../hooks/use-toast";
import { useSelector } from "react-redux";

// Import Service Functions (Ensure your path is correct)
import { fetchTimeSlots, createTimeSlot, deleteTimeSlot } from "../../../services/operations/DoctorApi";

export function TimeSlotManager() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { token } = useSelector((state) => state.auth);

  // Inputs for Start and End Time
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  // --- 1. Load Data on Mount ---
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await fetchTimeSlots(token);
        
        // Ensure response has the expected structure
        if (response?.data) {
          const formatted = response.data.map(slot => ({
            ...slot,
            id: slot._id, // Map MongoDB _id to id for frontend use
            date: new Date(slot.date) // Convert UTC string to JS Date Object
          }));
          setTimeSlots(formatted);
        }
      } catch (error) {
        console.error("Failed to load slots", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [token]);

  // --- 2. Add Slot Handler ---
  const handleAddSlot = async () => {
    // Basic Validation
    if (!selectedDate || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date, start time, and end time.",
        variant: "destructive",
      });
      return;
    }

    // Logic Validation: End Time > Start Time
    if (endTime <= startTime) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call Service
      // Note: The service handles converting selectedDate to YYYY-MM-DD to avoid timezone bugs
      const response = await createTimeSlot(selectedDate, startTime, endTime, token);
      
      if (response?.data) {
        const newSlotData = response.data;
        
        // Update Local State with new slot
        setTimeSlots(prev => [...prev, { 
          ...newSlotData, 
          id: newSlotData._id, 
          date: new Date(newSlotData.date) 
        }]);
        
        // Reset Inputs
        setStartTime("");
        setEndTime("");
      }
    } catch (error) {
      console.error("Add Slot Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. Remove Slot Handler ---
  const handleRemoveSlot = async (id) => {
    const success = await deleteTimeSlot(id, token);
    if (success) {
      setTimeSlots(prev => prev.filter(slot => slot.id !== id));
    }
  };

  // --- Helpers ---

  // Sort slots for the currently selected date (Current Day Card)
  const getCurrentDaySlots = () => {
    if (!selectedDate) return [];
    return timeSlots
      .filter(slot => slot.date.toDateString() === selectedDate.toDateString())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Group slots by date for upcoming days (Accordion Card)
  const groupedUpcomingSlots = timeSlots
    .filter(slot => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Filter for today or future dates
      return slot.date >= today;
    })
    .sort((a, b) => {
      // Sort by Date, then by Start Time
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.startTime.localeCompare(b.startTime);
    })
    .reduce((groups, slot) => {
      // Group by Date String
      const dateKey = slot.date.toDateString(); 
      if (!groups[dateKey]) {
        groups[dateKey] = { dateObj: slot.date, slots: [] };
      }
      groups[dateKey].slots.push(slot);
      return groups;
    }, {});

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Time Slot Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- CARD 1: ADD NEW SLOT --- */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Time Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return date < yesterday;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button onClick={handleAddSlot} disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Adding..." : "Add Time Slot"}
            </Button>
          </CardContent>
        </Card>

        {/* --- CARD 2: CURRENT SELECTED DAY SLOTS --- */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Selected Date Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-primary">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                  {getCurrentDaySlots().length > 0 ? (
                    getCurrentDaySlots().map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-medium font-mono text-lg">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <Badge variant={!slot.isBooked ? "default" : "secondary"}>
                            {!slot.isBooked ? "Available" : "Booked"}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Clock className="h-8 w-8 mb-2 opacity-20" />
                      <p>No slots found for this date</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <CalendarIcon className="h-10 w-10 mb-3 opacity-20" />
                <p>Select a date to view slots</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- CARD 3: UPCOMING SLOTS ACCORDION --- */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Upcoming Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedUpcomingSlots).length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {Object.entries(groupedUpcomingSlots).map(([key, group]) => (
                <AccordionItem key={key} value={key} className="border border-border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-lg">
                          {format(group.dateObj, "MMMM d, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {format(group.dateObj, "EEEE")}
                        </span>
                      </div>
                      <Badge variant="outline" className="ml-2 font-normal">
                        {group.slots.length} Slots
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {group.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                          <div className="flex items-center gap-3">
                            <span className="font-medium font-mono">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <Badge className="text-xs h-5" variant={!slot.isBooked ? "default" : "secondary"}>
                              {!slot.isBooked ? "Open" : "Booked"}
                            </Badge>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveSlot(slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No upcoming time slots available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
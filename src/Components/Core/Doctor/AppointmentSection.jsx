import { useState, useEffect } from "react";
import { 
  Calendar, Clock, User, Phone, CheckCircle, XCircle, 
  FileText, Activity, Pill, Plus, Trash2, Eye
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, 
} from "../../ui/select";
import { Separator } from "../../ui/separator";
import { useToast } from "../../../hooks/use-toast";
import { useSelector } from "react-redux";

// API Services
import { fetchDoctorAppointments, updateAppointmentStatus } from "../../../services/operations/DoctorApi";
import { createVisitReport, fetchVisitReport } from "../../../services/operations/MedicalReportApi";

export default function AppointmentsSection() {
  const { token } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Create Report Modal States
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // View Report Modal States
  const [viewReportData, setViewReportData] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { toast } = useToast();

  // --- 1. Load Data ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (token) {
        const data = await fetchDoctorAppointments(token);
        if (data) setAppointments(data);
      }
      setLoading(false);
    };
    loadData();
  }, [token]);

  // --- 2. Handle Status Updates ---
  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "Completed") {
      const appt = appointments.find(a => a._id === id);
      setSelectedAppt(appt);
      setIsReportOpen(true);
      return;
    }

    try {
      await updateAppointmentStatus(token, { appointmentId: id, status: newStatus });
      setAppointments(prev => prev.map(appt => 
        appt._id === id ? { ...appt, status: newStatus } : appt
      ));
      toast({ title: "Status Updated", description: `Appointment marked as ${newStatus}` });
    } catch (error) {
      console.error(error);
    }
  };

  // --- 3. Handle View Report ---
  const handleViewReport = async (appointmentId) => {
    const data = await fetchVisitReport(token, appointmentId);
    if (data) {
      setViewReportData(data);
      setIsViewOpen(true);
    }
  };

  const handleReportSuccess = (appointmentId) => {
    setAppointments(prev => prev.map(a => 
      a._id === appointmentId ? { ...a, status: "Completed" } : a
    ));
    setIsReportOpen(false);
    setSelectedAppt(null);
  };

  // --- 4. Filtering & Rendering Helpers ---
  const filteredAppointments = appointments.filter(apt => {
    // Handling nested patientDetails structure safely
    const firstName = apt.patientDetails?.firstName || "";
    const lastName = apt.patientDetails?.lastName || "";
    const email = apt.patientDetails?.email || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    
    const matchesStatus = statusFilter === "all" || apt.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed": return "default";
      case "Completed": return "default"; // Will be green via class
      case "Cancelled": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total" count={appointments.length} icon={<Calendar className="h-5 w-5"/>} />
        <StatsCard label="Scheduled" count={appointments.filter(a => a.status === "Scheduled").length} icon={<Clock className="h-5 w-5 text-blue-500"/>} />
        <StatsCard label="Completed" count={appointments.filter(a => a.status === "Completed").length} icon={<CheckCircle className="h-5 w-5 text-green-500"/>} />
        <StatsCard label="Cancelled" count={appointments.filter(a => a.status === "Cancelled").length} icon={<XCircle className="h-5 w-5 text-red-500"/>} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by patient name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">Loading schedule...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            No appointments found matching your criteria.
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <Card key={apt._id} className="shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Patient Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">
                        {apt.patientDetails?.firstName} {apt.patientDetails?.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(apt.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {apt.timeSlot}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {apt.patientDetails?.phone}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground/80 mt-1">
                        Reason: {apt.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Badge variant={getStatusColor(apt.status)} className={`flex items-center gap-1 px-3 py-1 ${apt.status === 'Completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}`}>
                      {apt.status === "Completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {apt.status}
                    </Badge>
                    
                    {/* ACTION BUTTONS */}
                    {apt.status === "Scheduled" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(apt._id, "Confirmed")}
                          variant="outline"
                          className="border-green-200 hover:bg-green-50 text-green-700"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(apt._id, "Cancelled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    
                    {/* START VISIT BUTTON */}
                    {(apt.status === "Confirmed" || apt.status === "Scheduled") && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleStatusChange(apt._id, "Completed")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Start Visit
                      </Button>
                    )}

                    {/* VIEW REPORT BUTTON */}
                    {apt.status === "Completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewReport(apt._id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* --- CREATE REPORT MODAL --- */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b bg-muted/10">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-blue-600" />
              New Visit Report: {selectedAppt?.patientDetails?.firstName}
            </DialogTitle>
          </DialogHeader>
          {selectedAppt && (
             <CreateDetailedReportForm 
                appointment={selectedAppt} 
                token={token} 
                onSuccess={() => handleReportSuccess(selectedAppt._id)}
                onCancel={() => setIsReportOpen(false)}
             />
          )}
        </DialogContent>
      </Dialog>

      {/* --- VIEW REPORT MODAL --- */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Medical Report Details
            </DialogTitle>
          </DialogHeader>
          {viewReportData && <ViewReportModal data={viewReportData} />}
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ==========================================
// SUB-COMPONENT: STATS CARD
// ==========================================
function StatsCard({ label, count, icon }) {
    return (
        <Card className="shadow-sm">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
               <p className="text-sm text-muted-foreground">{label}</p>
               <p className="text-2xl font-bold">{count}</p>
            </div>
            <div className="p-2 bg-muted/20 rounded-full">{icon}</div>
          </CardContent>
        </Card>
    )
}

// ==========================================
// SUB-COMPONENT: CREATE REPORT FORM (WRITE)
// ==========================================
function CreateDetailedReportForm({ appointment, token, onSuccess, onCancel }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    diagnosis: "",
    symptoms: appointment.symptoms || "",
    bp: "",
    weight: "",
    temperature: "",
    spo2: "",
    heartRate: "",
    doctorNotes: "",
    patientAdvice: "",
  });

  const [medicines, setMedicines] = useState([
    { medicineName: "", dosage: "", frequency: "1-0-1", duration: "5 Days", instructions: "After Food" }
  ]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMedChange = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };
  const addMed = () => setMedicines([...medicines, { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const removeMed = (idx) => setMedicines(medicines.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!formData.diagnosis) {
        toast({ title: "Required", description: "Diagnosis is mandatory.", variant: "destructive" });
        return;
    }

    setLoading(true);
    const payload = {
        appointmentId: appointment._id,
        ...formData,
        prescription: medicines.filter(m => m.medicineName.trim() !== ""),
    };

    try {
        await createVisitReport(token, payload);
        onSuccess();
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
                
                {/* Vitals */}
                <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground">
                        <Activity className="w-4 h-4" /> Vitals
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1"><Label className="text-xs">BP</Label><Input name="bp" placeholder="120/80" value={formData.bp} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">Weight</Label><Input name="weight" placeholder="70" value={formData.weight} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">Temp</Label><Input name="temperature" placeholder="98.6" value={formData.temperature} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">SpO2</Label><Input name="spo2" placeholder="98" value={formData.spo2} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">HR</Label><Input name="heartRate" placeholder="72" value={formData.heartRate} onChange={handleChange} className="h-9"/></div>
                    </div>
                </div>

                <Separator />

                {/* Clinical */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-semibold text-primary">Diagnosis *</Label>
                        <Input name="diagnosis" placeholder="e.g. Acute Bronchitis" value={formData.diagnosis} onChange={handleChange} className="border-primary/20 bg-primary/5 font-medium"/>
                    </div>
                    <div className="space-y-2">
                        <Label>Symptoms</Label>
                        <Input name="symptoms" value={formData.symptoms} onChange={handleChange} />
                    </div>
                </div>

                <Separator />

                {/* Prescription */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground"><Pill className="w-4 h-4" /> Prescription</h3>
                        <Button variant="outline" size="sm" onClick={addMed} className="h-8"><Plus className="w-3 h-3 mr-1"/> Add Drug</Button>
                    </div>
                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
                            <div className="col-span-4">Medicine</div>
                            <div className="col-span-2">Dosage</div>
                            <div className="col-span-2">Freq</div>
                            <div className="col-span-2">Duration</div>
                            <div className="col-span-2">Instr.</div>
                        </div>
                        {medicines.map((med, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded-md group">
                                <div className="col-span-4"><Input placeholder="Name" value={med.medicineName} onChange={(e) => handleMedChange(idx, "medicineName", e.target.value)} className="h-8 bg-transparent"/></div>
                                <div className="col-span-2"><Input placeholder="Dose" value={med.dosage} onChange={(e) => handleMedChange(idx, "dosage", e.target.value)} className="h-8 bg-transparent"/></div>
                                <div className="col-span-2">
                                     <Select value={med.frequency} onValueChange={(val) => handleMedChange(idx, "frequency", val)}>
                                        <SelectTrigger className="h-8 bg-transparent"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-0-0">1-0-0</SelectItem>
                                            <SelectItem value="1-0-1">1-0-1</SelectItem>
                                            <SelectItem value="1-1-1">1-1-1</SelectItem>
                                            <SelectItem value="SOS">SOS</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2"><Input placeholder="Dur" value={med.duration} onChange={(e) => handleMedChange(idx, "duration", e.target.value)} className="h-8 bg-transparent"/></div>
                                <div className="col-span-2 flex gap-1">
                                    <Input placeholder="Note" value={med.instructions} onChange={(e) => handleMedChange(idx, "instructions", e.target.value)} className="h-8 bg-transparent"/>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeMed(idx)}><Trash2 className="w-3 h-3" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Notes */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>Private Notes</Label><Textarea name="doctorNotes" rows={3} value={formData.doctorNotes} onChange={handleChange} className="bg-yellow-50/50"/></div>
                    <div className="space-y-2"><Label>Patient Advice</Label><Textarea name="patientAdvice" rows={3} value={formData.patientAdvice} onChange={handleChange}/></div>
                </div>
            </div>
        </ScrollArea>
        <div className="p-4 border-t bg-muted/10 flex justify-between">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">{loading ? "Saving..." : "Generate Report"}</Button>
        </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: VIEW REPORT MODAL (READ ONLY)
// ==========================================
function ViewReportModal({ data }) {
    if (!data) return null;

    return (
        <div className="space-y-6 p-1">
            {/* Header Info */}
            <div className="flex justify-between bg-muted/20 p-4 rounded-lg">
                <div>
                    <p className="text-xs text-muted-foreground uppercase">Patient</p>
                    <p className="font-semibold">{data.patientDetails?.name}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground uppercase">Date</p>
                    <p className="font-semibold">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Vitals */}
            <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Activity className="w-4 h-4"/> Vitals</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center">
                    <div className="border p-2 rounded"><p className="text-xs text-muted-foreground">BP</p><p className="font-medium">{data.vitalSigns?.bp || "--"}</p></div>
                    <div className="border p-2 rounded"><p className="text-xs text-muted-foreground">Weight</p><p className="font-medium">{data.vitalSigns?.weight || "--"}</p></div>
                    <div className="border p-2 rounded"><p className="text-xs text-muted-foreground">Temp</p><p className="font-medium">{data.vitalSigns?.temperature || "--"}</p></div>
                    <div className="border p-2 rounded"><p className="text-xs text-muted-foreground">SpO2</p><p className="font-medium">{data.vitalSigns?.spo2 || "--"}</p></div>
                    <div className="border p-2 rounded"><p className="text-xs text-muted-foreground">HR</p><p className="font-medium">{data.vitalSigns?.heartRate || "--"}</p></div>
                </div>
            </div>

            <Separator />

            {/* Diagnosis */}
            <div>
                <h4 className="font-semibold text-primary mb-1">Diagnosis</h4>
                <p className="text-lg font-medium">{data.diagnosis}</p>
                <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Symptoms:</span> {data.symptoms}</p>
            </div>

            <Separator />

            {/* Prescription */}
            <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Pill className="w-4 h-4"/> Prescription</h4>
                <div className="space-y-2">
                    {data.prescription?.length > 0 ? (
                        data.prescription.map((med, i) => (
                            <div key={i} className="flex justify-between items-center bg-muted/10 p-3 rounded border text-sm">
                                <span className="font-semibold w-1/3">{med.medicineName}</span>
                                <Badge variant="outline">{med.dosage}</Badge>
                                <Badge variant="secondary">{med.frequency}</Badge>
                                <span className="text-muted-foreground text-xs">{med.duration}</span>
                                <span className="italic text-xs text-muted-foreground">{med.instructions}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No medicines prescribed.</p>
                    )}
                </div>
            </div>

            {/* Notes */}
            {data.doctorNotes && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">Private Notes</h4>
                    <p className="text-sm text-yellow-700">{data.doctorNotes}</p>
                </div>
            )}
        </div>
    )
}
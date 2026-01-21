import { useState, useEffect, useRef } from "react";
import { 
  Calendar, Clock, User, Phone, CheckCircle, XCircle, 
  FileText, Activity, Pill, Plus, Trash2, Eye, Edit, 
  Upload, Paperclip, Download, ExternalLink, X 
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Separator } from "../../ui/separator";
import { useToast } from "../../../hooks/use-toast";
import { useSelector } from "react-redux";

import { fetchDoctorAppointments, updateAppointmentStatus } from "../../../services/operations/DoctorApi";
import { createVisitReport, fetchVisitReport, updateVisitReport } from "../../../services/operations/MedicalReportApi";

export default function AppointmentsSection() {
  const { token } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingReportData, setExistingReportData] = useState(null);

  const [viewReportData, setViewReportData] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { toast } = useToast();

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

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "Completed") {
      const appt = appointments.find(a => a._id === id);
      openReportModal(appt, false); 
      return;
    }
    try {
      await updateAppointmentStatus(token, { appointmentId: id, status: newStatus });
      setAppointments(prev => prev.map(appt => appt._id === id ? { ...appt, status: newStatus } : appt));
      toast({ title: "Status Updated", description: `Appointment marked as ${newStatus}` });
    } catch (error) { console.error(error); }
  };

  const openReportModal = async (appt, editMode = false) => {
    setSelectedAppt(appt);
    setIsEditMode(editMode);
    if (editMode) {
      const data = await fetchVisitReport(token, appt._id);
      if (data) { setExistingReportData(data); setIsReportOpen(true); } 
      else { toast({ title: "Error", description: "Could not fetch report.", variant: "destructive" }); }
    } else {
      setExistingReportData(null); setIsReportOpen(true);
    }
  };

  const handleViewReport = async (appointmentId) => {
    const data = await fetchVisitReport(token, appointmentId);
    if (data) { setViewReportData(data); setIsViewOpen(true); }
  };

  const handleReportSuccess = (appointmentId) => {
    setAppointments(prev => prev.map(a => a._id === appointmentId ? { ...a, status: "Completed" } : a));
    setIsReportOpen(false); setSelectedAppt(null); setExistingReportData(null); setIsEditMode(false);
  };

  const filteredAppointments = appointments.filter(apt => {
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
      case "Completed": return "default";
      case "Cancelled": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-bold text-foreground">Appointments</h1></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard label="Total" count={appointments.length} icon={<Calendar className="h-5 w-5"/>} />
        <StatsCard label="Scheduled" count={appointments.filter(a => a.status === "Scheduled").length} icon={<Clock className="h-5 w-5 text-blue-500"/>} />
        <StatsCard label="Completed" count={appointments.filter(a => a.status === "Completed").length} icon={<CheckCircle className="h-5 w-5 text-green-500"/>} />
        <StatsCard label="Cancelled" count={appointments.filter(a => a.status === "Cancelled").length} icon={<XCircle className="h-5 w-5 text-red-500"/>} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading ? <div className="text-center py-12">Loading...</div> : filteredAppointments.length === 0 ? 
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">No appointments found.</div> : (
          filteredAppointments.map((apt) => (
            <Card key={apt._id} className="shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{apt.patientDetails?.firstName} {apt.patientDetails?.lastName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(apt.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.timeSlot}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {apt.patientDetails?.phone}</div>
                      </div>
                      <p className="text-sm font-medium mt-1">Reason: {apt.reason}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Badge variant={getStatusColor(apt.status)} className={apt.status === 'Completed' ? 'bg-green-100 text-green-700' : ''}>
                      {apt.status === "Completed" && <CheckCircle className="h-3 w-3 mr-1" />} {apt.status}
                    </Badge>
                    
                    {apt.status === "Scheduled" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStatusChange(apt._id, "Confirmed")} variant="outline" className="border-green-200 text-green-700">Confirm</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(apt._id, "Cancelled")}>Cancel</Button>
                      </div>
                    )}
                    {(apt.status === "Confirmed" || apt.status === "Scheduled") && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusChange(apt._id, "Completed")}>
                        <FileText className="w-4 h-4 mr-2" /> Start Visit
                      </Button>
                    )}
                    {apt.status === "Completed" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewReport(apt._id)}><Eye className="w-4 h-4 mr-2" /> View</Button>
                        <Button size="sm" variant="secondary" onClick={() => openReportModal(apt, true)}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL (Scroll Fix: h-[90vh]) */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b bg-muted/10 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-blue-600" /> {isEditMode ? "Edit Report" : "New Report"}: {selectedAppt?.patientDetails?.firstName}
            </DialogTitle>
          </DialogHeader>
          {selectedAppt && (
             <CreateDetailedReportForm appointment={selectedAppt} token={token} isEditMode={isEditMode} initialData={existingReportData} onSuccess={() => handleReportSuccess(selectedAppt._id)} onCancel={() => setIsReportOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL (Scroll Fix: h-[90vh]) */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0"><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" /> Medical Report</DialogTitle></DialogHeader>
          <ScrollArea className="flex-1 p-6">
             {viewReportData && <ViewReportModal data={viewReportData} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ label, count, icon }) {
    return (
        <Card className="shadow-sm"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{count}</p></div><div className="p-2 bg-muted/20 rounded-full">{icon}</div></CardContent></Card>
    )
}

function CreateDetailedReportForm({ appointment, token, onSuccess, onCancel, isEditMode, initialData }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    diagnosis: initialData?.diagnosis || "",
    symptoms: initialData?.symptoms || appointment.symptoms || "",
    bp: initialData?.vitalSigns?.bp || "",
    weight: initialData?.vitalSigns?.weight || "",
    temperature: initialData?.vitalSigns?.temperature || "",
    spo2: initialData?.vitalSigns?.spo2 || "",
    heartRate: initialData?.vitalSigns?.heartRate || "",
    doctorNotes: initialData?.doctorNotes || "",
    patientAdvice: initialData?.patientAdvice || "",
  });

  const [medicines, setMedicines] = useState(initialData?.prescription && initialData.prescription.length > 0 ? initialData.prescription : [{ medicineName: "", dosage: "", frequency: "1-0-1", duration: "5 Days", instructions: "After Food" }]);
  const [labFiles, setLabFiles] = useState([]); // New Files
  const [existingLabReports, setExistingLabReports] = useState(initialData?.labReports || []); // Old Files
  const [deletedLabReports, setDeletedLabReports] = useState([]); // URLs to delete

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleMedChange = (idx, field, val) => { const updated = [...medicines]; updated[idx][field] = val; setMedicines(updated); };
  const addMed = () => setMedicines([...medicines, { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const removeMed = (idx) => setMedicines(medicines.filter((_, i) => i !== idx));

  // File Logic
  const handleFileChange = (e) => { if (e.target.files) setLabFiles(prev => [...prev, ...Array.from(e.target.files)]); };
  const removeNewFile = (index) => setLabFiles(prev => prev.filter((_, i) => i !== index));
  
  // Remove Existing File (Add URL to deleted list)
  const removeExistingFile = (fileUrl) => {
    setExistingLabReports(prev => prev.filter(f => f.url !== fileUrl));
    setDeletedLabReports(prev => [...prev, fileUrl]);
  };

  const handleSubmit = async () => {
    if (!formData.diagnosis) { toast({ title: "Required", description: "Diagnosis is mandatory.", variant: "destructive" }); return; }
    setLoading(true);
    const data = new FormData();
    data.append("appointmentId", appointment._id);
    if (isEditMode && initialData?._id) data.append("reportId", initialData._id);
    
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    const validMeds = medicines.filter(m => m.medicineName.trim() !== "");
    data.append("prescription", JSON.stringify(validMeds));
    
    // Add deleted files list
    if (deletedLabReports.length > 0) {
        data.append("deletedLabReports", JSON.stringify(deletedLabReports));
    }

    labFiles.forEach((file) => data.append("labReports", file));

    try {
        if (isEditMode) { await updateVisitReport(token, data); toast({ title: "Success", description: "Report updated." }); } 
        else { await createVisitReport(token, data); toast({ title: "Success", description: "Report created." }); }
        onSuccess();
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
        <ScrollArea className="flex-1 p-6">
            <div className="space-y-8 pb-10">
                {/* Vitals */}
                <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground"><Activity className="w-4 h-4"/> Vitals</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1"><Label className="text-xs">BP</Label><Input name="bp" placeholder="120/80" value={formData.bp} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">Weight</Label><Input name="weight" placeholder="kg" value={formData.weight} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">Temp</Label><Input name="temperature" placeholder="°F" value={formData.temperature} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">SpO2</Label><Input name="spo2" placeholder="%" value={formData.spo2} onChange={handleChange} className="h-9"/></div>
                        <div className="space-y-1"><Label className="text-xs">HR</Label><Input name="heartRate" placeholder="bpm" value={formData.heartRate} onChange={handleChange} className="h-9"/></div>
                    </div>
                </div>
                <Separator />
                
                {/* Clinical */}
                <div className="grid grid-cols-2 gap-6">
                    <div><Label>Diagnosis *</Label><Input name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="border-primary/20 bg-primary/5 font-medium mt-1"/></div>
                    <div><Label>Symptoms</Label><Input name="symptoms" value={formData.symptoms} onChange={handleChange} className="mt-1" /></div>
                </div>
                <Separator />
                
                {/* Files Section */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground"><Paperclip className="w-4 h-4"/> Lab Reports</h3>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()} className="h-8">
                            <Plus className="w-4 h-4 mr-2"/> Add File
                        </Button>
                        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"/>
                    </div>

                    {/* Show Existing Files (Edit Mode) */}
                    {isEditMode && existingLabReports.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {existingLabReports.map((file, idx) => (
                                <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2">
                                    <span className="max-w-[150px] truncate">{file.originalName || `File ${idx+1}`}</span>
                                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-red-200 hover:text-red-600" onClick={() => removeExistingFile(file.url)}>
                                        <X className="w-3 h-3"/>
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Show New Files */}
                    {labFiles.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {labFiles.map((file, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 border rounded bg-muted/20 text-sm">
                                    <span className="truncate max-w-[85%]">{file.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-100" onClick={() => removeNewFile(idx)}><X className="w-4 h-4"/></Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Separator />

                {/* Prescription */}
                <div className="space-y-4">
                    <div className="flex justify-between"><Label>Prescription</Label><Button variant="outline" size="sm" onClick={addMed}><Plus className="w-3 h-3"/> Add Drug</Button></div>
                    {medicines.map((med, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2 rounded">
                            <div className="col-span-4"><Input placeholder="Name" value={med.medicineName} onChange={(e)=>handleMedChange(idx,"medicineName",e.target.value)} className="h-8 bg-transparent"/></div>
                            <div className="col-span-2"><Input placeholder="Dose" value={med.dosage} onChange={(e)=>handleMedChange(idx,"dosage",e.target.value)} className="h-8 bg-transparent"/></div>
                            <div className="col-span-2"><Input placeholder="Freq" value={med.frequency} onChange={(e)=>handleMedChange(idx,"frequency",e.target.value)} className="h-8 bg-transparent"/></div>
                            <div className="col-span-2"><Input placeholder="Dur" value={med.duration} onChange={(e)=>handleMedChange(idx,"duration",e.target.value)} className="h-8 bg-transparent"/></div>
                            <div className="col-span-2 flex"><Input placeholder="Instr" value={med.instructions} onChange={(e)=>handleMedChange(idx,"instructions",e.target.value)} className="h-8 bg-transparent"/><Button variant="ghost" size="icon" onClick={()=>removeMed(idx)} className="text-red-500"><Trash2 className="w-3 h-3"/></Button></div>
                        </div>
                    ))}
                </div>
                <Separator />
                
                {/* Notes */}
                <div className="grid grid-cols-2 gap-6">
                    <div><Label>Private Notes</Label><Textarea name="doctorNotes" value={formData.doctorNotes} onChange={handleChange} className="bg-yellow-50/50 mt-1"/></div>
                    <div><Label>Advice</Label><Textarea name="patientAdvice" value={formData.patientAdvice} onChange={handleChange} className="mt-1"/></div>
                </div>
            </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background shrink-0 flex justify-between">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-green-600">{loading ? "Saving..." : isEditMode ? "Update Report" : "Generate Report"}</Button>
        </div>
    </div>
  );
}

// ==========================================
// VIEW MODAL (READ ONLY)
// ==========================================
function ViewReportModal({ data }) {
    const downloadFile = async (url, filename) => {
        try {
            const response = await fetch(url);
            if(!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed, trying fallback:", error);
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-6 pb-4">
            {/* Header Info */}
            <div className="flex justify-between bg-muted/20 p-4 rounded-lg">
                <div><p className="text-xs text-muted-foreground uppercase">Patient</p><p className="font-semibold">{data.patientDetails?.name}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase">Date</p><p className="font-semibold">{new Date(data.createdAt).toLocaleDateString()}</p></div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-5 gap-2 text-center">
                {Object.entries(data.vitalSigns || {}).map(([key, val]) => (
                    val && <div key={key} className="border p-2 rounded"><p className="text-xs text-muted-foreground uppercase">{key}</p><p className="font-medium">{val}</p></div>
                ))}
            </div>
            
            <Separator />
            
            {/* Diagnosis */}
            <div><h4 className="font-semibold text-primary mb-1">Diagnosis</h4><p className="text-lg font-medium">{data.diagnosis}</p><p className="text-sm text-muted-foreground">{data.symptoms}</p></div>
            
            <Separator />
            
            {/* Lab Reports */}
            <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Paperclip className="w-4 h-4"/> Lab Reports</h4>
                {data.labReports?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.labReports.map((file, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded bg-muted/10">
                                <div className="flex items-center gap-2 overflow-hidden"><FileText className="w-4 h-4 text-blue-500 shrink-0"/><span className="text-sm truncate font-medium">{file.originalName}</span></div>
                                <div className="flex gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 text-blue-600" onClick={() => window.open(file.url, '_blank')} title="View"><ExternalLink className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-100 text-green-600" onClick={() => downloadFile(file.url, file.originalName)} title="Download"><Download className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-muted-foreground italic">No files attached.</p>}
            </div>
            
            <Separator />
            
            {/* Prescription */}
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Pill className="w-4 h-4"/> Prescription</h4>
                {data.prescription?.map((med, i) => (
                    <div key={i} className="flex justify-between bg-muted/10 p-2 rounded text-sm"><span className="font-semibold w-1/3">{med.medicineName}</span><span className="text-muted-foreground">{med.dosage} | {med.frequency} | {med.duration} | <span className="italic">{med.instructions}</span></span></div>
                ))}
            </div>

            {/* NEW: Patient Advice Section */}
            {data.patientAdvice && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Advice to Patient</h4>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{data.patientAdvice}</p>
                </div>
            )}

            {/* Private Notes Section */}
            {data.doctorNotes && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mt-2">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">Private Notes</h4>
                    <p className="text-sm text-yellow-700 whitespace-pre-wrap">{data.doctorNotes}</p>
                </div>
            )}
        </div>
    )
}
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  Pill,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Search,
  Paperclip,
  Download,
  X,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { ScrollArea } from "../../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Separator } from "../../ui/separator";
import { useToast } from "../../../hooks/use-toast";
import { useSelector } from "react-redux";

import { fetchDoctorAppointments, updateAppointmentStatus } from "../../../services/operations/DoctorApi";
import { createVisitReport, fetchVisitReport, updateVisitReport } from "../../../services/operations/MedicalReportApi";

export default function AppointmentSection() {
  const { token } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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
        try {
          const data = await fetchDoctorAppointments(token);
          if (data) setAppointments(data);
        } catch (error) {
          console.error("Fetch Error", error);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateAppointmentStatus(token, { appointmentId: id, status: newStatus });
      setAppointments((prev) => prev.map((appt) => (appt._id === id ? { ...appt, status: newStatus } : appt)));
      toast({ title: "Status Updated", description: `Appointment marked as ${newStatus}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const handleInitiateEncounter = (appt) => {
    setSelectedAppt(appt);
    setExistingReportData(null);
    setIsEditMode(false);
    setIsReportOpen(true);
  };

  const handleEditReport = async (appt) => {
    setSelectedAppt(appt);
    setIsEditMode(true);
    const data = await fetchVisitReport(token, appt._id);
    if (data) {
      setExistingReportData(data);
      setIsReportOpen(true);
    } else {
      toast({ title: "Error", description: "Could not fetch report" });
    }
  };

  const handleReportSuccess = (appointmentId) => {
    setAppointments((prev) => prev.map((a) => (a._id === appointmentId ? { ...a, status: "Completed" } : a)));
    setIsReportOpen(false);
    toast({ title: "Encounter Completed", description: "Report generated." });
  };

  const handleViewReport = async (appointmentId) => {
    const data = await fetchVisitReport(token, appointmentId);
    if (data) {
      setViewReportData(data);
      setIsViewOpen(true);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const fullName = `${apt.patientDetails?.firstName || ""} ${apt.patientDetails?.lastName || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const activeQueue = filteredAppointments.filter((a) => !["Completed", "Cancelled"].includes(a.status));
  const historyQueue = filteredAppointments.filter((a) => ["Completed", "Cancelled"].includes(a.status));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Consultations</h1>
        <p className="text-slate-500">Manage patient queue and clinical encounters.</p>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="queue">Active Queue ({activeQueue.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyQueue.length})</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 bg-white"
            />
          </div>
        </div>

        <TabsContent value="queue" className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading queue...</div>
          ) : activeQueue.length === 0 ? (
            <EmptyState message="No active appointments in queue." />
          ) : (
            activeQueue.map((apt) => (
              <AppointmentCard
                key={apt._id}
                appt={apt}
                onStatusChange={handleStatusChange}
                onInitiate={() => handleInitiateEncounter(apt)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading history...</div>
          ) : historyQueue.length === 0 ? (
            <EmptyState message="No history records found." />
          ) : (
            historyQueue.map((apt) => (
              <AppointmentCard
                key={apt._id}
                appt={apt}
                isHistory={true}
                onView={() => handleViewReport(apt._id)}
                onEdit={() => handleEditReport(apt)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-5 border-b bg-slate-50 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="h-5 w-5 text-blue-600" />{" "}
              {isEditMode ? "Edit Clinical Report" : "New Clinical Encounter"}
            </DialogTitle>
          </DialogHeader>

          {selectedAppt && (
            <CreateDetailedReportForm
              appointment={selectedAppt}
              token={token}
              isEditMode={isEditMode}
              initialData={existingReportData}
              onSuccess={() => handleReportSuccess(selectedAppt._id)}
              onCancel={() => setIsReportOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-5 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" /> Clinical Record
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {viewReportData && <ViewReportModal data={viewReportData} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppointmentCard({ appt, onStatusChange, onInitiate, isHistory, onView, onEdit }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
            Confirmed
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">
            Pending
          </Badge>
        );
      case "Scheduled":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
      case "Completed":
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300">Completed</Badge>;
      case "Cancelled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-slate-200 bg-white">
      <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold border border-slate-200">
            {appt.patientDetails?.firstName?.[0]}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">
              {appt.patientDetails?.firstName} {appt.patientDetails?.lastName}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(appt.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {appt.timeSlot}
              </span>
              {appt.reason && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 font-medium">{appt.reason}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 min-w-[160px]">
          {getStatusBadge(appt.status)}

          {!isHistory ? (
            <div className="flex gap-2">
              {(appt.status === "Scheduled" || appt.status === "Pending") && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => onStatusChange(appt._id, "Confirmed")}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onStatusChange(appt._id, "Cancelled")}
                  >
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </>
              )}

              {appt.status === "Confirmed" && (
                <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={onInitiate}>
                  <Activity className="w-3 h-3 mr-2" /> Initiate Encounter
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              {appt.status === "Completed" && (
                <>
                  <Button size="sm" variant="outline" className="h-8" onClick={onView}>
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={onEdit}>
                    <Edit3 className="w-3 h-3 mr-1" /> Edit
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
      <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
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

  const [medicines, setMedicines] = useState(
    initialData?.prescription && initialData.prescription.length > 0
      ? initialData.prescription
      : [
          {
            medicineName: "",
            dosage: "",
            frequency: "1-0-1",
            duration: "5 Days",
            instructions: "After Food",
          },
        ]
  );

  const [labFiles, setLabFiles] = useState([]);
  const [existingLabReports, setExistingLabReports] = useState(initialData?.labReports || []);
  const [deletedLabReports, setDeletedLabReports] = useState([]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMedChange = (idx, field, val) => {
    const updated = [...medicines];
    updated[idx][field] = val;
    setMedicines(updated);
  };

  const addMed = () =>
    setMedicines([
      ...medicines,
      { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);

  const removeMed = (idx) => setMedicines(medicines.filter((_, i) => i !== idx));

  const handleFileChange = (e) => {
    if (e.target.files) setLabFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeNewFile = (index) => setLabFiles((prev) => prev.filter((_, i) => i !== index));

  const removeExistingFile = (fileUrl) => {
    setExistingLabReports((prev) => prev.filter((f) => f.url !== fileUrl));
    setDeletedLabReports((prev) => [...prev, fileUrl]);
  };

  const handleSubmit = async () => {
    if (!formData.diagnosis) {
      toast({
        title: "Required",
        description: "Primary Diagnosis is mandatory.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append("appointmentId", appointment._id);
    if (isEditMode && initialData?._id) data.append("reportId", initialData._id);

    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    const validMeds = medicines.filter((m) => m.medicineName.trim() !== "");
    data.append("prescription", JSON.stringify(validMeds));
    if (deletedLabReports.length > 0) data.append("deletedLabReports", JSON.stringify(deletedLabReports));
    labFiles.forEach((file) => data.append("labReports", file));

    try {
      if (isEditMode) await updateVisitReport(token, data);
      else await createVisitReport(token, data);
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
        <div className="space-y-8 pb-10">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Vitals & Anthropometry
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">BP (mmHg)</Label>
                <Input name="bp" placeholder="120/80" value={formData.bp} onChange={handleChange} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Weight (kg)</Label>
                <Input name="weight" placeholder="70" value={formData.weight} onChange={handleChange} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Temp (°F)</Label>
                <Input
                  name="temperature"
                  placeholder="98.6"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">SpO2 (%)</Label>
                <Input name="spo2" placeholder="98" value={formData.spo2} onChange={handleChange} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Pulse (bpm)</Label>
                <Input
                  name="heartRate"
                  placeholder="72"
                  value={formData.heartRate}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-700">
                Primary Diagnosis <span className="text-red-500">*</span>
              </Label>
              <Input
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="border-blue-200 bg-blue-50/50 font-medium mt-1.5"
                placeholder="e.g. Acute Bronchitis"
              />
            </div>

            <div>
              <Label className="text-slate-700">Presenting Symptoms</Label>
              <Input
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                className="mt-1.5"
                placeholder="e.g. Cough, Fever"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Investigations
              </h3>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current.click()}
                className="h-8 border-dashed"
              >
                <Plus className="w-3 h-3 mr-2" /> Attach
              </Button>

              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {isEditMode &&
                existingLabReports.map((file, idx) => (
                  <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2 bg-slate-100">
                    <span className="max-w-[150px] truncate text-slate-600">{file.originalName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500"
                      onClick={() => removeExistingFile(file.url)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}

              {labFiles.map((file, idx) => (
                <Badge
                  key={`new-${idx}`}
                  variant="outline"
                  className="pl-3 pr-1 py-1 flex items-center gap-2 border-blue-200 bg-blue-50 text-blue-700"
                >
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full hover:bg-blue-100 text-blue-500"
                    onClick={() => removeNewFile(idx)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-slate-700">Prescription</Label>
              <Button variant="ghost" size="sm" onClick={addMed} className="text-blue-600 hover:bg-blue-50">
                <Plus className="w-3 h-3 mr-1" /> Add Drug
              </Button>
            </div>

            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100"
              >
                <div className="col-span-4">
                  <Input
                    placeholder="Drug Name"
                    value={med.medicineName}
                    onChange={(e) => handleMedChange(idx, "medicineName", e.target.value)}
                    className="h-8 bg-white border-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Dose"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(idx, "dosage", e.target.value)}
                    className="h-8 bg-white border-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Freq"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(idx, "frequency", e.target.value)}
                    className="h-8 bg-white border-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Dur"
                    value={med.duration}
                    onChange={(e) => handleMedChange(idx, "duration", e.target.value)}
                    className="h-8 bg-white border-slate-200"
                  />
                </div>
                <div className="col-span-2 flex gap-1">
                  <Input
                    placeholder="Instr"
                    value={med.instructions}
                    onChange={(e) => handleMedChange(idx, "instructions", e.target.value)}
                    className="h-8 bg-white border-slate-200"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMed(idx)}
                    className="h-8 w-8 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-700">Private Notes</Label>
              <Textarea
                name="doctorNotes"
                value={formData.doctorNotes}
                onChange={handleChange}
                className="bg-yellow-50/30 border-yellow-100 mt-1.5 focus:border-yellow-300"
                placeholder="Internal use only..."
              />
            </div>
            <div>
              <Label className="text-slate-700">Patient Advice</Label>
              <Textarea
                name="patientAdvice"
                value={formData.patientAdvice}
                onChange={handleChange}
                className="mt-1.5"
                placeholder="Follow-up instructions..."
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white shrink-0 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
        >
          {loading ? "Processing..." : isEditMode ? "Update Record" : "Finalize"}
        </Button>
      </div>
    </div>
  );
}

// ... all your imports remain same ...

// ============================================================================
// SUB-COMPONENT: VIEW REPORT MODAL (FINAL FIXED)
// ============================================================================
function ViewReportModal({ data }) {
  const viewFile = (url) => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};


  const downloadFile = async (url, originalName) => {
  if (!url) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = originalName || "download";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // fallback if browser blocks fetch/download
    window.open(url, "_blank", "noopener,noreferrer");
  }
};


  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="flex justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div>
          <p className="text-xs text-slate-400 uppercase font-bold">Patient</p>
          <p className="font-bold text-slate-800">{data.patientDetails?.name || "N/A"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase font-bold">Date</p>
          <p className="font-semibold text-slate-800">
            {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
        {Object.entries(data.vitalSigns || {}).map(([key, val]) =>
          val ? (
            <div key={key} className="border border-slate-100 p-2 rounded bg-white shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase font-bold">{key}</p>
              <p className="font-bold text-slate-700">{val}</p>
            </div>
          ) : null
        )}
      </div>

      <Separator />

      {/* Diagnosis */}
      <div>
        <h4 className="font-bold text-slate-900 mb-1">Diagnosis</h4>
        <p className="text-lg text-blue-800 font-medium">{data.diagnosis}</p>
        {data.symptoms && <p className="text-sm text-slate-500 mt-1">Symptoms: {data.symptoms}</p>}
      </div>

      <Separator />

      {/* Medications */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Pill className="w-4 h-4 text-blue-500" /> Medications
        </h4>

        {data.prescription?.length > 0 ? (
          data.prescription.map((med, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:justify-between bg-slate-50 p-3 rounded-md text-sm border border-slate-100 mb-2"
            >
              <span className="font-bold text-slate-700 w-full sm:w-1/3">{med.medicineName}</span>
              <div className="flex gap-3 text-slate-600 mt-1 sm:mt-0">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-mono">
                  {med.dosage}
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-mono">
                  {med.frequency}
                </span>
                <span className="text-xs pt-0.5">{med.duration}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 italic">No medications prescribed.</p>
        )}
      </div>

      {/* Attachments */}
      {data.labReports?.length > 0 && (
        <div>
          <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-orange-500" /> Lab Reports
          </h4>

          <div className="flex flex-wrap gap-3">
            {data.labReports.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-md border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col">
                  <span
                    className="max-w-[180px] truncate text-sm font-medium text-slate-700"
                    title={file.originalName}
                  >
                    {file.originalName}
                  </span>

                  <span className="text-[10px] text-slate-400 uppercase">
                    {file.url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? "Image" : "Document"}
                  </span>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-100 ml-2 pl-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    onClick={() => viewFile(file.url)}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-full"
                    onClick={() => downloadFile(file.url, file.originalName)}

                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advice */}
      {data.patientAdvice && (
        <div className="bg-blue-50/50 p-4 rounded-md border border-blue-100 mt-4">
          <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Patient Advice
          </h4>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{data.patientAdvice}</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Calendar, Clock, MapPin, Plus, Search, 
  FileText, Activity, Pill, Download, ExternalLink, Paperclip, ChevronRight, Filter 
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// API
import { fetchPatientAppointments } from "../../../services/operations/PatientApi";
import { fetchVisitReport } from "../../../services/operations/MedicalReportApi";

export default function PatientAppointmentsSection() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // UI States
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // --- 1. Fetch Data ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (token) {
        const data = await fetchPatientAppointments(token);
        if (data) setAppointments(data);
      }
      setLoading(false);
    };
    loadData();
  }, [token]);

  // --- 2. Action Handlers ---
  const handleViewDetails = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailsOpen(true);
  };

  const handleViewReport = async (apptId) => {
    setIsReportLoading(true);
    try {
      const data = await fetchVisitReport(token, apptId);
      if (data) {
        setReportData(data);
        setIsReportOpen(true);
      } else {
        toast.error("Medical report pending generation.");
      }
    } catch (error) {
      console.error("Report Fetch Error", error);
      toast.error("Unable to retrieve report.");
    } finally {
      setIsReportLoading(false);
    }
  };

  // --- 3. Status Badge Logic ---
  const getStatusConfig = (status) => {
    switch (status) {
      case "Scheduled": return { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Scheduled" };
      case "Confirmed": return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Confirmed" };
      case "Completed": return { color: "bg-slate-100 text-slate-600 border-slate-200", label: "Visit Completed" };
      case "Cancelled": return { color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" };
      default: return { color: "bg-gray-50 text-gray-600", label: status };
    }
  };

  // --- 4. Filtering Logic ---
  const filteredList = appointments.filter(appt =>
    appt.doctor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.doctor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcoming = filteredList.filter(a => a.status !== "Completed" && a.status !== "Cancelled");
  const history = filteredList.filter(a => a.status === "Completed" || a.status === "Cancelled");

  return (
    <div className="space-y-8">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Consultations</h1>
            <p className="text-slate-500 mt-1">Manage your appointments and view visit history.</p>
        </div>
        <Button onClick={() => navigate("/find-doctor")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Filter by doctor name, specialty, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-slate-200 focus:ring-emerald-500"
        />
      </div>

      {/* --- Upcoming Section --- */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600"/> Scheduled Consultations
        </h2>
        
        {loading ? <SkeletonLoader /> : upcoming.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {upcoming.map((appt) => (
                <AppointmentCard 
                  key={appt._id} 
                  appointment={appt} 
                  onDetails={() => handleViewDetails(appt)}
                  statusConfig={getStatusConfig}
                />
              ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-500">No upcoming appointments found.</p>
            </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* --- History Section --- */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-500"/> Previous Visits
        </h2>

        {loading ? <SkeletonLoader /> : history.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {history.map((appt) => (
                <AppointmentCard 
                  key={appt._id} 
                  appointment={appt} 
                  onDetails={() => handleViewDetails(appt)}
                  onReport={() => handleViewReport(appt._id)}
                  statusConfig={getStatusConfig}
                  isHistory={true}
                  loadingReport={isReportLoading}
                />
              ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-500">No consultation history available.</p>
            </div>
        )}
      </div>

      {/* MODALS */}
      <AppointmentDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        appointment={selectedAppointment}
        statusConfig={getStatusConfig}
      />

      <ReportViewerModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        data={reportData}
      />
    </div>
  );
}

// --- SUB-COMPONENT: CARD ---
function AppointmentCard({ appointment, onDetails, onReport, statusConfig, isHistory, loadingReport }) {
    const status = statusConfig(appointment.status);
    
    return (
        <Card className="hover:shadow-md transition-all border-slate-200">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 border-2 border-slate-100">
                        <AvatarImage src={appointment.doctor?.image} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                            {appointment.doctor?.firstName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-slate-800">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</h3>
                        <p className="text-sm text-slate-500 font-medium">{appointment.doctor?.department || "General"} • {appointment.doctor?.specialization}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Calendar className="w-3 h-3"/> {format(new Date(appointment.date), "MMM d, yyyy")}</span>
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Clock className="w-3 h-3"/> {appointment.timeSlot}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${status.color}`}>
                        {status.label}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onDetails} className="text-xs h-8">
                            View Details
                        </Button>
                        {isHistory && appointment.status === "Completed" && (
                            <Button size="sm" onClick={onReport} disabled={loadingReport} className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700">
                                {loadingReport ? "Loading..." : <><FileText className="w-3 h-3 mr-1"/> Report</>}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- SUB-COMPONENT: DETAILS MODAL ---
function AppointmentDetailsModal({ isOpen, onClose, appointment, statusConfig }) {
    if(!appointment) return null;
    const status = statusConfig(appointment.status);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Appointment Details</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded border">
                        <span className="text-sm text-slate-500">Status</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Doctor</span><span className="font-medium">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{format(new Date(appointment.date), "PPP")}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{appointment.timeSlot}</span></div>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Reason for Visit</span>
                        <p className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                            {appointment.reason || "No specific reason provided."}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- SUB-COMPONENT: REPORT VIEWER (Exported for Reuse) ---
export function ReportViewerModal({ isOpen, onClose, data }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-5 border-b bg-slate-50 flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-emerald-600"/> Medical Report
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 p-6 bg-white">
                    {data ? <ViewReportContent data={data} /> : <div className="text-center p-10">Loading...</div>}
                </ScrollArea>
                <div className="p-4 border-t bg-slate-50 flex justify-end flex-shrink-0">
                    <Button variant="outline" onClick={onClose}>Close Viewer</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- SHARED REPORT CONTENT LOGIC ---
export function ViewReportContent({ data }) {
    
    // 1. Download Logic (Forces download by creating blob)
    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'medical-report-file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed, opening in new tab instead", error);
            window.open(url, '_blank');
        }
    };

    // 2. View Logic (Opens in new Tab)
    const handleView = (url) => {
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="flex justify-between items-start bg-slate-50 p-4 rounded-lg border">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Doctor</p>
                    <p className="font-bold text-lg text-slate-800">Dr. {data.doctor?.firstName} {data.doctor?.lastName}</p>
                    <p className="text-sm text-slate-500">{data.doctor?.department}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold">Date of Visit</p>
                    <p className="font-medium text-slate-800">{new Date(data.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Vitals */}
            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-red-500"/> Clinical Vitals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border p-3 rounded bg-white text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Blood Pressure</span>
                        <p className="text-lg font-semibold text-slate-800">{data.vitalSigns?.bp || "--"}</p>
                    </div>
                    <div className="border p-3 rounded bg-white text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Pulse</span>
                        <p className="text-lg font-semibold text-slate-800">{data.vitalSigns?.pulse || "--"} <span className="text-xs font-normal">bpm</span></p>
                    </div>
                    <div className="border p-3 rounded bg-white text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Temp</span>
                        <p className="text-lg font-semibold text-slate-800">{data.vitalSigns?.temp || "--"} <span className="text-xs font-normal">°F</span></p>
                    </div>
                    <div className="border p-3 rounded bg-white text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Weight</span>
                        <p className="text-lg font-semibold text-slate-800">{data.vitalSigns?.weight || "--"} <span className="text-xs font-normal">kg</span></p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Diagnosis */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Clinical Diagnosis</h4>
                    <p className="text-slate-700 bg-red-50/50 p-3 rounded border border-red-100">{data.diagnosis}</p>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Symptoms Presented</h4>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">{data.symptoms}</p>
                </div>
            </div>

            {/* Prescription */}
            <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Pill className="w-4 h-4 text-blue-500"/> Medications Prescribed</h4>
                {data.prescription?.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Medicine</th>
                                    <th className="px-4 py-2 text-left">Dosage</th>
                                    <th className="px-4 py-2 text-left">Duration</th>
                                    <th className="px-4 py-2 text-left">Instructions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.prescription.map((med, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 font-medium">{med.medicineName}</td>
                                        <td className="px-4 py-2">{med.dosage} ({med.frequency})</td>
                                        <td className="px-4 py-2">{med.duration}</td>
                                        <td className="px-4 py-2 text-slate-500 italic">{med.instructions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm text-slate-500 italic">No medications prescribed.</p>}
            </div>

            {/* Attachments (Lab Reports) */}
            {data.labReports?.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Paperclip className="w-4 h-4 text-orange-500"/> Lab Reports</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.labReports.map((file, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText className="w-4 h-4 text-blue-600 shrink-0"/>
                                    <span className="text-sm font-medium truncate" title={file.originalName}>{file.originalName}</span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    {/* VIEW BUTTON */}
                                    <Button size="sm" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-100" onClick={() => handleView(file.url)} title="View File">
                                        <ExternalLink className="w-4 h-4"/>
                                    </Button>
                                    {/* DOWNLOAD BUTTON */}
                                    <Button size="sm" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-100" onClick={() => handleDownload(file.url, file.originalName)} title="Download File">
                                        <Download className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Advice */}
            {data.patientAdvice && (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-900 mb-1">Doctor's Advice / Next Steps</h4>
                    <p className="text-sm text-emerald-800 whitespace-pre-wrap">{data.patientAdvice}</p>
                </div>
            )}
        </div>
    );
}

function SkeletonLoader() {
    return <div className="space-y-3 animate-pulse"><div className="h-20 bg-slate-100 rounded"></div><div className="h-20 bg-slate-100 rounded"></div></div>
}
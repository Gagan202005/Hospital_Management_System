import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Calendar, Clock, User, MapPin, Plus, Search, 
  FileText, Activity, Pill, Download, ExternalLink, Paperclip, ChevronRight 
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

// API Services
import { fetchPatientAppointments } from "../../../services/operations/PatientApi";
import { fetchVisitReport } from "../../../services/operations/MedicalReportApi";

export default function PatientAppointmentsSection() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [selectedAppointment, setSelectedAppointment] = useState(null); // For View Details
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [reportData, setReportData] = useState(null); // For View Report
  const [isReportOpen, setIsReportOpen] = useState(false);

  // --- Load Data ---
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

  // --- Handlers ---
  const handleViewDetails = (appt) => {
    setSelectedAppointment(appt);
    setIsDetailsOpen(true);
  };

  const handleViewReport = async (apptId) => {
    const data = await fetchVisitReport(token, apptId);
    if (data) {
      setReportData(data);
      setIsReportOpen(true);
    }
  };

  // --- Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "default"; // Blue/Black
      case "Confirmed": return "default";
      case "Completed": return "secondary"; // Greenish usually
      case "Cancelled": return "destructive"; // Red
      default: return "outline";
    }
  };

  // --- Filtering ---
  const filteredAppointments = appointments.filter(appointment =>
    appointment.doctor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingAppointments = filteredAppointments.filter(apt => apt.status !== "Completed" && apt.status !== "Cancelled");
  const pastAppointments = filteredAppointments.filter(apt => apt.status === "Completed" || apt.status === "Cancelled");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
        <Button onClick={() => navigate("/find-doctor")} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total" count={appointments.length} icon={<Calendar className="h-8 w-8 text-muted-foreground" />} />
        <StatsCard label="Upcoming" count={upcomingAppointments.length} icon={<Clock className="h-8 w-8 text-blue-500" />} />
        <StatsCard label="Completed" count={pastAppointments.filter(a => a.status === "Completed").length} icon={<FileText className="h-8 w-8 text-green-500" />} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by doctor name or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Upcoming Section */}
      <Card className="shadow-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600" /> Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-4">Loading...</p> : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <AppointmentItem 
                  key={apt._id} 
                  appointment={apt} 
                  onViewDetails={() => handleViewDetails(apt)}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No upcoming appointments scheduled." />
          )}
        </CardContent>
      </Card>

      {/* Past Section */}
      <Card className="shadow-card border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-green-600" /> Past History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-4">Loading...</p> : pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((apt) => (
                <AppointmentItem 
                  key={apt._id} 
                  appointment={apt} 
                  onViewDetails={() => handleViewDetails(apt)}
                  onViewReport={() => handleViewReport(apt._id)}
                  getStatusColor={getStatusColor}
                  isPast={true}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No appointment history found." />
          )}
        </CardContent>
      </Card>

      {/* --- MODAL: APPOINTMENT DETAILS --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAppointment.doctor?.image} />
                  <AvatarFallback>{selectedAppointment.doctor?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">Dr. {selectedAppointment.doctor?.firstName} {selectedAppointment.doctor?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.doctor?.email}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                   <span className="text-muted-foreground">Date:</span>
                   <span className="font-medium">{format(new Date(selectedAppointment.date), "PPP")}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                   <span className="text-muted-foreground">Time Slot:</span>
                   <span className="font-medium">{selectedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                   <span className="text-muted-foreground">Status:</span>
                   <Badge variant={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge>
                </div>
                <div>
                   <span className="text-muted-foreground block mb-1">Reason for Visit:</span>
                   <p className="bg-muted p-2 rounded text-foreground">{selectedAppointment.reason || "No reason provided."}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL: VIEW REPORT --- */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" /> Medical Report
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            {reportData && <ViewReportContent data={reportData} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// ==========================================
// SUB-COMPONENT: APPOINTMENT LIST ITEM
// ==========================================
function AppointmentItem({ appointment, onViewDetails, onViewReport, getStatusColor, isPast }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all bg-card">
            <div className="flex items-start gap-4 mb-4 sm:mb-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={appointment.doctor?.image} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {appointment.doctor?.firstName?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h4 className="font-semibold">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">{appointment.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(appointment.date), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.timeSlot}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge variant={getStatusColor(appointment.status)} className="capitalize">
                    {appointment.status}
                </Badge>
                
                <Button variant="ghost" size="sm" onClick={onViewDetails}>
                    Details
                </Button>

                {isPast && appointment.status === "Completed" && (
                     <Button size="sm" variant="outline" className="border-green-200 hover:bg-green-50 text-green-700" onClick={onViewReport}>
                        <FileText className="w-4 h-4 mr-2" /> Report
                     </Button>
                )}
            </div>
        </div>
    )
}

// ==========================================
// SUB-COMPONENT: VIEW REPORT CONTENT (Reuse logic)
// ==========================================
function ViewReportContent({ data }) {
    const downloadFile = async (url, filename) => {
        try {
            const response = await fetch(url);
            if(!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'report-file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-6 pb-4">
            {/* Header Info */}
            <div className="flex justify-between bg-muted/20 p-4 rounded-lg">
                <div><p className="text-xs text-muted-foreground uppercase">Doctor</p><p className="font-semibold">Dr. {data.doctor?.firstName} {data.doctor?.lastName}</p></div>
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

            {/* Prescription */}
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Pill className="w-4 h-4"/> Prescription</h4>
                {data.prescription?.length > 0 ? (
                    data.prescription.map((med, i) => (
                        <div key={i} className="flex justify-between bg-muted/10 p-2 rounded text-sm"><span className="font-semibold w-1/3">{med.medicineName}</span><span className="text-muted-foreground">{med.dosage} | {med.frequency} | {med.duration} | <span className="italic">{med.instructions}</span></span></div>
                    ))
                ) : <p className="text-sm italic text-muted-foreground">No prescription provided.</p>}
            </div>
            <Separator />

            {/* Files */}
            <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Paperclip className="w-4 h-4"/> Lab Reports / Attachments</h4>
                {data.labReports?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.labReports.map((file, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded bg-muted/10">
                                <div className="flex items-center gap-2 overflow-hidden"><FileText className="w-4 h-4 text-blue-500 shrink-0"/><span className="text-sm truncate font-medium">{file.originalName}</span></div>
                                <div className="flex gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-100 text-blue-600" onClick={() => window.open(file.url, '_blank')}><ExternalLink className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-100 text-green-600" onClick={() => downloadFile(file.url, file.originalName)}><Download className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-muted-foreground italic">No files attached.</p>}
            </div>

            {/* Advice */}
            {data.patientAdvice && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Advice</h4>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{data.patientAdvice}</p>
                </div>
            )}
        </div>
    )
}

function StatsCard({ label, count, icon }) {
    return (
        <Card className="shadow-sm"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{count}</p></div><div className="p-2 bg-muted/20 rounded-full">{icon}</div></CardContent></Card>
    )
}

function EmptyState({ message }) {
    return (
        <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{message}</h3>
        </div>
    )
}
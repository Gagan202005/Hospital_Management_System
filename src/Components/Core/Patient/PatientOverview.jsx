import { useEffect, useState } from "react";
import { 
  Calendar, 
  Activity, 
  FileText,
  Clock,
  Download,
  Eye,
  User,
  ExternalLink,
  Pill,
  Paperclip
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// API
import { fetchPatientDashboardStats } from "../../../services/operations/PatientApi";
import { fetchVisitReport } from "../../../services/operations/MedicalReportApi";

export default function PatientOverview() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // View Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      if (token) {
        const data = await fetchPatientDashboardStats(token);
        if (data) setStats(data);
      }
      setLoading(false);
    };
    loadStats();
  }, [token]);

  const handleViewReport = async (reportId) => {
    // We might have the data in 'stats.recentReports', but fetching fresh ensures full details
    const data = await fetchVisitReport(token, reportId); // Reusing the MedicalReportApi function
    if (data) {
      setSelectedReport(data);
      setIsReportOpen(true);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!stats) return <div className="p-8 text-center">Failed to load data.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Patient Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, {stats.patientName}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Count */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Scheduled visits</p>
          </CardContent>
        </Card>

        {/* Total Reports */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentReports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Latest available</p>
          </CardContent>
        </Card>

        {/* Latest Vitals (Replaces Generic Health Score) */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Vitals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.latestVitals ? (
                <div>
                    <div className="text-xl font-bold">{stats.latestVitals.bp || "--"}</div>
                    <p className="text-xs text-muted-foreground">BP | {stats.latestVitals.weight || "--"} kg</p>
                </div>
            ) : (
                <div>
                    <div className="text-xl font-bold">--</div>
                    <p className="text-xs text-muted-foreground">No records yet</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Last Visit */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.lastVisit}</div>
            <p className="text-xs text-muted-foreground">Checkup</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/find-doctor")} 
              className="w-full justify-start"
              variant="outline"
            >
              <User className="h-4 w-4 mr-2" />
              Find a Doctor
            </Button>
            <Button 
              onClick={() => navigate("/patient-dashboard/appointments")} 
              className="w-full justify-start"
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Manage Appointments
            </Button>
          </CardContent>
        </Card>

        {/* Up Next (Replaces Generic Activity) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Up Next</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.nextAppointment ? (
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-semibold text-lg">Dr. {stats.nextAppointment.doctor?.firstName} {stats.nextAppointment.doctor?.lastName}</h3>
                            <p className="text-sm text-muted-foreground">Specialist Checkup</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded text-xs font-bold">
                            {stats.nextAppointment.timeSlot}
                        </div>
                    </div>
                    <div className="text-sm font-medium">
                        {new Date(stats.nextAppointment.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                    <Calendar className="h-10 w-10 mb-2 opacity-20"/>
                    <p>No upcoming appointments</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Medical Reports */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Latest Medical Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentReports && stats.recentReports.length > 0 ? (
                stats.recentReports.map((report) => (
                    <div key={report._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.diagnosis || "General Checkup"}</h4>
                          <p className="text-sm text-muted-foreground">
                            Dr. {report.doctor?.firstName} {report.doctor?.lastName} • {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={() => handleViewReport(report.appointmentId)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-6 text-muted-foreground">
                    No medical reports available.
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- VIEW REPORT MODAL --- */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-4 border-b shrink-0">
                <DialogTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" /> Medical Report Details
                </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 p-6">
                {selectedReport && <ViewReportContent data={selectedReport} />}
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reuse this component logic from AppointmentSection
function ViewReportContent({ data }) {
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
            window.open(url, '_blank');
        }
    };

    return (
        <div className="space-y-6 pb-4">
            <div className="flex justify-between bg-muted/20 p-4 rounded-lg">
                <div><p className="text-xs text-muted-foreground uppercase">Doctor</p><p className="font-semibold">Dr. {data.doctor?.firstName} {data.doctor?.lastName}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase">Date</p><p className="font-semibold">{new Date(data.createdAt).toLocaleDateString()}</p></div>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
                {Object.entries(data.vitalSigns || {}).map(([key, val]) => (
                    val && <div key={key} className="border p-2 rounded"><p className="text-xs text-muted-foreground uppercase">{key}</p><p className="font-medium">{val}</p></div>
                ))}
            </div>
            <Separator />
            <div><h4 className="font-semibold text-primary mb-1">Diagnosis</h4><p className="text-lg font-medium">{data.diagnosis}</p><p className="text-sm text-muted-foreground">{data.symptoms}</p></div>
            <Separator />
            <div>
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Paperclip className="w-4 h-4"/> Lab Reports</h4>
                {data.labReports?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.labReports.map((file, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border rounded bg-muted/10">
                                <div className="flex items-center gap-2 overflow-hidden"><FileText className="w-4 h-4 text-blue-500 shrink-0"/><span className="text-sm truncate font-medium">{file.originalName}</span></div>
                                <div className="flex gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" onClick={() => window.open(file.url, '_blank')}><ExternalLink className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => downloadFile(file.url, file.originalName)}><Download className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-muted-foreground italic">No files attached.</p>}
            </div>
            <Separator />
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-sm"><Pill className="w-4 h-4"/> Prescription</h4>
                {data.prescription?.map((med, i) => (
                    <div key={i} className="flex justify-between bg-muted/10 p-2 rounded text-sm"><span className="font-semibold w-1/3">{med.medicineName}</span><span className="text-muted-foreground">{med.dosage} | {med.frequency} | {med.duration} | <span className="italic">{med.instructions}</span></span></div>
                ))}
            </div>
            {data.patientAdvice && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Advice</h4>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{data.patientAdvice}</p>
                </div>
            )}
        </div>
    )
}
import { useEffect, useState } from "react";
import { 
  CalendarCheck, Activity, FileBarChart, Clock, 
  Search, CalendarPlus, Eye, AlertCircle, FileText 
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Reuse the Report Viewer Component Logic
import { ViewReportContent } from "./PatientAppointmentSection"; 

// API
import { fetchPatientDashboardStats } from "../../../services/operations/PatientApi";
import { fetchVisitReport } from "../../../services/operations/MedicalReportApi";

export default function PatientOverview() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      if (token) {
        try {
            const data = await fetchPatientDashboardStats(token);
            if (data) setStats(data);
        } catch (error) {
            console.error("Dashboard Load Error", error);
        }
      }
      setLoading(false);
    };
    loadStats();
  }, [token]);

  // --- Helper: Fetch Full Report Details ---
  const handleViewReport = async (reportId) => {
    const data = await fetchVisitReport(token, reportId);
    if (data) {
      setSelectedReport(data);
      setIsReportOpen(true);
    }
  };

  // --- Helper: Time-based Greeting ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Initializing Medical Dashboard...</div>;
  if (!stats) return <div className="p-12 text-center text-red-500">System temporarily unavailable.</div>;

  return (
    <div className="space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Medical Summary</h1>
          <p className="text-slate-500 mt-1">
            {getGreeting()}, <span className="font-semibold text-emerald-700">{stats.patientName}</span>. 
            Here is your health snapshot for {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => navigate("/find-doctor")} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <Search className="w-4 h-4 mr-2" /> Find Specialist
            </Button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Scheduled Visits */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Scheduled Visits</CardTitle>
            <CalendarCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.upcomingCount}</div>
            <p className="text-xs text-slate-500 mt-1">Upcoming consultations</p>
          </CardContent>
        </Card>

        {/* Clinical Reports */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Clinical Reports</CardTitle>
            <FileBarChart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.recentReports?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Available for download</p>
          </CardContent>
        </Card>

        {/* Clinical Vitals */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Latest Vitals</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {stats.latestVitals ? (
                <div>
                    <div className="text-2xl font-bold text-slate-800">{stats.latestVitals.bp || "--"} <span className="text-sm font-normal text-slate-400">mmHg</span></div>
                    <p className="text-xs text-slate-500 mt-1">Weight: {stats.latestVitals.weight || "--"} kg</p>
                </div>
            ) : (
                <div>
                    <div className="text-xl font-bold text-slate-400">--</div>
                    <p className="text-xs text-slate-500">No recent vitals recorded</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Last Interaction */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Last Consultation</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-800 truncate">{stats.lastVisit || "N/A"}</div>
            <p className="text-xs text-slate-500 mt-1">Check-up date</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Next Appointment Card */}
        <div className="lg:col-span-2">
            <Card className="h-full border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarPlus className="w-5 h-5 text-emerald-600"/> Next Scheduled Consultation
                    </CardTitle>
                    <CardDescription>Details of your upcoming medical visit.</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.nextAppointment ? (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-emerald-200 text-emerald-800 text-[10px] uppercase font-bold px-2 py-1 rounded">Confirmed</span>
                                    <span className="text-sm text-emerald-900 font-medium">{new Date(stats.nextAppointment.date).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-bold text-xl text-emerald-950">Dr. {stats.nextAppointment.doctor?.firstName} {stats.nextAppointment.doctor?.lastName}</h3>
                                <p className="text-sm text-emerald-700 mt-1">{stats.nextAppointment.doctor?.department || "General Physician"} • {stats.nextAppointment.doctor?.specialization}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-emerald-600">{stats.nextAppointment.timeSlot}</div>
                                <p className="text-xs text-emerald-500 uppercase font-semibold tracking-wider mt-1">Time Slot</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <CalendarCheck className="h-12 w-12 mb-3 opacity-20"/>
                            <p>No upcoming appointments scheduled.</p>
                            <Button variant="link" onClick={() => navigate("/find-doctor")} className="text-emerald-600">Book Now</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* 4. Recent Reports List */}
        <div>
            <Card className="h-full border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-purple-600"/> Recent Reports
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-2">
                    <ScrollArea className="h-[300px] pr-4">
                        {stats.recentReports && stats.recentReports.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentReports.map((report) => (
                                    <div key={report._id} className="group p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer" onClick={() => handleViewReport(report.appointmentId)}>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold text-sm text-slate-800">{report.diagnosis || "Medical Checkup"}</h4>
                                                <p className="text-xs text-slate-500 mt-1">Dr. {report.doctor?.lastName}</p>
                                            </div>
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Eye className="w-3 h-3" /> View Report
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-sm text-slate-500">
                                No records found.
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* --- VIEW REPORT MODAL --- */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="p-5 border-b bg-slate-50 flex flex-row items-center justify-between shrink-0">
                <DialogTitle className="flex items-center gap-2 text-lg text-slate-800">
                    <Activity className="h-5 w-5 text-purple-600" /> Digital Health Record
                </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 p-6 bg-white">
                {selectedReport && <ViewReportContent data={selectedReport} />}
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
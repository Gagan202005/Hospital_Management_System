import { useState } from "react";
import { format } from "date-fns";
import { FileText, Download, Eye, Search, Filter, Calendar, Clock } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

export default function PatientReportsSection() {
  const [reports] = useState([
    {
      id: "1",
      title: "Blood Test Results",
      type: "lab",
      date: new Date(2024, 11, 20),
      doctor: "Dr. Sarah Johnson",
      status: "available",
      summary: "Complete blood count and lipid panel results",
      findings: "All values within normal ranges. Cholesterol levels have improved since last test. Blood glucose slightly elevated but within acceptable range for patient's condition.",
      recommendations: "Continue current medication regimen. Follow up in 3 months. Consider increasing exercise frequency.",
      attachments: ["blood_test_results.pdf", "lab_reference_ranges.pdf"]
    },
    {
      id: "2",
      title: "Chest X-Ray Report",
      type: "imaging",
      date: new Date(2024, 11, 15),
      doctor: "Dr. Michael Chen",
      status: "available",
      summary: "Routine chest X-ray examination",
      findings: "Clear lung fields. No acute cardiopulmonary abnormalities detected. Heart size and mediastinal contours are normal.",
      recommendations: "No immediate follow-up required. Annual screening recommended.",
      attachments: ["chest_xray_report.pdf", "xray_images.zip"]
    },
    {
      id: "3",
      title: "Cardiology Consultation",
      type: "consultation",
      date: new Date(2024, 11, 10),
      doctor: "Dr. Sarah Johnson",
      status: "available",
      summary: "Follow-up consultation for hypertension management",
      findings: "Blood pressure well controlled on current medication. Patient reports improved energy levels and no side effects.",
      recommendations: "Continue Lisinopril 10mg daily. Lifestyle modifications showing positive results. Next appointment in 6 months.",
      attachments: ["consultation_notes.pdf", "bp_chart.pdf"]
    },
    {
      id: "4",
      title: "Prescription Refill",
      type: "prescription",
      date: new Date(2024, 11, 25),
      doctor: "Dr. Sarah Johnson",
      status: "pending",
      summary: "Monthly prescription refill request",
      findings: "Patient request for medication refill processed.",
      recommendations: "Continue current dosage. Pharmacy will be notified.",
      attachments: []
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "default";
      case "pending":
        return "secondary";
      case "processing":
        return "outline";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "lab":
        return "🧪";
      case "imaging":
        return "📷";
      case "consultation":
        return "👨‍⚕️";
      case "prescription":
        return "💊";
      case "discharge":
        return "📋";
      default:
        return "📄";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "lab":
        return "bg-blue-100 text-blue-800";
      case "imaging":
        return "bg-purple-100 text-purple-800";
      case "consultation":
        return "bg-green-100 text-green-800";
      case "prescription":
        return "bg-orange-100 text-orange-800";
      case "discharge":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Medical Reports</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-secondary">{reports.filter(r => r.status === "available").length}</p>
              </div>
              <Eye className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-primary">{reports.filter(r => r.status === "pending").length}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{reports.filter(r => {
                  const thisMonth = new Date();
                  return r.date.getMonth() === thisMonth.getMonth() && 
                         r.date.getFullYear() === thisMonth.getFullYear();
                }).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title, doctor, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lab">Lab Results</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
            <SelectItem value="consultation">Consultations</SelectItem>
            <SelectItem value="prescription">Prescriptions</SelectItem>
            <SelectItem value="discharge">Discharge</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getTypeIcon(report.type)}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.doctor}</p>
                  </div>
                </div>
                <Badge variant={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(report.date, "MMM d, yyyy")}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {report.summary}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedReport(report)}
                      disabled={report.status !== "available"}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(report.type)}</span>
                        {report.title}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedReport && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Badge variant={getStatusColor(selectedReport.status)}>
                            {selectedReport.status}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(selectedReport.type)}>
                            {selectedReport.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(selectedReport.date, "MMMM d, yyyy")}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Doctor</h4>
                          <p className="text-sm">{selectedReport.doctor}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-sm">{selectedReport.summary}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Findings</h4>
                          <p className="text-sm">{selectedReport.findings}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Recommendations</h4>
                          <p className="text-sm">{selectedReport.recommendations}</p>
                        </div>

                        {selectedReport.attachments.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Attachments</h4>
                            <div className="space-y-2">
                              {selectedReport.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                                  <span className="text-sm">{attachment}</span>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={report.status !== "available"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterType !== "all" 
                ? "Try adjusting your search criteria." 
                : "Your medical reports will appear here when available."}
            </p>
          </CardContent>
        </Card>
        )}
    </div>
  );
}
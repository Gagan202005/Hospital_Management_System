import { useState, useEffect } from "react";
import { 
  Users, Phone, Mail, MapPin, Search, Clock, 
  Activity, Calendar, FileClock, ChevronRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";
import { useSelector } from "react-redux";
import { fetchDoctorPatients } from "../../../services/operations/DoctorApi";

export function PatientsSection() {
  const { token } = useSelector((state) => state.auth);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (token) {
        try {
            const data = await fetchDoctorPatients(token);
            if (data) setPatients(data);
        } catch (error) {
            console.error("Failed to load patients", error);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [token]);

  // --- Filtering ---
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Patient Registry</h1>
        <p className="text-slate-500">Access medical records and contact details.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-t-4 border-t-blue-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{patients.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Synchronizing records...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No patients found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient, idx) => (
            <Card key={idx} className="hover:shadow-md transition-all border-slate-200 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-slate-50">
                      <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-lg">
                        {patient.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">{patient.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Encounters: {patient.visitCount}</p>
                    </div>
                  </div>
                  <Badge variant={patient.status === "Active" ? "default" : "secondary"} className={patient.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-600"}>
                    {patient.status || "Archived"}
                  </Badge>
                </div>

                <div className="space-y-2 py-3 border-t border-b border-slate-50">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{patient.phone}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Last Visit: <span className="text-slate-700 font-medium">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    Medical History <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b bg-slate-50/50">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                {selectedPatient?.name?.charAt(0)}
              </div>
              <div>
                {selectedPatient?.name}
                <span className="block text-xs font-normal text-slate-500 mt-0.5">Patient Record ID: #{Math.floor(Math.random() * 10000)}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Sidebar Info */}
              <div className="md:w-64 bg-slate-50 p-6 border-r border-slate-100 space-y-6 shrink-0">
                <div>
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400"/> {selectedPatient.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400"/> <span className="truncate">{selectedPatient.email}</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Summary</Label>
                  <div className="mt-2 text-sm text-slate-700 space-y-2">
                    <div className="flex justify-between"><span>Total Visits:</span> <span className="font-bold">{selectedPatient.visitCount}</span></div>
                    <div className="flex justify-between"><span>Status:</span> <Badge variant="outline" className="text-[10px] h-5">{selectedPatient.status}</Badge></div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 p-6 overflow-y-auto">
                <Label className="text-lg font-bold text-slate-800 mb-4 block flex items-center gap-2">
                    <FileClock className="w-5 h-5 text-blue-600" /> Clinical Timeline
                </Label>
                
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                    {selectedPatient.history?.length > 0 ? selectedPatient.history.map((visit, i) => (
                      <div key={i} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${visit.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        
                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-slate-800 text-sm">
                                    {new Date(visit.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <Badge variant={visit.status === "Completed" ? "default" : "secondary"} className="text-[10px]">
                                    {visit.status}
                                </Badge>
                            </div>
                            <div className="text-sm">
                                <span className="text-xs font-bold text-slate-400 uppercase">Chief Complaint</span>
                                <p className="text-slate-700 mt-1">{visit.reason}</p>
                            </div>
                        </div>
                      </div>
                    )) : (
                        <div className="pl-8 text-slate-400 italic text-sm">No clinical history recorded.</div>
                    )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
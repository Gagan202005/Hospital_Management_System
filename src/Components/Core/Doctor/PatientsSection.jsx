import { useState, useEffect } from "react";
import { 
  Users, Phone, Mail, Search, FileClock, ChevronRight, CalendarClock, History, MapPin, Droplet, User
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
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

  // Helper to format dates safely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">Patient Registry</h1>
        <p className="text-slate-500">Manage patient records and view clinical history.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-t-4 border-t-blue-600 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{patients.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Loading patient records...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No patients found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-all duration-300 border-slate-200 group bg-white">
              <CardContent className="p-6">
                
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm bg-blue-50">
                      <AvatarFallback className="text-blue-600 font-bold text-lg">
                        {patient.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                        {patient.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Visits: {patient.visitCount}</p>
                    </div>
                  </div>
                  <Badge 
                    className={`${patient.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"} border-0`}
                  >
                    {patient.status}
                  </Badge>
                </div>

                <Separator className="my-3 opacity-50"/>

                {/* Contact Info */}
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center gap-3 text-sm group/item">
                    <Mail className="h-4 w-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                    <span className="text-slate-600 truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group/item">
                    <Phone className="h-4 w-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                    <span className="text-slate-600">{patient.phone}</span>
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between border border-slate-100">
                  <div className="flex flex-col">
                    {patient.nextVisit ? (
                        <>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1">
                                <CalendarClock className="w-3 h-3" /> Upcoming
                            </span>
                            <span className="text-sm font-semibold text-slate-800">{formatDate(patient.nextVisit)}</span>
                        </>
                    ) : (
                        <>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <History className="w-3 h-3" /> Last Visit
                            </span>
                            <span className="text-sm font-semibold text-slate-700">{formatDate(patient.lastVisit)}</span>
                        </>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 text-blue-600 hover:bg-blue-100 hover:text-blue-700 px-3"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl">
          
          {/* Modal Header */}
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
            <DialogTitle className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">
                {selectedPatient?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{selectedPatient?.name}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {selectedPatient?.email}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {selectedPatient?.phone}</span>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="flex flex-col md:flex-row h-full overflow-hidden bg-slate-50/50">
              
              {/* Sidebar Summary */}
              <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-white space-y-6">
                
                {/* Status Block */}
                <div>
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Patient Status</Label>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500">Total Visits</p>
                        <p className="text-xl font-bold text-slate-900">{selectedPatient.visitCount}</p>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500">Current Status</p>
                        <p className={`text-sm font-bold ${selectedPatient.status === 'Active' ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {selectedPatient.status}
                        </p>
                     </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Details (Optional, based on available data) */}
                <div>
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Patient Information</Label>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><User className="w-4 h-4"/> Gender</span>
                        <span className="font-medium text-slate-800">{selectedPatient.gender || "Not specified"}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2"><Droplet className="w-4 h-4"/> Blood Group</span>
                        <span className="font-medium text-slate-800">{selectedPatient.bloodGroup || "Unknown"}</span>
                     </div>
                     <div className="flex items-start justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2 shrink-0"><MapPin className="w-4 h-4"/> Address</span>
                        <span className="font-medium text-slate-800 text-right truncate max-w-[150px]">{selectedPatient.address || "No address on file"}</span>
                     </div>
                  </div>
                </div>

              </div>

              {/* Timeline Section */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                <div className="flex items-center justify-between mb-6">
                    <Label className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <FileClock className="w-5 h-5 text-blue-600" /> Appointment History
                    </Label>
                </div>
                
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-10">
                    {selectedPatient.history?.length > 0 ? (
                        selectedPatient.history
                        // Sort by date descending (Newest first)
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((visit, i) => {
                            const isFuture = new Date(visit.date) > new Date();
                            return (
                                <div key={i} className="relative pl-8 group">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm z-10 
                                        ${isFuture ? 'bg-blue-500 ring-4 ring-blue-100' : 
                                          visit.status === 'Completed' ? 'bg-emerald-500' : 
                                          visit.status === 'Cancelled' ? 'bg-red-400' : 'bg-slate-400'}`}
                                    ></div>
                                    
                                    <div className={`rounded-xl border p-4 shadow-sm transition-all duration-200
                                        ${isFuture ? 'bg-white border-blue-200 shadow-blue-50' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                        
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className={`text-sm font-bold ${isFuture ? 'text-blue-700' : 'text-slate-800'}`}>
                                                    {new Date(visit.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                {isFuture && <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">UPCOMING</span>}
                                            </div>
                                            <Badge variant="outline" className={`text-[10px] border-0 
                                                ${visit.status === "Completed" ? "bg-emerald-50 text-emerald-700" : 
                                                  visit.status === "Cancelled" ? "bg-red-50 text-red-600" :
                                                  "bg-slate-100 text-slate-600"}`}>
                                                {visit.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="text-sm">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Reason for Visit</p>
                                            <p className="text-slate-700 font-medium">{visit.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="pl-8 text-slate-400 italic text-sm py-4">No appointment history found.</div>
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
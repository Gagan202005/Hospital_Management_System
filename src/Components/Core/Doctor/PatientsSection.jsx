import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Search, Clock, Activity, Calendar } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { useSelector } from "react-redux";
import { fetchDoctorPatients } from "../../../services/operations/DoctorApi";

export function PatientsSection() {
  const { token } = useSelector((state) => state.auth);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (token) {
        const data = await fetchDoctorPatients(token);
        if (data) setPatients(data);
      }
      setLoading(false);
    };
    loadData();
  }, [token]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Patient Directory</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold">{patients.length}</p>
            </div>
            <User className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        {/* You can add more stats cards here like "Active Patients" */}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="text-center py-10">Loading directory...</div>
      ) : filteredPatients.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient, idx) => (
            <Card key={idx} className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{patient.visitCount} Visits</p>
                    </div>
                  </div>
                  <Badge variant={patient.status === "Active" ? "default" : "secondary"}>
                    {patient.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{patient.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {patient.status === "Active" ? "Next Appointment:" : "Last Visit:"} <br/>
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </p>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setSelectedPatient(patient)}
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {selectedPatient?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPatient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {/* Left Column: Basic Info */}
              <div className="md:col-span-1 space-y-4 border-r pr-4">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Contact</Label>
                  <div className="mt-1 space-y-1 text-sm">
                    <p>{selectedPatient.phone}</p>
                    <p className="break-all">{selectedPatient.email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground uppercase">Stats</Label>
                  <div className="mt-1 text-sm">
                    <p>Total Visits: {selectedPatient.visitCount}</p>
                    <p>Status: {selectedPatient.status}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Visit History */}
              <div className="md:col-span-2">
                <Label className="text-base font-semibold mb-3 block">Visit History</Label>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {selectedPatient.history?.map((visit, i) => (
                      <div key={i} className="flex gap-3 items-start pb-3 border-b last:border-0">
                        <div className="mt-1">
                          <Activity className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {new Date(visit.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">{visit.reason}</p>
                          <Badge variant="outline" className="text-xs mt-1">{visit.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
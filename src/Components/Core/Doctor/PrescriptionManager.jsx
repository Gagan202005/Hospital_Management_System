import { useState } from "react";
import { Pill, Plus, Save, X, FileText, Search, Printer } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { useToast } from "../../../hooks/use-toast";

export function PrescriptionManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    {
      id: "1",
      patientId: "1",
      patientName: "John Smith",
      date: "2024-01-15",
      diagnosis: "Upper Respiratory Infection",
      medications: [
        { id: "m1", name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily", duration: "7 days", instructions: "Take with food" },
        { id: "m2", name: "Paracetamol", dosage: "650mg", frequency: "As needed", duration: "5 days", instructions: "Max 4 doses per day" }
      ],
      notes: "Rest and plenty of fluids recommended",
      followUpDate: "2024-01-22"
    }
  ]);

  const [currentPrescription, setCurrentPrescription] = useState({
    id: "",
    patientId: "",
    patientName: "",
    date: new Date().toISOString().split('T')[0],
    diagnosis: "",
    medications: [],
    notes: "",
    followUpDate: ""
  });

  const [newMedication, setNewMedication] = useState({
    id: "",
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });

  const patients = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Emily Johnson" },
    { id: "3", name: "Michael Brown" },
    { id: "4", name: "Sarah Davis" }
  ];

  const { toast } = useToast();

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setCurrentPrescription(prev => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name
      }));
    }
  };

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Missing Information",
        description: "Please enter medication name and dosage.",
        variant: "destructive",
      });
      return;
    }

    const medication = {
      ...newMedication,
      id: Date.now().toString()
    };

    setCurrentPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, medication]
    }));

    setNewMedication({
      id: "",
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    });
  };

  const removeMedication = (id) => {
    setCurrentPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
  };

  const savePrescription = () => {
    if (!currentPrescription.patientId || !currentPrescription.diagnosis || currentPrescription.medications.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient, diagnosis, and add at least one medication.",
        variant: "destructive",
      });
      return;
    }

    const prescription = {
      ...currentPrescription,
      id: Date.now().toString()
    };

    setPrescriptions([prescription, ...prescriptions]);

    setCurrentPrescription({
      id: "",
      patientId: "",
      patientName: "",
      date: new Date().toISOString().split('T')[0],
      diagnosis: "",
      medications: [],
      notes: "",
      followUpDate: ""
    });

    setIsDialogOpen(false);

    toast({
      title: "Prescription Created",
      description: `Prescription for ${prescription.patientName} has been saved.`,
    });
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select value={currentPrescription.patientId} onValueChange={handlePatientSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={currentPrescription.date}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Diagnosis *</Label>
                <Input
                  value={currentPrescription.diagnosis}
                  onChange={(e) => setCurrentPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis"
                />
              </div>

              {/* Medications Section */}
              <Card className="border-2 border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Medications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Added Medications */}
                  {currentPrescription.medications.length > 0 && (
                    <div className="space-y-2">
                      {currentPrescription.medications.map((med) => (
                        <div key={med.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                          <div>
                            <p className="font-medium">{med.name} - {med.dosage}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.frequency} for {med.duration}
                            </p>
                            {med.instructions && (
                              <p className="text-sm text-muted-foreground italic">{med.instructions}</p>
                            )}
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeMedication(med.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Medication */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Medication name"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Dosage (e.g., 500mg)"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    />
                    <Input
                      placeholder="Frequency"
                      value={newMedication.frequency}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                    />
                    <Input
                      placeholder="Duration"
                      value={newMedication.duration}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, duration: e.target.value }))}
                    />
                    <Input
                      placeholder="Instructions"
                      value={newMedication.instructions}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                      className="md:col-span-2"
                    />
                  </div>
                  <Button onClick={addMedication} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={currentPrescription.notes}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Lifestyle advice, dietary recommendations..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={currentPrescription.followUpDate}
                    onChange={(e) => setCurrentPrescription(prev => ({ ...prev, followUpDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={savePrescription} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Prescription
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prescriptions</p>
                <p className="text-2xl font-bold">{prescriptions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-secondary">
                  {prescriptions.filter(p => p.date === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
              <Pill className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Follow-ups</p>
                <p className="text-2xl font-bold text-amber-600">
                  {prescriptions.filter(p => p.followUpDate && new Date(p.followUpDate) >= new Date()).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient name or diagnosis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Prescriptions List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPrescriptions.length > 0 ? (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{prescription.patientName}</h4>
                        <Badge variant="outline">{prescription.date}</Badge>
                      </div>
                      <p className="text-sm font-medium text-primary">{prescription.diagnosis}</p>
                      <div className="flex flex-wrap gap-2">
                        {prescription.medications.map((med) => (
                          <Badge key={med.id} variant="secondary">
                            <Pill className="h-3 w-3 mr-1" />
                            {med.name} {med.dosage}
                          </Badge>
                        ))}
                      </div>
                      {prescription.notes && (
                        <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No prescriptions found</h3>
              <p className="text-muted-foreground">
                Create a new prescription to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
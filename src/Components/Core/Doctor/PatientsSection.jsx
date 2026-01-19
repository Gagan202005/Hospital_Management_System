import { useState } from "react";
import { User, Phone, Mail, Calendar, MapPin, Search, Plus, Heart } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { useToast } from "../../../hooks/use-toast";

export function PatientsSection() {
  const [patients, setPatients] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 234-567-8900",
      dateOfBirth: new Date(1985, 5, 15),
      address: "123 Main St, New York, NY 10001",
      lastVisit: new Date(2024, 10, 20),
      condition: "Hypertension",
      status: "active",
      notes: "Patient responds well to medication. Regular checkups recommended."
    },
    {
      id: "2",
      name: "Emily Johnson",
      email: "emily.j@email.com",
      phone: "+1 234-567-8901",
      dateOfBirth: new Date(1990, 8, 22),
      address: "456 Oak Ave, Brooklyn, NY 11201",
      lastVisit: new Date(2024, 11, 15),
      condition: "Diabetes Type 2",
      status: "active",
      notes: "Blood sugar levels improving with diet and exercise changes."
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "m.brown@email.com",
      phone: "+1 234-567-8902",
      dateOfBirth: new Date(1978, 2, 10),
      address: "789 Pine St, Queens, NY 11375",
      lastVisit: new Date(2024, 9, 5),
      condition: "Chronic Back Pain",
      status: "inactive",
      notes: "Patient moved to different city. Referred to local specialist."
    },
    {
      id: "4",
      name: "Sarah Davis",
      email: "sarah.davis@email.com",
      phone: "+1 234-567-8903",
      dateOfBirth: new Date(1995, 11, 3),
      address: "321 Elm St, Manhattan, NY 10002",
      lastVisit: new Date(2024, 11, 22),
      condition: "Anxiety",
      status: "active",
      notes: "Therapy sessions showing positive results. Continue current treatment."
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    condition: "",
    notes: ""
  });
  const { toast } = useToast();

  const calculateAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const addNewPatient = () => {
    if (!newPatient.name || !newPatient.email || !newPatient.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const patient = {
      id: Date.now().toString(),
      name: newPatient.name,
      email: newPatient.email,
      phone: newPatient.phone,
      dateOfBirth: new Date(newPatient.dateOfBirth),
      address: newPatient.address,
      lastVisit: new Date(),
      condition: newPatient.condition,
      status: "active",
      notes: newPatient.notes
    };

    setPatients([...patients, patient]);
    setNewPatient({
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      condition: "",
      notes: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Patient Added",
      description: `${newPatient.name} has been added to your patient list.`,
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Medical Condition</Label>
                <Input
                  id="condition"
                  value={newPatient.condition}
                  onChange={(e) => setNewPatient({...newPatient, condition: e.target.value})}
                  placeholder="Enter primary condition"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <Button onClick={addNewPatient} className="w-full">
                Add Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold text-secondary">
                  {patients.filter(p => p.status === "active").length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-primary">
                  {patients.filter(p => {
                    const thisMonth = new Date();
                    return p.lastVisit.getMonth() === thisMonth.getMonth() && 
                           p.lastVisit.getFullYear() === thisMonth.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, email, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Age {calculateAge(patient.dateOfBirth)}
                    </p>
                  </div>
                </div>
                <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                  {patient.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{patient.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{patient.condition}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last visit: {patient.lastVisit.toLocaleDateString()}
                </p>
                {patient.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {patient.notes}
                  </p>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setSelectedPatient(patient)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search criteria." : "Add your first patient to get started."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {selectedPatient?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Age</Label>
                  <p className="text-sm text-muted-foreground">
                    {calculateAge(selectedPatient.dateOfBirth)} years old
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedPatient.status === "active" ? "default" : "secondary"} className="ml-2">
                    {selectedPatient.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Contact Information</Label>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">{selectedPatient.email}</p>
                    <p className="text-sm">{selectedPatient.phone}</p>
                    <p className="text-sm">{selectedPatient.address}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Medical Information</Label>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><strong>Primary Condition:</strong> {selectedPatient.condition}</p>
                    <p className="text-sm"><strong>Last Visit:</strong> {selectedPatient.lastVisit.toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedPatient.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground mt-2">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
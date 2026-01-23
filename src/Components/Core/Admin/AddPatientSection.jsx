import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { toast } from "react-hot-toast"; 
import { 
  UserPlus, Search, Edit, Trash2, 
  Loader2, Copy, Save, X, User, 
  Users, Activity, CalendarDays 
} from "lucide-react";
import { 
  Add_Patient, 
  getAllUsers, 
  Update_Patient, 
  Delete_Patient 
} from "../../../services/operations/AdminApi";
import { useDispatch, useSelector } from "react-redux";

export const AddPatientSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // --- Search & Edit State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null); 

  // --- Form State ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phoneno: "",          
    address: "",
    emergencyContactName: "", 
    emergencyContactPhone: "", 
    dob: "",              
  });

  const [patients, setPatients] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // =================================================================
  // 1. FETCH PATIENTS
  // =================================================================
  const fetchPatients = async () => {
    setIsFetching(true);
    try {
      const result = await getAllUsers(token, "patient");
      if (result) {
        setPatients(result);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [token]);

  // =================================================================
  // 2. STATISTICS CALCULATION
  // =================================================================
  const stats = useMemo(() => {
    const total = patients.length;
    
    // Count admitted patients (assuming 'admitted' field exists and is "Admitted")
    const admitted = patients.filter(p => 
      p.admitted === "Admitted" || p.admitted === "admitted"
    ).length;

    // Count new registrations today
    const today = new Date().setHours(0,0,0,0);
    const newToday = patients.filter(p => {
        if(!p.createdAt) return false;
        const pDate = new Date(p.createdAt).setHours(0,0,0,0);
        return pDate === today;
    }).length;

    return { total, admitted, newToday };
  }, [patients]);

  // =================================================================
  // 3. FORM HANDLERS
  // =================================================================
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenderChange = (value) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "", lastName: "", gender: "", email: "",
      phoneno: "", address: "", emergencyContactName: "", emergencyContactPhone: "", dob: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  // =================================================================
  // 4. SUBMIT LOGIC
  // =================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        // --- UPDATE ---
        await Update_Patient({ ...formData, _id: editId }, token);
        setIsEditing(false);
        setEditId(null);
      } else {
        // --- ADD ---
        const response = await Add_Patient(formData, token);
        
        // Custom Password Toast
        if(response?.generatedPassword) {
           toast.success(
             (t) => (
               <div className="flex flex-col gap-1">
                 <span className="font-bold">Patient Added!</span>
                 <div className="flex items-center gap-2 text-sm bg-white/20 p-1 rounded mt-1">
                   Pass: <code className="font-mono font-bold">{response.generatedPassword}</code>
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText(response.generatedPassword);
                       toast.success("Copied!");
                     }}
                     className="p-1 hover:bg-black/10 rounded"
                     title="Copy Password"
                   >
                     <Copy className="w-3 h-3" />
                   </button>
                 </div>
                 <span className="text-[10px] opacity-80">Email with credentials sent to user.</span>
               </div>
             ),
             { duration: 6000, position: "top-center" }
           );
        }
      }

      fetchPatients(); 
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // =================================================================
  // 5. EDIT / DELETE HANDLERS
  // =================================================================
  const handleEditClick = (patient) => {
    setIsEditing(true);
    setEditId(patient._id);
    
    setFormData({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      email: patient.email || "",
      gender: patient.gender || "",
      phoneno: patient.phoneno || "",
      address: patient.address || "",
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      dob: patient.DOB ? new Date(patient.DOB).toISOString().split('T')[0] : "",
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast("Editing mode enabled", { icon: "✏️" });
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure? This will delete the patient record.")) {
      await Delete_Patient(id, token);
      fetchPatients();
    }
  };

  // =================================================================
  // 6. SEARCH LOGIC (STRICT)
  // =================================================================
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    
    const query = searchQuery.toLowerCase().trim();
    
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = (patient.email || "").toLowerCase();
      const pID = (patient.patientID || "").toString();
      const formattedID = `pid-${pID}`;

      if (fullName.includes(query)) return true;
      if (email.includes(query)) return true;
      if (pID.startsWith(query)) return true;
      if (formattedID.startsWith(query)) return true;

      return false;
    });
  }, [patients, searchQuery]);

  // Age Helper
  const getAge = (dob) => {
    if(!dob) return "--";
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  return (
    <div className="space-y-6">
      
      {/* ======================= STATS OVERVIEW ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-blue-600 font-medium">Total Patients</p>
                      <h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3>
                  </div>
                  <Users className="h-8 w-8 text-blue-300" />
              </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-orange-600 font-medium">Currently Admitted</p>
                      <h3 className="text-2xl font-bold text-orange-900">{stats.admitted}</h3>
                  </div>
                  <Activity className="h-8 w-8 text-orange-300" />
              </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-emerald-600 font-medium">Registered Today</p>
                      <h3 className="text-2xl font-bold text-emerald-900">{stats.newToday}</h3>
                  </div>
                  <CalendarDays className="h-8 w-8 text-emerald-300" />
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ======================= FORM CARD ======================= */}
        <Card className={`bg-white/80 backdrop-blur-sm h-fit shadow-sm transition-all duration-300 ${isEditing ? "border-blue-500 ring-1 ring-blue-500 shadow-lg" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                {isEditing ? <Edit className="w-6 h-6 text-blue-600" /> : <UserPlus className="w-6 h-6 text-primary" />}
                {isEditing ? "Edit Patient Details" : "Add New Patient"}
                </CardTitle>
                <CardDescription className="mt-1">
                    {isEditing ? "Modify existing patient records" : "Auto-generated Password & Patient ID"}
                </CardDescription>
            </div>
            {isEditing && (
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-500 hover:bg-red-50">
                    <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required className="bg-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} required className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={handleGenderChange} value={formData.gender}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required className="bg-white" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneno">Phone Number <span className="text-red-500">*</span></Label>
                    <Input id="phoneno" value={formData.phoneno} onChange={handleInputChange} required className="bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={formData.address} onChange={handleInputChange} className="bg-white min-h-[80px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input id="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className="bg-white" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Emergency Phone</Label>
                    <Input id="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="bg-white" />
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full text-white font-medium shadow-sm transition-colors mt-2 ${isEditing ? "bg-indigo-600 hover:bg-indigo-700" : "bg-primary hover:bg-primary/90"}`} 
                disabled={isLoading}
              >
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? "Updating..." : "Creating Account..."}</> 
                ) : (
                    <>{isEditing ? <><Save className="w-4 h-4 mr-2"/> Update Patient</> : "Add Patient"}</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ======================= LIST CARD ======================= */}
        <Card className="bg-white/80 backdrop-blur-sm h-[800px] flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Patient Directory</CardTitle>
            <CardDescription>View and manage registered patients</CardDescription>
            <div className="relative mt-2">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input 
                   placeholder="Search by ID, Name, or Email..." 
                   className="pl-9 bg-white" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? (
               <div className="flex flex-col justify-center items-center h-full gap-2 text-muted-foreground">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-sm">Loading records...</p>
               </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                           <User className="h-8 w-8 opacity-40"/>
                        </div>
                        <p>No patients found</p>
                    </div>
                ) : (
                    filteredPatients.map((patient) => (
                      <div key={patient._id} className="group flex flex-col p-4 border rounded-xl hover:bg-slate-50 transition-all bg-white">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden shrink-0 border border-blue-100">
                                    <img 
                                        src={patient.image || `https://api.dicebear.com/5.x/initials/svg?seed=${patient.firstName}`} 
                                        alt="pic" 
                                        className="object-cover h-full w-full"
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-semibold text-gray-900 text-base">
                                            {patient.firstName} {patient.lastName}
                                        </h4>
                                        {/* Display Auto-Generated ID */}
                                        <Badge variant="secondary" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200 font-mono">
                                            PID-{patient.patientID}
                                        </Badge>
                                        {/* Admitted Badge */}
                                        {(patient.admitted === "Admitted" || patient.admitted === "admitted") && (
                                            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 text-[10px] h-5">
                                                Admitted
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {patient.email}
                                    </p>
                                    <div className="flex gap-3 mt-1 text-xs font-medium text-gray-500">
                                        <span>Age: {getAge(patient.DOB)}</span>
                                        <span className="text-gray-300">|</span>
                                        <span>Ph: {patient.phoneno}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-blue-600 hover:bg-blue-100"
                                    onClick={() => handleEditClick(patient)}
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:bg-red-100"
                                    onClick={() => handleDeleteClick(patient._id)}
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
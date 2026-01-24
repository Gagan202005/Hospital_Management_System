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
  UserPlus, Search, Edit, Trash2, Loader2, Copy, Save, X, 
  Users, Activity, CalendarDays, FileText 
} from "lucide-react";
import { Add_Patient, getAllUsers, Update_Patient, Delete_Patient } from "../../../services/operations/AdminApi";
import { useDispatch, useSelector } from "react-redux";

export const AddPatientSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  
  // --- UI States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null); 
  const [patients, setPatients] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // --- Form State ---
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", gender: "", email: "",
    phoneno: "", address: "", emergencyContactName: "", 
    emergencyContactPhone: "", dob: "",              
  });

  // --- 1. Fetch Data ---
  const fetchPatients = async () => {
    setIsFetching(true);
    try {
      const result = await getAllUsers(token, "patient");
      if (result) setPatients(result);
    } catch (error) { console.error(error); } 
    finally { setIsFetching(false); }
  };

  useEffect(() => { fetchPatients(); }, [token]);

  // --- 2. Stats ---
  const stats = useMemo(() => {
    const total = patients.length;
    const admitted = patients.filter(p => p.admitted === "Admitted" || p.admitted === "admitted").length;
    const today = new Date().setHours(0,0,0,0);
    const newToday = patients.filter(p => {
        if(!p.createdAt) return false;
        const pDate = new Date(p.createdAt).setHours(0,0,0,0);
        return pDate === today;
    }).length;
    return { total, admitted, newToday };
  }, [patients]);

  // --- 3. Handlers ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "", lastName: "", gender: "", email: "",
      phoneno: "", address: "", emergencyContactName: "", emergencyContactPhone: "", dob: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await Update_Patient({ ...formData, _id: editId }, token);
        toast.success("Patient record updated.");
      } else {
        const response = await Add_Patient(formData, token);
        if(response?.generatedPassword) {
           toast.success((t) => (
               <div className="flex flex-col gap-1">
                 <span className="font-bold">Registration Successful!</span>
                 <div className="flex items-center gap-2 text-sm bg-white/20 p-2 rounded mt-1">
                   Password: <code className="font-mono font-bold">{response.generatedPassword}</code>
                   <button onClick={() => { navigator.clipboard.writeText(response.generatedPassword); toast.success("Copied"); }} className="p-1 hover:bg-black/10 rounded"><Copy className="w-3 h-3" /></button>
                 </div>
                 <span className="text-[10px] opacity-80">Credentials sent to email.</span>
               </div>
             ), { duration: 8000 });
        }
      }
      fetchPatients(); 
      resetForm();
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleEditClick = (patient) => {
    setIsEditing(true);
    setEditId(patient._id);
    setFormData({
      firstName: patient.firstName || "", lastName: patient.lastName || "",
      email: patient.email || "", gender: patient.gender || "",
      phoneno: patient.phoneno || "", address: patient.address || "",
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      dob: patient.DOB ? new Date(patient.DOB).toISOString().split('T')[0] : "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Confirm deletion? This action is irreversible.")) {
      await Delete_Patient(id, token);
      fetchPatients();
    }
  };

  // --- Filtering ---
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase().trim();
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const pID = `pid-${patient.patientID}`;
      return fullName.includes(query) || patient.email?.includes(query) || pID.includes(query);
    });
  }, [patients, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-100 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="text-sm text-blue-600 font-medium">Total Registered</p><h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3></div>
                  <Users className="h-8 w-8 text-blue-300" />
              </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-100 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="text-sm text-orange-600 font-medium">In-Patients (Admitted)</p><h3 className="text-2xl font-bold text-orange-900">{stats.admitted}</h3></div>
                  <Activity className="h-8 w-8 text-orange-300" />
              </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="text-sm text-emerald-600 font-medium">New Today</p><h3 className="text-2xl font-bold text-emerald-900">{stats.newToday}</h3></div>
                  <CalendarDays className="h-8 w-8 text-emerald-300" />
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LEFT: FORM */}
        <Card className={`h-fit transition-all ${isEditing ? "border-blue-500 shadow-md" : "border-slate-200"}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                    {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-indigo-600" />}
                    {isEditing ? "Update Record" : "New Registration"}
                </CardTitle>
                {isEditing && <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-500"><X className="w-4 h-4 mr-1"/> Cancel</Button>}
            </div>
            <CardDescription>Enter patient demographics and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input id="firstName" value={formData.firstName} onChange={handleInputChange} required /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input id="lastName" value={formData.lastName} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date of Birth</Label><Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} required /></div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select onValueChange={(val) => setFormData(prev => ({...prev, gender: val}))} value={formData.gender}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                <div className="space-y-2"><Label>Phone</Label><Input id="phoneno" value={formData.phoneno} onChange={handleInputChange} required /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Textarea id="address" value={formData.address} onChange={handleInputChange} className="min-h-[80px]" /></div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <Label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Emergency Contact</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="emergencyContactName" placeholder="Name" value={formData.emergencyContactName} onChange={handleInputChange} className="bg-white"/>
                    <Input id="emergencyContactPhone" placeholder="Phone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="bg-white"/>
                  </div>
              </div>

              <Button type="submit" className={`w-full mt-2 ${isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-indigo-600 hover:bg-indigo-700"}`} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditing ? "Save Changes" : "Register Patient"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RIGHT: LIST */}
        <Card className="h-[800px] flex flex-col border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Patient Registry</CardTitle>
            <div className="relative mt-2">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
               <Input placeholder="Search name, email, or PID..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? (
               <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 border border-dashed rounded-lg">No records found</div>
                ) : (
                    filteredPatients.map((patient) => (
                      <div key={patient._id} className="flex flex-col p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors bg-white">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-slate-800">{patient.firstName} {patient.lastName}</h4>
                                        <Badge variant="outline" className="text-[10px] bg-slate-50">PID-{patient.patientID}</Badge>
                                        {(patient.admitted === "Admitted") && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px]">Admitted</Badge>}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">{patient.email}</p>
                                    <p className="text-xs text-slate-500">{patient.phoneno}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(patient)}><Edit className="w-3 h-3" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => handleDeleteClick(patient._id)}><Trash2 className="w-3 h-3" /></Button>
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
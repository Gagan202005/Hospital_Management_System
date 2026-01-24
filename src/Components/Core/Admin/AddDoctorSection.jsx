import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { 
  Stethoscope, Search, Edit, Trash2, Loader2, Copy, 
  Plus, X, Save, GraduationCap, School, Users, Building2 
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Add_Doctor, Delete_Doctor, Update_Doctor, getAllUsers } from "../../../services/operations/AdminApi";

export const AddDoctorSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [doctors, setDoctors] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phoneno: "",
    dob: "", gender: "", bloodGroup: "", address: "", 
    department: "", specialization: "", experience: "", consultationFee: "",
    qualifications: [] 
  });
  const [newQual, setNewQual] = useState({ degree: "", college: "" });

  // --- Fetch ---
  const fetchDoctors = async () => {
    setIsFetching(true);
    try {
      const response = await getAllUsers(token, "doctor");
      if (Array.isArray(response)) setDoctors(response);
    } catch (error) { console.error(error); } 
    finally { setIsFetching(false); }
  };

  useEffect(() => { fetchDoctors(); }, [token]);

  // --- Stats ---
  const stats = useMemo(() => {
    return {
      total: doctors.length,
      depts: new Set(doctors.map(d => d.department)).size,
      newToday: doctors.filter(d => new Date(d.createdAt).setHours(0,0,0,0) === new Date().setHours(0,0,0,0)).length
    };
  }, [doctors]);

  // --- Handlers ---
  const handleInputChange = (e) => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));
  const handleSelectChange = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const addQual = () => {
    if (!newQual.degree || !newQual.college) return toast.error("Enter degree & college");
    setFormData(p => ({ ...p, qualifications: [...p.qualifications, newQual] }));
    setNewQual({ degree: "", college: "" });
  };

  const removeQual = (idx) => {
    setFormData(p => ({ ...p, qualifications: p.qualifications.filter((_, i) => i !== idx) }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "", lastName: "", email: "", phoneno: "", dob: "", gender: "", bloodGroup: "", 
      address: "", department: "", specialization: "", experience: "", consultationFee: "", qualifications: []
    });
    setIsEditing(false); setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.qualifications.length === 0) return toast.error("Add at least one qualification");
    
    setIsLoading(true);
    try {
      if (isEditing) {
        await Update_Doctor({ ...formData, _id: editId }, token);
        toast.success("Profile updated");
      } else {
        const res = await Add_Doctor(formData, token, dispatch);
        if(res?.generatedPassword) {
           toast.success((t) => (
               <div className="flex flex-col gap-1">
                 <span className="font-bold">Doctor Onboarded!</span>
                 <div className="flex items-center gap-2 text-sm bg-white/20 p-2 rounded mt-1">
                   Pass: <code className="font-mono font-bold">{res.generatedPassword}</code>
                   <button onClick={() => { navigator.clipboard.writeText(res.generatedPassword); toast.success("Copied"); }} className="p-1 hover:bg-black/10 rounded"><Copy className="w-3 h-3" /></button>
                 </div>
               </div>
             ), { duration: 8000 });
        }
      }
      fetchDoctors(); resetForm();
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleEditClick = (doc) => {
    setIsEditing(true); setEditId(doc._id);
    setFormData({
      firstName: doc.firstName || "", lastName: doc.lastName || "", email: doc.email || "",
      phoneno: doc.phoneno || "", dob: doc.dob || "", gender: doc.gender || "",
      bloodGroup: doc.bloodGroup || "", address: doc.address || "", department: doc.department || "",
      specialization: doc.specialization || "", experience: doc.experience || "",
      consultationFee: doc.consultationFee || "", qualifications: doc.qualification || []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this doctor?")) {
        await Delete_Doctor(id, token);
        fetchDoctors();
    }
  };

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;
    const q = searchQuery.toLowerCase();
    return doctors.filter(doc => `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(q) || doc.department.toLowerCase().includes(q));
  }, [doctors, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-indigo-50 border-indigo-100 shadow-sm"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-indigo-600 font-medium text-sm">Total Staff</p><h3 className="text-2xl font-bold text-indigo-900">{stats.total}</h3></div><Users className="h-8 w-8 text-indigo-300" /></CardContent></Card>
          <Card className="bg-purple-50 border-purple-100 shadow-sm"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-purple-600 font-medium text-sm">Departments</p><h3 className="text-2xl font-bold text-purple-900">{stats.depts}</h3></div><Building2 className="h-8 w-8 text-purple-300" /></CardContent></Card>
          <Card className="bg-emerald-50 border-emerald-100 shadow-sm"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-emerald-600 font-medium text-sm">Joined Today</p><h3 className="text-2xl font-bold text-emerald-900">{stats.newToday}</h3></div><Users className="h-8 w-8 text-emerald-300" /></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Form */}
        <Card className={`h-fit ${isEditing ? "border-indigo-500 shadow-md" : "border-slate-200"}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">{isEditing ? <Edit className="w-5 h-5 text-indigo-600"/> : <Stethoscope className="w-5 h-5 text-indigo-600"/>} {isEditing ? "Update Profile" : "Onboard Doctor"}</CardTitle>
                {isEditing && <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-500"><X className="w-4 h-4 mr-1"/> Cancel</Button>}
            </div>
            <CardDescription>Enter professional and personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>First Name</Label><Input id="firstName" value={formData.firstName} onChange={handleInputChange} required /></div>
                <div className="space-y-1"><Label>Last Name</Label><Input id="lastName" value={formData.lastName} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                <div className="space-y-1"><Label>Phone</Label><Input id="phoneno" value={formData.phoneno} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 <div className="space-y-1"><Label>DOB</Label><Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} required /></div>
                 <div className="space-y-1"><Label>Gender</Label><Select onValueChange={(v) => handleSelectChange("gender", v)} value={formData.gender}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
                 <div className="space-y-1"><Label>Blood Group</Label><Input id="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Department</Label>
                  <Select onValueChange={(v) => handleSelectChange("department", v)} value={formData.department}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "Dermatology", "General Surgery", "Oncology"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Specialization</Label><Input id="specialization" value={formData.specialization} onChange={handleInputChange} /></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Experience</Label><Input id="experience" value={formData.experience} onChange={handleInputChange} required /></div>
                <div className="space-y-1"><Label>Fee (₹)</Label><Input id="consultationFee" type="number" value={formData.consultationFee} onChange={handleInputChange} required /></div>
              </div>

              {/* Qualifications */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Education</Label>
                  <div className="flex gap-2">
                      <Input placeholder="Degree" value={newQual.degree} onChange={e=>setNewQual({...newQual, degree: e.target.value})} className="bg-white"/>
                      <Input placeholder="Institute" value={newQual.college} onChange={e=>setNewQual({...newQual, college: e.target.value})} className="bg-white"/>
                      <Button type="button" size="sm" onClick={addQual} className="bg-indigo-600"><Plus className="w-4 h-4"/></Button>
                  </div>
                  <div className="space-y-1">
                      {formData.qualifications.map((q, i) => (
                          <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded border"><span className="text-slate-700 font-medium">{q.degree} <span className="text-slate-400 font-normal">from {q.college}</span></span><button type="button" onClick={()=>removeQual(i)} className="text-red-500"><X className="w-3 h-3"/></button></div>
                      ))}
                  </div>
              </div>

              <div className="space-y-1"><Label>Address</Label><Textarea id="address" value={formData.address} onChange={handleInputChange} className="min-h-[60px]" /></div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : isEditing ? "Save Changes" : "Create Account"}</Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="h-[850px] flex flex-col border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Staff Directory</CardTitle><div className="relative mt-2"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/><Input placeholder="Search doctor..." className="pl-9" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/></div></CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div> : (
                <div className="space-y-3">
                    {filteredDoctors.map(doc => (
                        <div key={doc._id} className="flex justify-between items-start p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors bg-white">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm border border-indigo-100">{doc.firstName?.[0]}{doc.lastName?.[0]}</div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">Dr. {doc.firstName} {doc.lastName}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{doc.department} • {doc.specialization}</p>
                                    <div className="flex gap-1 mt-1">{doc.qualification?.map((q,i)=><span key={i} className="text-[10px] bg-slate-100 px-1 rounded text-slate-600 border">{q.degree}</span>)}</div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={()=>handleEditClick(doc)} className="text-blue-600 h-8 w-8"><Edit className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={()=>handleDelete(doc._id)} className="text-red-500 h-8 w-8"><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { 
  Stethoscope, Search, Edit, Trash2, Loader2, IndianRupee, Copy, 
  Plus, X, Save, GraduationCap, School, 
  Users, Building2, CalendarDays 
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import { Add_Doctor, Delete_Doctor, Update_Doctor, getAllUsers } from "../../../services/operations/AdminApi";

export const AddDoctorSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // Search & Edit State
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phoneno: "",
    dob: "", gender: "", bloodGroup: "", address: "", 
    department: "", specialization: "", experience: "", consultationFee: "",
    // Dynamic Qualifications Array
    qualifications: [] 
  });

  // Temporary State for Adding a Qualification
  const [newQual, setNewQual] = useState({ degree: "", college: "" });

  const [doctors, setDoctors] = useState([]);

  // --- Fetch Doctors ---
  const fetchDoctors = async () => {
    setIsFetching(true);
    try {
      const response = await getAllUsers(token, "doctor");
      if (Array.isArray(response)) setDoctors(response);
      else setDoctors([]);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token]);

  // =================================================================
  // STATISTICS CALCULATION
  // =================================================================
  const stats = useMemo(() => {
    const total = doctors.length;
    
    // Count unique departments
    const uniqueDepts = new Set(doctors.map(d => d.department)).size;

    // Count new joins today
    const today = new Date().setHours(0,0,0,0);
    const newToday = doctors.filter(d => {
        if(!d.createdAt) return false;
        const dDate = new Date(d.createdAt).setHours(0,0,0,0);
        return dDate === today;
    }).length;

    return { total, uniqueDepts, newToday };
  }, [doctors]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // --- Qualification Logic ---
  const addQualification = () => {
    if (!newQual.degree || !newQual.college) {
      toast.error("Please enter both Degree and College");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, newQual]
    }));
    setNewQual({ degree: "", college: "" }); 
  };

  const removeQualification = (index) => {
    const newQuals = formData.qualifications.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, qualifications: newQuals }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "", lastName: "", email: "", phoneno: "",
      dob: "", gender: "", bloodGroup: "", address: "", department: "",
      specialization: "", experience: "", consultationFee: "",
      qualifications: []
    });
    setNewQual({ degree: "", college: "" });
    setIsEditing(false);
    setEditId(null);
  };

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.qualifications.length === 0) {
        toast.error("Please add at least one qualification");
        return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        // UPDATE
        await Update_Doctor({ ...formData, _id: editId }, token);
        resetForm();
      } else {
        // ADD
        const response = await Add_Doctor(formData, token, dispatch);
        
        if(response?.generatedPassword) {
           toast.success((t) => (
               <div className="flex flex-col gap-1">
                 <span className="font-bold">Doctor Added!</span>
                 <div className="flex items-center gap-2 text-sm bg-white/20 p-1 rounded mt-1">
                   Pass: <code className="font-mono font-bold">{response.generatedPassword}</code>
                   <button onClick={() => { navigator.clipboard.writeText(response.generatedPassword); toast.success("Copied!"); }} className="p-1 hover:bg-black/10 rounded"><Copy className="w-3 h-3" /></button>
                 </div>
                 <span className="text-[10px] opacity-80">Sent via Email.</span>
               </div>
             ), { duration: 6000, position: "top-center" });
        } else {
            toast.success("Doctor Added Successfully");
        }
        resetForm();
      }
      fetchDoctors(); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Edit Handler ---
  const handleEditClick = (doc) => {
    setIsEditing(true);
    setEditId(doc._id);
    
    setFormData({
      firstName: doc.firstName || "",
      lastName: doc.lastName || "",
      email: doc.email || "",
      phoneno: doc.phoneno || "",
      dob: doc.dob || "",
      gender: doc.gender || "",
      bloodGroup: doc.bloodGroup || "",
      address: doc.address || "",
      department: doc.department || "",
      specialization: doc.specialization || "",
      experience: doc.experience || "",
      consultationFee: doc.consultationFee || "",
      qualifications: doc.qualification || []
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast("Editing mode enabled", { icon: "✏️" });
  };

  const handleDeleteDoctor = async (id) => {
    if(window.confirm("Are you sure?")) {
        await Delete_Doctor(id, token);
        fetchDoctors();
    }
  };

  // --- Search Logic ---
  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;
    const query = searchQuery.toLowerCase().trim();
    return doctors.filter((doc) => {
      const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
      const dID = (doc.doctorID || "").toString();
      const dept = (doc.department || "").toLowerCase();
      return fullName.includes(query) || dept.includes(query) || dID.startsWith(query);
    });
  }, [doctors, searchQuery]);

  return (
    <div className="space-y-6">

      {/* ======================= STATS OVERVIEW ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-indigo-50 border-indigo-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-indigo-600 font-medium">Total Doctors</p>
                      <h3 className="text-2xl font-bold text-indigo-900">{stats.total}</h3>
                  </div>
                  <Users className="h-8 w-8 text-indigo-300" />
              </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-purple-600 font-medium">Departments</p>
                      <h3 className="text-2xl font-bold text-purple-900">{stats.uniqueDepts}</h3>
                  </div>
                  <Building2 className="h-8 w-8 text-purple-300" />
              </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4 flex items-center justify-between">
                  <div>
                      <p className="text-sm text-emerald-600 font-medium">Joined Today</p>
                      <h3 className="text-2xl font-bold text-emerald-900">{stats.newToday}</h3>
                  </div>
                  <CalendarDays className="h-8 w-8 text-emerald-300" />
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* ======================= FORM CARD ======================= */}
        <Card className={`bg-white/80 backdrop-blur-sm h-fit transition-all ${isEditing ? "border-blue-500 ring-1 ring-blue-500 shadow-md" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
                <CardTitle className="flex items-center gap-2">
                {isEditing ? <Edit className="w-5 h-5 text-blue-600" /> : <Stethoscope className="w-5 h-5 text-indigo-600" />}
                {isEditing ? "Edit Doctor Details" : "Add New Doctor"}
                </CardTitle>
                <CardDescription>{isEditing ? "Update professional information" : "Auto-generated Password"}</CardDescription>
            </div>
            {isEditing && (
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-red-500 hover:bg-red-50">
                    <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name</Label><Input id="firstName" value={formData.firstName} onChange={handleInputChange} required /></div>
                <div><Label>Last Name</Label><Input id="lastName" value={formData.lastName} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} required /></div>
                <div><Label>Phone</Label><Input id="phoneno" value={formData.phoneno} onChange={handleInputChange} required /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 <div><Label>DOB</Label><Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} required /></div>
                 <div>
                    <Label>Gender</Label>
                    <Select onValueChange={(val) => handleSelectChange("gender", val)} value={formData.gender}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div><Label>Blood Group</Label><Input id="bloodGroup" placeholder="O+" value={formData.bloodGroup} onChange={handleInputChange} required /></div>
              </div>

              {/* Department & Fees */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Select onValueChange={(val) => handleSelectChange("department", val)} value={formData.department}>
                    <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="General Surgery">General Surgery</SelectItem>
                      <SelectItem value="Oncology">Oncology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Specialization</Label><Input id="specialization" value={formData.specialization} onChange={handleInputChange} /></div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div><Label>Experience</Label><Input id="experience" value={formData.experience} onChange={handleInputChange} required /></div>
                <div>
                   <Label>Consultation Fee</Label>
                   <div className="relative">
                     <IndianRupee className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                     <Input id="consultationFee" type="number" className="pl-8" value={formData.consultationFee} onChange={handleInputChange} required />
                   </div>
                </div>
              </div>

               {/* ================================================================= */}
               {/* QUALIFICATIONS SECTION */}
               {/* ================================================================= */}
               <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <Label className="flex items-center gap-2 text-indigo-700">
                       <GraduationCap className="w-4 h-4" /> Educational Qualifications
                   </Label>
                   
                   {/* Input Area */}
                   <div className="flex gap-2 items-end">
                       <div className="flex-1 space-y-1">
                           <Input 
                               placeholder="Degree (e.g. MBBS)" 
                               value={newQual.degree}
                               onChange={(e) => setNewQual({...newQual, degree: e.target.value})}
                               className="bg-white"
                           />
                       </div>
                       <div className="flex-1 space-y-1">
                           <Input 
                               placeholder="University / College" 
                               value={newQual.college}
                               onChange={(e) => setNewQual({...newQual, college: e.target.value})}
                               className="bg-white"
                           />
                       </div>
                       <Button type="button" size="sm" onClick={addQualification} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                           <Plus className="w-4 h-4" /> Add
                       </Button>
                   </div>

                   {/* List Area */}
                   {formData.qualifications.length > 0 ? (
                       <div className="flex flex-col gap-2 mt-2">
                           {formData.qualifications.map((qual, index) => (
                               <div key={index} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm text-sm animate-in fade-in slide-in-from-top-1">
                                   <div className="flex items-center gap-3">
                                       <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-600">
                                           <School className="w-3.5 h-3.5" />
                                       </div>
                                       <div>
                                           <p className="font-medium text-gray-900">{qual.degree}</p>
                                           <p className="text-xs text-gray-500">{qual.college}</p>
                                       </div>
                                   </div>
                                   <Button 
                                       type="button" 
                                       variant="ghost" 
                                       size="icon" 
                                       className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                       onClick={() => removeQualification(index)}
                                   >
                                       <X className="w-3.5 h-3.5" />
                                   </Button>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <p className="text-xs text-center text-gray-400 py-2 border-dashed border rounded">
                           No qualifications added yet.
                       </p>
                   )}
               </div>
               {/* ================================================================= */}
              
              <div><Label>Address</Label><Textarea id="address" value={formData.address} onChange={handleInputChange} required className="min-h-[60px]" /></div>

              <Button type="submit" className={`w-full text-white mt-2 ${isEditing ? "bg-indigo-600 hover:bg-indigo-700" : "bg-primary hover:bg-primary/90"}`} disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? "Updating..." : "Creating Account..."}</> : <>{isEditing ? <><Save className="w-4 h-4 mr-2"/> Update Doctor</> : "Add Doctor"}</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ======================= LIST CARD ======================= */}
        <Card className="bg-white/80 backdrop-blur-sm h-[800px] flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Medical Staff Directory</CardTitle>
            <CardDescription>Search and manage doctors</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? (
               <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
            ) : (
                <div className="space-y-3">
                  {filteredDoctors.map((doc) => (
                      <div key={doc._id} className="group flex items-start justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                      <div className="flex gap-3">
                          <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 overflow-hidden shrink-0">
                              <img src={doc.image || `https://api.dicebear.com/6.x/initials/svg?seed=Dr ${doc.firstName}`} alt="Doc" className="object-cover h-full w-full" />
                          </div>
                          <div>
                              <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">Dr. {doc.firstName} {doc.lastName}</h4>
                                  <Badge variant="secondary" className="text-[10px] h-5 bg-indigo-50 text-indigo-700 font-mono">DID-{doc.doctorID}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground font-medium">{doc.department} • {doc.specialization}</p>
                              {/* Display Qualifications */}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {doc.qualification?.map((q, i) => (
                                    <span key={i} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{q.degree}</span>
                                ))}
                              </div>
                          </div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(doc)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteDoctor(doc._id)}><Trash2 className="w-4 h-4" /></Button>
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
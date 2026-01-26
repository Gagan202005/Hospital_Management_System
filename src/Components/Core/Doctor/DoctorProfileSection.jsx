import { useState, useEffect, useRef } from "react";
import { 
  Edit, Save, X, Camera, MapPin, Phone, Mail, Award, Plus, 
  Briefcase, Loader2, Lock, KeyRound, Stethoscope, GraduationCap 
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
import { useToast } from "../../../hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "../../../lib/utils";

// API Services
import { updateDoctorProfile, updateDoctorPfp } from "../../../services/operations/DoctorApi";
import { changePassword } from "../../../services/operations/authApi"; 

export function DoctorProfileSection() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile); 
  const dispatch = useDispatch();
  const { toast } = useToast(); 
  const fileInputRef = useRef(null);
  
  // --- UI State ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- Password Modal State ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  // --- Profile Form State ---
  const [profile, setProfile] = useState({
    firstName: "", lastName: "", email: "", 
    phoneno: "", address: "", // Contact
    dob: "", age: "", gender: "", bloodGroup: "", 
    image: "", doctorID: "",
    department: "", specialization: "", qualification: [], 
    experience: "", consultationFee: "", about: ""
  });
  
  const [editedProfile, setEditedProfile] = useState(profile);

  // --- 1. Sync State with Redux (On Load) ---
  useEffect(() => {
    if (user) {
      const sanitizedData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneno: user.phoneno || "",
        address: user.address || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        age: user.age || "",
        gender: user.gender || "",
        bloodGroup: user.bloodGroup || "",
        image: user.image || "",
        doctorID: user.doctorID || "",
        department: user.department || "",
        specialization: user.specialization || "",
        qualification: user.qualification || [],
        experience: user.experience || "",
        consultationFee: user.consultationFee || 0,
        about: user.about || ""
      };
      setProfile(sanitizedData);
      setEditedProfile(sanitizedData);
    }
  }, [user]);

  // --- 2. Profile Handlers ---
  const handleEditToggle = () => { 
    if (isEditing) setEditedProfile(profile); // Reset on cancel
    setIsEditing(!isEditing); 
  };
  
  const handleInputChange = (field, value) => setEditedProfile(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    // Basic Validation
    if (!editedProfile.firstName?.trim() || !editedProfile.lastName?.trim()) {
        toast({ title: "Validation Error", description: "Name fields are required.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    try {
        await updateDoctorProfile(editedProfile, token, dispatch);
        toast({ title: "Success", description: "Profile updated successfully." });
        setIsEditing(false);
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" });
        return;
      }
      
      try {
          // Optimistic update for UI
          const objectUrl = URL.createObjectURL(file);
          setProfile(prev => ({ ...prev, image: objectUrl })); 
          setEditedProfile(prev => ({ ...prev, image: objectUrl }));
          
          // Upload
          await updateDoctorPfp(token, file, dispatch);
          toast({ title: "Success", description: "Profile picture updated." });
          
      } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to upload image";
          toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
      }
    }
  };

  // --- 3. Qualification Handlers ---
  const handleQualificationChange = (index, field, value) => {
    setEditedProfile(prev => ({
      ...prev, qualification: prev.qualification.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }));
  };
  const addQualification = () => setEditedProfile(prev => ({ ...prev, qualification: [...prev.qualification, { degree: "", college: "", year: "" }] }));
  const removeQualification = (index) => setEditedProfile(prev => ({ ...prev, qualification: prev.qualification.filter((_, i) => i !== index) }));

  // --- 4. Password Handlers ---
  const handlePassChange = (e) => setPassData({...passData, [e.target.name]: e.target.value});
  
  const submitPassword = async () => {
      if(passData.newPassword !== passData.confirmPassword) {
          toast({ title: "Mismatch", description: "New passwords do not match.", variant: "destructive" });
          return;
      }
      if(passData.newPassword.length < 6) {
          toast({ title: "Weak Password", description: "Must be at least 6 characters.", variant: "destructive" });
          return;
      }
      
      try {
          const success = await changePassword(token, passData);
          if(success) {
              setIsPasswordModalOpen(false);
              setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
              toast({ title: "Success", description: "Password changed successfully." });
          }
      } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
          toast({ title: "Error", description: errorMessage, variant: "destructive" });
      }
  };

  const currentProfile = isEditing ? editedProfile : profile;
  const fullName = `Dr. ${currentProfile.firstName} ${currentProfile.lastName}`;

  if (!user) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20 text-blue-600" />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Profile & Settings</h1>
            <p className="text-slate-500 mt-1">Manage public profile, professional details, and account security.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>} 
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleEditToggle}><X className="h-4 w-4 mr-2"/> Cancel</Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Edit className="h-4 w-4 mr-2"/> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Identity & Security */}
        <div className="space-y-6">
            
            {/* AVATAR CARD */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader><CardTitle className="text-lg text-center">Display Picture</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                        <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-sm">
                            <AvatarImage src={currentProfile.image} className="object-cover" />
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl font-bold">{currentProfile.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                        <Button size="sm" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0 shadow-md bg-white text-slate-700 hover:bg-slate-100 border border-slate-200" title="Upload Photo">
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="text-center w-full">
                        <h3 className="text-xl font-bold text-slate-800 truncate">{fullName}</h3>
                        <p className="text-slate-500 text-sm font-medium">{currentProfile.specialization || "Medical Specialist"}</p>
                        <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-600 border-slate-200">ID: {currentProfile.doctorID}</Badge>
                    </div>
                    
                    {/* Contact Preview (Read Only) */}
                    <div className="w-full pt-4 border-t border-slate-100 space-y-3 text-sm">
                        <div className="flex items-center gap-3 text-slate-700">
                            <Mail className="w-4 h-4 text-slate-400 shrink-0"/> <span className="truncate">{currentProfile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-700">
                            <Phone className="w-4 h-4 text-slate-400 shrink-0"/> {currentProfile.phoneno || "No phone added"}
                        </div>
                        <div className="flex items-start gap-3 text-slate-700">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0"/> <span className="flex-1 line-clamp-2">{currentProfile.address || "No address added"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECURITY CARD */}
            <Card className="shadow-sm border-slate-200 border-l-4 border-l-blue-500 bg-blue-50/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-2 text-slate-800">
                        <Lock className="w-4 h-4 text-blue-500"/> Account Security
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-slate-500 mb-4">Update your password regularly to protect sensitive patient data.</p>
                    <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setIsPasswordModalOpen(true)}>
                        <KeyRound className="w-4 h-4 mr-2"/> Change Password
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* PERSONAL & CONTACT INFO */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader><CardTitle className="flex items-center gap-2 text-slate-800"><Stethoscope className="w-5 h-5 text-blue-600"/> Personal & Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>First Name <span className="text-red-500">*</span></Label><Input value={currentProfile.firstName} onChange={(e)=>handleInputChange("firstName", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                        <div className="space-y-2"><Label>Last Name <span className="text-red-500">*</span></Label><Input value={currentProfile.lastName} onChange={(e)=>handleInputChange("lastName", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                        <div className="space-y-2"><Label>Phone Number</Label><Input value={currentProfile.phoneno} onChange={(e)=>handleInputChange("phoneno", e.target.value)} disabled={!isEditing} className="bg-white" placeholder="+91 9876543210"/></div>
                        <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={currentProfile.dob} onChange={(e)=>handleInputChange("dob", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                        <div className="space-y-2"><Label>Gender</Label>
                            {isEditing ? (
                                <Select value={currentProfile.gender} onValueChange={(val)=>handleInputChange("gender", val)}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                                </Select>
                            ) : <Input value={currentProfile.gender} disabled className="bg-slate-50"/>}
                        </div>
                        <div className="space-y-2"><Label>Blood Group</Label>
                            {isEditing ? (
                                <Select value={currentProfile.bloodGroup} onValueChange={(val)=>handleInputChange("bloodGroup", val)}>
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                                </Select>
                            ) : <Input value={currentProfile.bloodGroup} disabled className="bg-slate-50"/>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Residential Address</Label>
                        <Textarea value={currentProfile.address} onChange={(e)=>handleInputChange("address", e.target.value)} disabled={!isEditing} className="bg-white min-h-[80px]" placeholder="Enter full address..."/>
                    </div>
                </CardContent>
            </Card>

            {/* PROFESSIONAL INFO */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader><CardTitle className="flex items-center gap-2 text-slate-800"><Briefcase className="w-5 h-5 text-purple-600"/> Professional Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Department <span className="text-red-500">*</span></Label><Input value={currentProfile.department} onChange={(e)=>handleInputChange("department", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                        <div className="space-y-2"><Label>Specialization</Label><Input value={currentProfile.specialization} onChange={(e)=>handleInputChange("specialization", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                        <div className="space-y-2"><Label>Experience (Years)</Label><Input value={currentProfile.experience} onChange={(e)=>handleInputChange("experience", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                        <div className="space-y-2"><Label>Consultation Fee (₹)</Label><Input type="number" value={currentProfile.consultationFee} onChange={(e)=>handleInputChange("consultationFee", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                    </div>
                    <div className="space-y-2">
                        <Label>About / Bio</Label>
                        <Textarea value={currentProfile.about} onChange={(e)=>handleInputChange("about", e.target.value)} disabled={!isEditing} className="bg-white" rows={3} placeholder="Brief professional bio..."/>
                    </div>
                </CardContent>
            </Card>

            {/* QUALIFICATIONS */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-slate-800">
                        <span className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-600"/> Qualifications</span>
                        {isEditing && <Button size="sm" onClick={addQualification} variant="outline" className="h-8"><Plus className="w-4 h-4 mr-1"/> Add</Button>}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentProfile.qualification.map((qual, index) => (
                        <div key={index} className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1"><Label className="text-xs text-slate-500 uppercase">Degree</Label><Input value={qual.degree} onChange={(e)=>handleQualificationChange(index, "degree", e.target.value)} disabled={!isEditing} className="bg-white h-9" placeholder="e.g. MBBS"/></div>
                                <div className="space-y-1"><Label className="text-xs text-slate-500 uppercase">Institute</Label><Input value={qual.college} onChange={(e)=>handleQualificationChange(index, "college", e.target.value)} disabled={!isEditing} className="bg-white h-9" placeholder="University Name"/></div>
                                <div className="space-y-1"><Label className="text-xs text-slate-500 uppercase">Year</Label><Input value={qual.year} onChange={(e)=>handleQualificationChange(index, "year", e.target.value)} disabled={!isEditing} className="bg-white h-9" placeholder="YYYY"/></div>
                            </div>
                            {isEditing && <div className="flex justify-end"><Button size="sm" variant="ghost" className="text-red-500 h-6 px-2 hover:bg-red-50" onClick={()=>removeQualification(index)}>Remove</Button></div>}
                        </div>
                    ))}
                    {currentProfile.qualification.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4 border border-dashed rounded-lg">No qualifications listed yet.</p>}
                </CardContent>
            </Card>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Update Password</DialogTitle>
                <DialogDescription>Create a strong password to secure your account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" name="oldPassword" value={passData.oldPassword} onChange={handlePassChange} placeholder="••••••••"/></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange} placeholder="Min 6 chars"/></div>
                <div className="space-y-2"><Label>Confirm New</Label><Input type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePassChange} placeholder="Re-enter new"/></div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={()=>setIsPasswordModalOpen(false)}>Cancel</Button>
                <Button onClick={submitPassword} className="bg-blue-600 hover:bg-blue-700">Update Credentials</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { Edit, Save, X, Camera, MapPin, Phone, Mail, User, Shield, Loader2, Lock, KeyRound } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog";
// Using the hook version of toast
import { useToast } from "../../../hooks/use-toast"; 
import { useSelector, useDispatch } from "react-redux";

// API
import { updateAdminProfile, updateAdminPfp } from "../../../services/operations/AdminApi";
import { changePassword } from "../../../services/operations/authApi"; 

export function AdminProfileSection() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile); 
  const dispatch = useDispatch();
  const { toast } = useToast(); 
  const fileInputRef = useRef(null);
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Password State
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  // Profile State
  const [profile, setProfile] = useState({
    firstName: "", lastName: "", email: "", phoneno: "", 
    dob: "", age: "", gender: "", address: "", image: "", 
    adminID: "", about: ""
  });
  
  // Editing State (Separate from display state)
  const [editedProfile, setEditedProfile] = useState(profile);

  // --- Sync State with Redux ---
  useEffect(() => {
    if (user) {
      const sanitizedData = {
        firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "",
        phoneno: user.phoneno || "", dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        age: user.age || "", gender: user.gender || "", address: user.address || "",
        image: user.image || "", adminID: user.adminID || "", about: user.about || ""
      };
      setProfile(sanitizedData);
      setEditedProfile(sanitizedData);
    }
  }, [user]);

  // --- Handlers: Profile ---
  const handleEditToggle = () => { 
      if (isEditing) setEditedProfile(profile); // Reset changes if cancelling
      setIsEditing(!isEditing); 
  };
  
  const handleSave = async () => {
    // 1. Validation
    if (!editedProfile.firstName?.trim() || !editedProfile.phoneno?.trim()) {
        toast({ title: "Validation Error", description: "Name and Phone are required.", variant: "destructive" });
        return;
    }

    // 2. API Call with Try/Catch
    try {
        await updateAdminProfile(editedProfile, token, dispatch);
        
        toast({ title: "Success", description: "Profile updated successfully." });
        setIsEditing(false);

    } catch (error) {
        // 4. Error Handling
        const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
          await updateAdminPfp(token, file, dispatch);
          
          setProfile(prev => ({ ...prev, image: URL.createObjectURL(file) }));
          toast({ title: "Success", description: "Profile picture updated." });

      } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Failed to upload image";
          toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
      }
    }
  };

  const handleInputChange = (field, value) => setEditedProfile(prev => ({ ...prev, [field]: value }));

  // --- Handlers: Password ---
  const handlePassChange = (e) => setPassData({...passData, [e.target.name]: e.target.value});
  
  const submitPassword = async () => {
      // Client-side validation
      if(passData.newPassword !== passData.confirmPassword) {
          toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
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
           console.error("CHANGE PASSWORD ERROR:", error);
           // >>> SHOW BACKEND ERROR MESSAGE <<<
           const errorMessage = error.response?.data?.message || error.message || "Failed to change password.";
           toast({ title: "Error", description: errorMessage, variant: "destructive" });
      }
  };

  const currentProfile = isEditing ? editedProfile : profile;
  const fullName = `${currentProfile.firstName} ${currentProfile.lastName}`;

  if (!user) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20 text-slate-600" />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Profile</h1>
            <p className="text-slate-500 mt-1">Manage system identity and credentials.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white"><Save className="h-4 w-4 mr-2"/> Save</Button>
              <Button variant="outline" onClick={handleEditToggle}><X className="h-4 w-4 mr-2"/> Cancel</Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Edit className="h-4 w-4 mr-2"/> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
            {/* ID CARD */}
            <Card className="shadow-sm border-slate-200 border-t-4 border-t-indigo-600">
                <CardHeader><CardTitle>Identity Card</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                        <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-md">
                            <AvatarImage src={currentProfile.image} className="object-cover"/>
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 text-2xl font-bold">{currentProfile.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                        <Button size="sm" onClick={() => fileInputRef.current.click()} className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0 bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50">
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-900">{fullName}</h3>
                        <p className="text-sm text-slate-500 font-medium">System Administrator</p>
                        <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-600">ID: #{currentProfile.adminID}</Badge>
                    </div>
                    <div className="w-full pt-4 border-t border-slate-100 space-y-3 text-sm">
                        <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400"/> {currentProfile.email}</div>
                        <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400"/> {currentProfile.phoneno}</div>
                        <div className="flex items-start gap-3"><MapPin className="w-4 h-4 text-slate-400 mt-0.5"/> <span className="flex-1">{currentProfile.address}</span></div>
                    </div>
                </CardContent>
            </Card>

            {/* SECURITY CARD */}
            <Card className="shadow-sm border-slate-200 border-l-4 border-l-red-500 bg-red-50/10">
                <CardHeader className="pb-3"><CardTitle className="text-md flex items-center gap-2"><Lock className="w-4 h-4 text-red-500"/> Security</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-xs text-slate-500 mb-4">Maintain high security protocols for admin access.</p>
                    <Button variant="outline" size="sm" className="w-full border-red-200 text-red-700 hover:bg-red-50" onClick={() => setIsPasswordModalOpen(true)}>
                        <KeyRound className="w-4 h-4 mr-2"/> Change Password
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* PERSONAL DETAILS */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-indigo-500"/> Personal Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>First Name</Label><Input value={currentProfile.firstName} onChange={(e)=>handleInputChange("firstName", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input value={currentProfile.lastName} onChange={(e)=>handleInputChange("lastName", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={currentProfile.phoneno} onChange={(e)=>handleInputChange("phoneno", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                    <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={currentProfile.dob} onChange={(e)=>handleInputChange("dob", e.target.value)} disabled={!isEditing} className="bg-white"/></div>
                    <div className="space-y-2 col-span-2"><Label>Residential Address</Label><Textarea value={currentProfile.address} onChange={(e)=>handleInputChange("address", e.target.value)} disabled={!isEditing} className="bg-white min-h-[80px]"/></div>
                </CardContent>
            </Card>

            {/* BIO */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-indigo-500"/> Bio & Role</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2"><Label>About</Label><Textarea value={currentProfile.about} onChange={(e)=>handleInputChange("about", e.target.value)} disabled={!isEditing} className="bg-white" rows={4} placeholder="Describe your administrative role..."/></div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Secure Credentials</DialogTitle><DialogDescription>Update your administrator password.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" name="oldPassword" value={passData.oldPassword} onChange={handlePassChange} placeholder="••••••••"/></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" name="newPassword" value={passData.newPassword} onChange={handlePassChange} placeholder="Strong password"/></div>
                <div className="space-y-2"><Label>Confirm New</Label><Input type="password" name="confirmPassword" value={passData.confirmPassword} onChange={handlePassChange} placeholder="Re-enter"/></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={()=>setIsPasswordModalOpen(false)}>Cancel</Button><Button onClick={submitPassword} className="bg-slate-900 hover:bg-slate-800">Update Password</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
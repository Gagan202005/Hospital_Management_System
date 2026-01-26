import { useState, useRef, useEffect } from "react";
import { 
  User, Edit, Save, X, Camera, MapPin, Phone, Mail, 
  Droplet, HeartPulse, UserCog, Lock, KeyRound, Loader2 
} from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { useToast } from "../../../hooks/use-toast"; 
import { useDispatch, useSelector } from "react-redux";

// API Imports
import { UpdatePfp, updateprofile } from "../../../services/operations/PatientApi";
import { changePassword } from "../../../services/operations/authApi"; 

export default function PatientProfileSection() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  
  // --- UI States ---
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // --- Data States ---
  const [pfpFile, setPfpFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(user?.image); 

  // Profile Form Data
  const [profile, setProfile] = useState(initializeProfile(user));
  const [editedProfile, setEditedProfile] = useState(profile);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  // --- 1. Sync State with Redux ---
  useEffect(() => {
    if (user) {
        setPreviewUrl(user.image);
        setPfpFile(null); 
        const newData = initializeProfile(user);
        setProfile(newData);
        setEditedProfile(newData);
    }
  }, [user]);

  function initializeProfile(userData) {
    if (!userData) return {};
    return {
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      phoneno: userData.phoneno || "",
      address: userData.address || "",
      DOB: userData.DOB ? new Date(userData.DOB).toISOString().split('T')[0] : "",
      gender: userData.gender || "Not specified",
      bloodgroup: userData.bloodgroup || "Not specified",
      emergencyContactName: userData.emergencyContactName || "",
      emergencyContactPhone: userData.emergencyContactPhone || "",
    };
  }

  // --- 2. Action Handlers: Profile ---
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(profile); // Revert changes
      setPreviewUrl(user.image);
      setPfpFile(null);
    }
    setIsEditing(!isEditing);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
        return;
      }
      setPfpFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editedProfile.firstName || !editedProfile.phoneno) {
        toast({ title: "Validation Error", description: "Name and Phone are required", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    try {
        // Upload Picture if changed
        if (pfpFile) {
            await UpdatePfp(token, pfpFile, user.accountType, dispatch);
        }
        
        // Update Details
        await updateprofile(editedProfile, token, dispatch);
        
        toast({ title: "Success", description: "Profile updated successfully." });
        setIsEditing(false);
    } catch (error) {
        console.error(error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  // --- 3. Action Handlers: Password ---
  const handlePassChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmitPassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({ title: "Mismatch", description: "Passwords do not match", variant: "destructive" });
        return;
    }
    if (passwordData.newPassword.length < 6) {
        toast({ title: "Weak Password", description: "Must be at least 6 characters", variant: "destructive" });
        return;
    }

    try {
        const success = await changePassword(token, passwordData);
        if (success) {
            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            toast({ title: "Success", description: "Password changed successfully." });
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  if (!user) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400"/></div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Demographics & Account</h1>
            <p className="text-slate-500 mt-1">Manage your personal details and account security.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleEditToggle} disabled={isLoading}><X className="h-4 w-4 mr-2" /> Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2" />} 
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Edit className="h-4 w-4 mr-2" /> Update Details
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Summary */}
        <div className="space-y-6">
            <Card className="shadow-sm border-slate-200 h-fit">
                <CardHeader className="text-center">
                    <CardTitle className="text-lg">Patient Photo</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-slate-50 shadow-sm">
                        <AvatarImage src={previewUrl} className="object-cover"/>
                        <AvatarFallback className="text-2xl font-bold text-slate-400">
                            {profile.firstName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                        <div 
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <Camera className="w-8 h-8 text-white" />
                            <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*"/>
                        </div>
                    )}
                    </div>
                    
                    <div className="text-center w-full">
                        <h3 className="font-bold text-xl text-slate-800">{profile.firstName} {profile.lastName}</h3>
                        <div className="flex justify-center gap-2 mt-2">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">PID-{user.patientID || "N/A"}</Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                        </div>
                    </div>

                    <div className="w-full space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Mail className="w-4 h-4 text-slate-400"/> {profile.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400"/> {profile.phoneno}
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5"/> {profile.address || "No address on file"}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECURITY SETTINGS CARD */}
            <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-400 bg-orange-50/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-2 text-slate-800">
                        <Lock className="w-4 h-4 text-orange-500"/> Security Settings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-slate-500 mb-4">
                        Protect your medical data. Update your password regularly.
                    </p>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                        onClick={() => setIsPasswordModalOpen(true)}
                    >
                        <KeyRound className="w-4 h-4 mr-2"/> Change Password
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Bio Data */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <UserCog className="w-5 h-5 text-blue-600"/> Biodata & Identity
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="First Name" id="firstName" value={editedProfile.firstName} onChange={handleInputChange} isEditing={isEditing} />
                    <FormField label="Last Name" id="lastName" value={editedProfile.lastName} onChange={handleInputChange} isEditing={isEditing} />
                    <FormField label="Date of Birth" id="DOB" type="date" value={editedProfile.DOB} onChange={handleInputChange} isEditing={isEditing} />
                    
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Gender</Label>
                        {isEditing ? (
                            <Select value={editedProfile.gender} onValueChange={(val) => handleInputChange("gender", val)}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : <div className="p-2 bg-slate-50 border border-slate-100 rounded text-sm text-slate-700 capitalize">{editedProfile.gender}</div>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Blood Type (ABO/Rh)</Label>
                        {isEditing ? (
                            <Select value={editedProfile.bloodgroup} onValueChange={(val) => handleInputChange("bloodgroup", val)}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded text-sm font-bold text-red-600">
                                <Droplet className="w-3 h-3 fill-current"/> {editedProfile.bloodgroup}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 2. Contact Info */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <MapPin className="w-5 h-5 text-emerald-600"/> Residential Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 uppercase">Current Address</Label>
                        {isEditing ? (
                            <Textarea 
                                value={editedProfile.address} 
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                className="bg-white min-h-[80px]"
                            />
                        ) : <div className="p-3 bg-slate-50 border border-slate-100 rounded text-sm text-slate-700 whitespace-pre-wrap">{editedProfile.address || "Not provided"}</div>}
                    </div>
                </CardContent>
            </Card>

            {/* 3. Emergency */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <HeartPulse className="w-5 h-5 text-red-500"/> Emergency Contact
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Contact Person Name" id="emergencyContactName" value={editedProfile.emergencyContactName} onChange={handleInputChange} isEditing={isEditing} />
                    <FormField label="Emergency Phone" id="emergencyContactPhone" value={editedProfile.emergencyContactPhone} onChange={handleInputChange} isEditing={isEditing} />
                </CardContent>
            </Card>

        </div>
      </div>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                    Enter your current password and a new password to update your credentials.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <Input 
                        id="oldPassword" 
                        name="oldPassword"
                        type="password" 
                        value={passwordData.oldPassword}
                        onChange={handlePassChange}
                        placeholder="••••••••"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                        id="newPassword" 
                        name="newPassword"
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={handlePassChange}
                        placeholder="Min. 6 characters"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                        id="confirmPassword" 
                        name="confirmPassword"
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={handlePassChange}
                        placeholder="Re-enter new password"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitPassword} className="bg-emerald-600 hover:bg-emerald-700">Update Password</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Helper Sub-Component
function FormField({ label, id, value, onChange, isEditing, type = "text" }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-xs font-semibold text-slate-500 uppercase">{label}</Label>
            {isEditing ? (
                <Input id={id} type={type} value={value} onChange={(e) => onChange(id, e.target.value)} className="bg-white" />
            ) : (
                <div className="p-2 bg-slate-50 border border-slate-100 rounded text-sm text-slate-700 min-h-[38px] flex items-center">
                    {value || <span className="text-slate-400 italic">Not set</span>}
                </div>
            )}
        </div>
    );
}
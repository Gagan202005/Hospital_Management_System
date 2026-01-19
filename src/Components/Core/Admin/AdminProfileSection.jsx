import { useState, useEffect, useRef } from "react";
import { Edit, Save, X, Camera, MapPin, Phone, Mail, User, Calendar, Shield, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useToast } from "../../../hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { cn } from "../../../lib/utils";
import { setUser } from "../../../Slices/profileslice"; 

// IMPORT ALL 3 FUNCTIONS
import { 
  updateAdminProfile, 
  updateAdminPfp, 
} from "../../../services/operations/AdminApi";

export function AdminProfileSection() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile); 
  
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Errors State
  const [errors, setErrors] = useState({});

  // Initial State matching Admin Schema
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneno: "", 
    dob: "",
    age: "",
    gender: "",
    address: "",
    image: "", 
    adminID: "", // Read-only
    about: ""
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  // --- 2. Sync Local State with Redux ---
  useEffect(() => {
    if (user) {
      const sanitizedData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneno: user.phoneno || "",
        dob: user.dob || "",
        age: user.age || "",
        gender: user.gender || "",
        address: user.address || "",
        image: user.image || "",
        adminID: user.adminID || "",
        about: user.about || ""
      };
      
      setProfile(sanitizedData);
      setEditedProfile(sanitizedData);
    }
  }, [user]);

  // --- 3. Validation Logic ---
  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^\+?[0-9]{10,15}$/; 

    if (!editedProfile.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!editedProfile.lastName?.trim()) newErrors.lastName = "Last name is required";
    
    // Validating Phone
    if (!editedProfile.phoneno?.trim()) {
      newErrors.phoneno = "Phone number is required";
    } else if (!phoneRegex.test(editedProfile.phoneno.replace(/[\s()-]/g, ''))) {
       newErrors.phoneno = "Invalid phone number";
    }

    if (!editedProfile.age || editedProfile.age < 18 || editedProfile.age > 100) {
      newErrors.age = "Valid age (18-100) is required";
    }
    
    if (!editedProfile.address?.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 4. Handlers ---
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(profile); // Revert changes
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted errors.",
        variant: "destructive",
      });
      return;
    }

    await updateAdminProfile(editedProfile, token, dispatch, toast);
    setIsEditing(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await updateAdminPfp(token, file, dispatch, toast);
      const objectUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, image: objectUrl }));
      setEditedProfile(prev => ({ ...prev, image: objectUrl }));
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`;

  if (isLoading && !profile.firstName) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleEditToggle} className="flex items-center gap-2 text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Left Column: Photo & Contact --- */}
        <Card className="shadow-lg border-t-4 border-t-blue-500 lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                  <AvatarImage src={profile.image} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  size="sm" 
                  onClick={handleCameraClick}
                  className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0 shadow-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                  title="Change Profile Picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                <p className="text-sm text-gray-500 font-medium">System Administrator</p>
                <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-200">
                  ID: #{profile.adminID || "N/A"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <Mail className="h-4 w-4" />
                </div>
                <span className="truncate font-medium text-gray-700">{profile.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <Phone className="h-4 w-4" />
                </div>
                <span className="font-medium text-gray-700">{profile.phoneno || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600 mt-0.5">
                    <MapPin className="h-4 w-4" />
                </div>
                <span className="flex-1 font-medium text-gray-700">{profile.address || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Right Column: Edit Form --- */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={errors.firstName ? "text-red-500" : ""}>First Name</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="firstName"
                        value={editedProfile.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                    </>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[2.5rem] flex items-center">
                        {profile.firstName}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={errors.lastName ? "text-red-500" : ""}>Last Name</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="lastName"
                        value={editedProfile.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                    </>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[2.5rem] flex items-center">
                        {profile.lastName}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phoneno" className={errors.phoneno ? "text-red-500" : ""}>Phone Number</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="phoneno"
                        type="tel"
                        value={editedProfile.phoneno}
                        onChange={(e) => handleInputChange("phoneno", e.target.value)}
                        className={errors.phoneno ? "border-red-500 focus-visible:ring-red-500" : ""}
                        placeholder="1234567890"
                      />
                      {errors.phoneno && <p className="text-xs text-red-500">{errors.phoneno}</p>}
                    </>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[2.5rem] flex items-center">
                        {profile.phoneno}
                    </div>
                  )}
                </div>

                {/* DOB */}
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      id="dob"
                      type="date"
                      value={editedProfile.dob ? editedProfile.dob.split('T')[0] : ''}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[2.5rem] flex items-center">
                        {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[2.5rem] flex items-center">
                        {profile.gender}
                    </div>
                  )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className={errors.age ? "text-red-500" : ""}>Age</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="age"
                        type="number"
                        value={editedProfile.age}
                        onChange={(e) => handleInputChange("age", parseInt(e.target.value) || "")}
                        className={errors.age ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
                    </>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[2.5rem] flex items-center">
                        {profile.age} Years
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>Address</Label>
                {isEditing ? (
                  <>
                  <Textarea
                    id="address"
                    value={editedProfile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={2}
                    className={errors.address ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                  </>
                ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[2.5rem] flex items-center">
                        {profile.address}
                    </div>
                )}
              </div>
            </CardContent>
          </Card>

           {/* About / Bio */}
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Bio & About
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                {isEditing ? (
                  <Textarea
                    id="about"
                    value={editedProfile.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    rows={4}
                    placeholder="Write something about your role..."
                  />
                ) : (
                    <div className="p-2 bg-gray-50 rounded-md border border-gray-100 text-sm font-medium text-gray-700 min-h-[5rem] whitespace-pre-wrap">
                        {profile.about || "No bio available."}
                    </div>
                )}
              </div>
            </CardContent>
           </Card>

        </div>
      </div>
    </div>
  );
}
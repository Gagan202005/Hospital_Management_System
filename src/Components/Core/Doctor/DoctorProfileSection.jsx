import { useState, useEffect, useRef } from "react";
import { Edit, Save, X, Camera, MapPin, Phone, Mail, Award, Plus, Droplet, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useToast } from "../../../hooks/use-toast"; // Correct Hook Import
import { useSelector, useDispatch } from "react-redux";
import { cn } from "../../../lib/utils";
import { setUser } from "../../../Slices/profileslice"; 

// Import Service Functions
import { fetchDoctorProfile, updateDoctorProfile, updateDoctorPfp } from "../../../services/operations/DoctorApi";

export function DoctorProfileSection() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile); 
  
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  // 1. Get the toast function from the hook
  const { toast } = useToast(); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initial State
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneno: "", 
    dob: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
    image: "", 
    doctorID: "",
    department: "",
    specialization: "",
    qualification: [], 
    experience: "",
    consultationFee: "",
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
        bloodGroup: user.bloodGroup || "",
        address: user.address || "",
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

  // --- 3. Validation Logic ---
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/; 

    if (!editedProfile.firstName?.trim()) newErrors.firstName = "First name is required";
    if (!editedProfile.lastName?.trim()) newErrors.lastName = "Last name is required";
    
    if (!editedProfile.phoneno?.trim()) {
      newErrors.phoneno = "Phone number is required";
    } else if (!phoneRegex.test(editedProfile.phoneno.replace(/[\s()-]/g, ''))) {
       newErrors.phoneno = "Invalid phone number (10-15 digits)";
    }

    if (!editedProfile.age || editedProfile.age < 18 || editedProfile.age > 100) {
      newErrors.age = "Valid age (18-100) is required";
    }

    if (editedProfile.consultationFee < 0) {
      newErrors.consultationFee = "Fee cannot be negative";
    }

    if (!editedProfile.department?.trim()) newErrors.department = "Department is required";
    if (!editedProfile.experience?.trim()) newErrors.experience = "Experience is required";

    editedProfile.qualification.forEach((qual, index) => {
      if (!qual.degree?.trim() || !qual.college?.trim()) {
        newErrors[`qual_${index}`] = "Degree and College are required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- 4. Handlers ---
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(profile);
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted errors before saving.",
        variant: "destructive",
      });
      return;
    }

    // PASS TOAST AS ARGUMENT HERE
    await updateDoctorProfile(editedProfile, token, dispatch, toast);
    setIsEditing(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // PASS TOAST AS ARGUMENT HERE
      await updateDoctorPfp(token, file, dispatch, toast);
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

  const handleQualificationChange = (index, field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      qualification: prev.qualification.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
    if (errors[`qual_${index}`]) {
      setErrors(prev => ({ ...prev, [`qual_${index}`]: null }));
    }
  };

  const addQualification = () => {
    setEditedProfile(prev => ({
      ...prev,
      qualification: [...prev.qualification, { degree: "", college: "", year: "" }]
    }));
  };

  const removeQualification = (index) => {
    setEditedProfile(prev => ({
      ...prev,
      qualification: prev.qualification.filter((_, i) => i !== index)
    }));
  };

  const currentProfile = isEditing ? editedProfile : profile;
  const fullName = `Dr. ${currentProfile.firstName || ""} ${currentProfile.lastName || ""}`;

  if (isLoading && !profile.firstName) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Doctor Profile</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleEditToggle} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEditToggle} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- CARD 1: Profile Photo --- */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-sm">
                  <AvatarImage src={currentProfile.image} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {currentProfile.firstName?.[0]}{currentProfile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <Button 
                  size="sm" 
                  onClick={handleCameraClick}
                  className="absolute -bottom-2 -right-2 rounded-full h-9 w-9 p-0 shadow-md transition-transform hover:scale-105"
                  title="Change Profile Picture"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">{fullName}</h3>
                <p className="text-muted-foreground">{currentProfile.specialization || "Specialization N/A"}</p>
                <Badge variant="secondary" className="mt-2">
                  ID: {currentProfile.doctorID || "N/A"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{currentProfile.email || "Email not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{currentProfile.phoneno || "Phone not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplet className="h-4 w-4 text-muted-foreground" />
                <span>Blood Group: {currentProfile.bloodGroup || "N/A"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="flex-1">{currentProfile.address || "Address not provided"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- CARD 2: DETAILS --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>First Name *</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="firstName"
                        value={editedProfile.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-destructive" : ""}
                      />
                      {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                    </>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>Last Name *</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="lastName"
                        value={editedProfile.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                      {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                    </>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneno" className={errors.phoneno ? "text-destructive" : ""}>Phone *</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="phoneno"
                        value={editedProfile.phoneno}
                        onChange={(e) => handleInputChange("phoneno", e.target.value)}
                        className={errors.phoneno ? "border-destructive" : ""}
                        placeholder="1234567890"
                      />
                      {errors.phoneno && <p className="text-xs text-destructive">{errors.phoneno}</p>}
                    </>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.phoneno}</p>
                  )}
                </div>

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
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">
                      {currentProfile.dob ? new Date(currentProfile.dob).toLocaleDateString() : 'N/A'}
                    </p>
                  )}
                </div>

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
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.gender}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.bloodGroup}
                      onValueChange={(value) => handleInputChange("bloodGroup", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.bloodGroup}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className={errors.age ? "text-destructive" : ""}>Age *</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="age"
                        type="number"
                        value={editedProfile.age}
                        onChange={(e) => handleInputChange("age", parseInt(e.target.value) || "")}
                        className={errors.age ? "border-destructive" : ""}
                      />
                      {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
                    </>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">
                      {currentProfile.age ? `${currentProfile.age} years` : 'N/A'}
                    </p>
                  )}
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={editedProfile.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-2">
                  <Label htmlFor="department" className={errors.department ? "text-destructive" : ""}>Department *</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="department"
                        value={editedProfile.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        className={errors.department ? "border-destructive" : ""}
                      />
                      {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
                    </>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.department}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  {isEditing ? (
                    <Input
                      id="specialization"
                      value={editedProfile.specialization}
                      onChange={(e) => handleInputChange("specialization", e.target.value)}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.specialization}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className={errors.experience ? "text-destructive" : ""}>Experience *</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="experience"
                        value={editedProfile.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        placeholder="e.g., 15 Years"
                        className={errors.experience ? "border-destructive" : ""}
                      />
                      {errors.experience && <p className="text-xs text-destructive">{errors.experience}</p>}
                    </>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.experience}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fee" className={errors.consultationFee ? "text-destructive" : ""}>Consultation Fee ($)</Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="fee"
                        type="number"
                        value={editedProfile.consultationFee}
                        onChange={(e) => handleInputChange("consultationFee", parseInt(e.target.value) || 0)}
                        className={errors.consultationFee ? "border-destructive" : ""}
                      />
                      {errors.consultationFee && <p className="text-xs text-destructive">{errors.consultationFee}</p>}
                    </>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">${currentProfile.consultationFee}</p>
                  )}
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                {isEditing ? (
                  <Textarea
                    id="about"
                    value={editedProfile.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded min-h-[2.5rem] flex items-center">{currentProfile.about}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Qualifications
                </span>
                {isEditing && (
                  <Button size="sm" onClick={addQualification}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Qualification
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentProfile.qualification.map((qual, index) => (
                <div key={index} className={cn("p-4 border border-border rounded-lg space-y-3", errors[`qual_${index}`] && "border-destructive/50 bg-destructive/5")}>
                  {isEditing ? (
                    <>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQualification(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Degree *</Label>
                          <Input
                            value={qual.degree}
                            onChange={(e) => handleQualificationChange(index, "degree", e.target.value)}
                            placeholder="e.g., MBBS"
                            className={!qual.degree && errors[`qual_${index}`] ? "border-destructive" : ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">College/University *</Label>
                          <Input
                            value={qual.college}
                            onChange={(e) => handleQualificationChange(index, "college", e.target.value)}
                            placeholder="e.g., AIIMS Delhi"
                            className={!qual.college && errors[`qual_${index}`] ? "border-destructive" : ""}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Year</Label>
                          <Input
                            value={qual.year}
                            onChange={(e) => handleQualificationChange(index, "year", e.target.value)}
                            placeholder="e.g., 2010"
                          />
                        </div>
                      </div>
                      {errors[`qual_${index}`] && <p className="text-xs text-destructive text-center mt-2">{errors[`qual_${index}`]}</p>}
                    </>
                  ) : (
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{qual.degree}</p>
                        <p className="text-sm text-muted-foreground">{qual.college}</p>
                        {qual.year && (
                          <Badge variant="outline" className="mt-1">{qual.year}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {currentProfile.qualification.length === 0 && !isEditing && (
                <p className="text-sm text-muted-foreground text-center py-4">No qualifications added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
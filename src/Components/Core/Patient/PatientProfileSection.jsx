import { useState, useRef, useEffect } from "react";
import { User, Edit, Save, X, Camera, MapPin, Phone, Mail, Calendar, Heart } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useToast } from "../../../hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { UpdatePfp } from "../../../services/operations/PatientApi";
import { updateprofile } from "../../../services/operations/PatientApi";

export default function PatientProfileSection() {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const user = useSelector((state) => state.profile.user);
  const fileInputRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  
  // State for images
  const [pfp, setPfp] = useState(user.image);
  const [profilePicture, setprofilePicture] = useState(user.image);

  // State for profile data
  const [profile, setProfile] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneno: user.phoneno,
    address: (user.address !== "" ? user.address : "ADD ADDRESS"),
    DOB: (user.DOB ? (user.DOB instanceof Date ? user.DOB.toISOString().split('T')[0] : new Date(user.DOB).toISOString().split('T')[0]) : "ADD DOB"),
    gender: (user.gender ? user.gender : "ADD GENDER"),
    bloodgroup: (user.bloodgroup ? user.bloodgroup : "ADD BLOODGROUP"),
    emergencyContactName: (user.emergencyContactName !== "" ? user.emergencyContactName : "ADD NAME"),
    emergencyContactPhone: (user.emergencyContactPhone !== "" ? user.emergencyContactPhone : "ADD CONTACT NUMBER"),
  });

  const [editedProfile, setEditedProfile] = useState(profile);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  // ---------------------------------------------------------
  // 1. SYNC WITH REDUX: This fixes the image update issue
  // ---------------------------------------------------------
  useEffect(() => {
    // Whenever the global 'user' state updates (after API success), update local state
    setprofilePicture(user.image);
    setPfp(user.image);
    
    const updatedProfileData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneno: user.phoneno,
        address: (user.address !== "" ? user.address : "ADD ADDRESS"),
        DOB: (user.DOB ? (user.DOB instanceof Date ? user.DOB.toISOString().split('T')[0] : new Date(user.DOB).toISOString().split('T')[0]) : "ADD DOB"),
        gender: (user.gender ? user.gender : "ADD GENDER"),
        bloodgroup: (user.bloodgroup ? user.bloodgroup : "ADD BLOODGROUP"),
        emergencyContactName: (user.emergencyContactName !== "" ? user.emergencyContactName : "ADD NAME"),
        emergencyContactPhone: (user.emergencyContactPhone !== "" ? user.emergencyContactPhone : "ADD CONTACT NUMBER"),
    };
    
    setProfile(updatedProfileData);
    setEditedProfile(updatedProfileData);
  }, [user]);

  // Validation Logic
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'firstName':
        if (!value || value.trim().length < 2) {
          newErrors.firstName = 'First Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.firstName = 'First Name cannot exceed 50 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.firstName = 'First Name can only contain letters and spaces';
        } else {
          delete newErrors.firstName;
        }
        break;
        
      case 'lastName':
        if (!value || value.trim().length < 2) {
          newErrors.lastName = 'Last Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.lastName = 'Last Name cannot exceed 50 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.lastName = 'Last Name can only contain letters and spaces';
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!value || !emailRegex.test(value.trim())) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'phoneno':
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
        if (!value || !phoneRegex.test(value.trim())) {
          newErrors.phoneno = 'Please enter a valid phone number (10-15 digits)';
        } else {
          delete newErrors.phoneno;
        }
        break;
        
      case 'DOB':
        if (value && value !== "ADD DOB") {
          const dob = new Date(value);
          const today = new Date();
          
          if (isNaN(dob.getTime())) {
            newErrors.DOB = 'Please enter a valid date';
          } else {
            const age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            const dayDiff = today.getDate() - dob.getDate();
            
            let calculatedAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
              calculatedAge--;
            }
            
            if (dob > today) {
              newErrors.DOB = 'Date of birth cannot be in the future';
            } else if (calculatedAge > 150) {
              newErrors.DOB = 'Age cannot exceed 150 years';
            } else if (calculatedAge < 0) {
              newErrors.DOB = 'Please enter a valid date';
            } else {
              delete newErrors.DOB;
            }
          }
        } else {
          delete newErrors.DOB;
        }
        break;
        
      case 'gender':
        const validGenders = ['male', 'female', 'other', 'prefer not to say'];
        if (value && value !== "ADD GENDER" && !validGenders.includes(value.toLowerCase())) {
          newErrors.gender = 'Please select a valid gender';
        } else {
          delete newErrors.gender;
        }
        break;
        
      case 'bloodgroup':
        const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (value && value !== "ADD BLOODGROUP" && !validBloodTypes.includes(value)) {
          newErrors.bloodgroup = 'Please select a valid blood type';
        } else {
          delete newErrors.bloodgroup;
        }
        break;
        
      case 'address':
        if (value && value !== "ADD ADDRESS" && value.trim().length > 200) {
          newErrors.address = 'Address cannot exceed 200 characters';
        } else {
          delete newErrors.address;
        }
        break;
        
      case 'emergencyContactName':
        if (value && value !== "ADD NAME" && (value.trim().length < 2 || value.trim().length > 50)) {
          newErrors.emergencyContactName = 'Emergency contact name must be 2-50 characters';
        } else if (value && value !== "ADD NAME" && !/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.emergencyContactName = 'Emergency contact can only contain letters and spaces';
        } else {
          delete newErrors.emergencyContactName;
        }
        break;
        
      case 'emergencyContactPhone':
        const emergencyPhoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
        if (value && value !== "ADD CONTACT NUMBER" && !emergencyPhoneRegex.test(value.trim())) {
          newErrors.emergencyContactPhone = 'Please enter a valid emergency contact phone number';
        } else {
          delete newErrors.emergencyContactPhone;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[field];
  };

  const validateAllFields = () => {
    const fieldsToValidate = [
      'firstName','lastName', 'email', 'phoneno', 'DOB', 'gender', 
      'bloodgroup', 'address', 'emergencyContactName', 'emergencyContactPhone'
    ];
    
    let tempErrors = {};
    
    fieldsToValidate.forEach(field => {
      const value = editedProfile[field];
      // Reuse logic or simplify for mass check
      // For brevity, using the same logic checks as validateField but synchronous
      switch (field) {
        case 'firstName':
            if (!value || value.trim().length < 2) tempErrors.firstName = 'First Name too short';
            else if (!/^[a-zA-Z\s]+$/.test(value.trim())) tempErrors.firstName = 'Invalid First Name';
            break;
        case 'lastName':
            if (!value || value.trim().length < 2) tempErrors.lastName = 'Last Name too short';
            break;
        case 'email':
            if (!value || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value.trim())) tempErrors.email = 'Invalid email';
            break;
        case 'phoneno':
            if (!value || !/^\+?[\d\s\-\(\)]{10,15}$/.test(value.trim())) tempErrors.phoneno = 'Invalid phone';
            break;
        // ... (Include other field validations as needed)
      }
    });
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ---------------------------------------------------------
  // 2. RESET LOGIC: Revert image preview on Cancel
  // ---------------------------------------------------------
  const handleEditToggle = () => {
    if (isEditing) {
      // User cancelled
      setEditedProfile(profile);
      // Reset image state to original Redux data
      setprofilePicture(user.image);
      setPfp(user.image);
    }
    setErrors({});
    setIsEditing(!isEditing);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setPfp(file);
        // Create preview URL immediately
        setprofilePicture(URL.createObjectURL(file));
    }
  }

  // ---------------------------------------------------------
  // 3. SAVE LOGIC: No reload, Async updates
  // ---------------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();

    // Basic required check
    const requiredFields = {
      firstName: editedProfile.firstName,
      email: editedProfile.email,
      phoneno: editedProfile.phoneno,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || value.trim() === '') {
        toast({
          title: "Required Field Missing",
          description: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`,
          variant: "destructive"
        });
        return;
      }
    }

    try {
        // Only call API if image actually changed (file vs string url)
        if (pfp !== user.image) {
            await UpdatePfp(token, pfp, user.accountType, dispatch);
        }
        
        // Update profile text data
        await updateprofile(editedProfile, token, dispatch);
        
        setIsEditing(false);
        setErrors({});
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        
        // Removed window.location.reload()
        // The useEffect hook will handle UI updates
        
    } catch (error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Failed to update profile",
            variant: "destructive"
        });
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
    validateField(field, value);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate || birthDate === "ADD DOB") return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return "N/A";
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  };

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
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
        {/* Profile Photo and Basic Info */}
        <Card className="shadow-card lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 cursor-pointer" onClick={handleImageClick}>
                  {/* USE STATE VARIABLE 'profilePicture' HERE */}
                  <AvatarImage src={profilePicture} alt={currentProfile.firstName} />
                  <AvatarFallback>{currentProfile.firstName ? currentProfile.firstName[0] : "U"}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                      onClick={handleImageClick}
                      type="button"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      className="hidden"
                    />
                  </>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-muted-foreground text-center">
                  Click on the avatar or camera icon to change your profile picture
                  <br />
                  (Max 5MB, JPEG/PNG/GIF/WebP)
                </p>
              )}
              <div className="text-center">
                <h3 className="text-xl font-bold">{currentProfile.firstName}</h3>
                <p className="text-muted-foreground">Age {calculateAge(currentProfile.DOB)}</p>
                <div className="flex gap-2 mt-2 justify-center">
                  {currentProfile.bloodgroup !== "ADD BLOODGROUP" && (
                    <Badge variant="secondary">{currentProfile.bloodgroup}</Badge>
                  )}
                  {currentProfile.gender !== "ADD GENDER" && (
                    <Badge variant="outline">{currentProfile.gender}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{currentProfile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{currentProfile.phoneno}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="flex-1">{currentProfile.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="firstName"
                        value={editedProfile.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="lastName"
                        value={editedProfile.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.lastName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={editedProfile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneno">Phone Number</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="phoneno"
                        value={editedProfile.phoneno}
                        onChange={(e) => handleInputChange("phoneno", e.target.value)}
                        className={errors.phoneno ? "border-red-500" : ""}
                      />
                      {errors.phoneno && <p className="text-red-500 text-xs mt-1">{errors.phoneno}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.phoneno}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="DOB">Date of Birth</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="DOB"
                        type="date"
                        value={editedProfile.DOB !== "ADD DOB" ? (editedProfile.DOB instanceof Date ? editedProfile.DOB.toISOString().split('T')[0] : editedProfile.DOB) : ""}
                        onChange={(e) => handleInputChange("DOB", e.target.value)}
                        className={errors.DOB ? "border-red-500" : ""}
                      />
                      {errors.DOB && <p className="text-red-500 text-xs mt-1">{errors.DOB}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">
                      {currentProfile.DOB !== "ADD DOB" 
                        ? new Date(currentProfile.DOB).toLocaleDateString()
                        : currentProfile.DOB
                      }
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {isEditing ? (
                    <div>
                      <Select 
                        value={editedProfile.gender} 
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.gender}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodgroup">Blood Group</Label>
                  {isEditing ? (
                    <div>
                      <Select 
                        value={editedProfile.bloodgroup} 
                        onValueChange={(value) => handleInputChange("bloodgroup", value)}
                      >
                        <SelectTrigger className={errors.bloodgroup ? "border-red-500" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.bloodgroup && <p className="text-red-500 text-xs mt-1">{errors.bloodgroup}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.bloodgroup}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <div>
                    <Textarea
                      id="address"
                      value={(editedProfile.address == "ADD ADDRESS" ? "" : editedProfile.address)}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      rows={2}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{currentProfile.address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="emergencyContactName"
                        value={editedProfile.emergencyContactName !== "ADD NAME" ? editedProfile.emergencyContactName : ""}
                        onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                        className={errors.emergencyContactName ? "border-red-500" : ""}
                      />
                      {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.emergencyContactName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  {isEditing ? (
                    <div>
                      <Input
                        id="emergencyContactPhone"
                        value={editedProfile.emergencyContactPhone !== "ADD CONTACT NUMBER" ? editedProfile.emergencyContactPhone : ""}
                        onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                        className={errors.emergencyContactPhone ? "border-red-500" : ""}
                      />
                      {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded">{currentProfile.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
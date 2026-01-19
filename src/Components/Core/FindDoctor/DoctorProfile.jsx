import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Clock, 
  Languages, 
  GraduationCap, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Loader2 
} from "lucide-react";

// Import the new service function
import { fetchDoctorDetails } from "../../../services/operations/DoctorApi";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchDoctorDetails(id);
        if (data) {
          // Map backend data to UI format
          // Handle missing arrays with defaults (|| [])
          setDoctor({
            id: data._id,
            name: `${data.firstName} ${data.lastName}`,
            image: data.image,
            specialty: data.specialization,
            rating: data.rating || 4.8, // Default if missing
            experience: data.experience,
            location: data.address || "Medicare Hospital",
            consultationFee: data.consultationFee,
            about: data.about || `Dr. ${data.firstName} is a specialist in ${data.specialization} with ${data.experience} of experience.`,
            qualifications: data.qualification?.map(q => `${q.degree} - ${q.college} (${q.year})`) || [],
            // You might need to add these fields to your Schema or hardcode defaults for now
            awards: ["Best Doctor 2024", "Excellence in Cardiology"], 
            languages: ["English", "Hindi"],
            availability: "Mon - Sat (9:00 AM - 5:00 PM)",
            timeSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
            email: data.email,
            phone: data.phoneno
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Doctor Not Found</h1>
          <p className="text-muted-foreground mb-6">The doctor you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} // Go back to previous page
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
              />
              <div className="absolute -bottom-2 -right-2 bg-secondary rounded-full p-2">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Dr. {doctor.name}
              </h1>
              
              <Badge variant="secondary" className="mb-4 text-base px-3 py-1">
                {doctor.specialty}
              </Badge>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{doctor.rating} Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{doctor.experience} Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.location}</span>
                </div>
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Button 
                  variant="appointment" 
                  size="lg"
                  onClick={() => navigate(`/doctor/${doctor.id}/book`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
            
            <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-md min-w-[200px]">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-muted-foreground mb-1">Consultation Fee</div>
                <div className="text-2xl font-bold text-primary">${doctor.consultationFee}</div>
                <div className="text-xs text-muted-foreground">per session</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  About Dr. {doctor.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {doctor.about}
                </p>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Education & Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {doctor.qualifications.length > 0 ? (
                  <ul className="space-y-3">
                    {doctor.qualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <span className="text-muted-foreground">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No qualification details available.</p>
                )}
              </CardContent>
            </Card>

            {/* Awards - Optional render */}
            {doctor.awards && doctor.awards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Awards & Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {doctor.awards.map((award, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {award}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{doctor.availability}</p>
                <Separator className="my-4" />
                <div className="text-sm font-medium mb-3">Available Time Slots</div>
                <div className="grid grid-cols-2 gap-2">
                  {doctor.timeSlots.map((slot, index) => (
                    <Button key={index} variant="outline" size="sm" className="text-xs">
                      {slot}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            {doctor.languages && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language, index) => (
                      <Badge key={index} variant="secondary">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{doctor.location}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{doctor.phone}</span>
                  </div>
                )}
                {doctor.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
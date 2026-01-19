import { DoctorCard } from "../Components/Core/FindDoctor/DoctorCard";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Search, MapPin, Stethoscope, Users, Award, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import hospitalHero from "../img/hospital-hero.jpg";

// Import API Service
import { fetchPublicDoctors } from "../services/operations/DoctorApi";

const FindDoctor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialtyList, setSpecialtyList] = useState([]);

  // --- Fetch Logic ---
  const getDoctors = async (query = "", specialty = "") => {
    setLoading(true);
    try {
      const data = await fetchPublicDoctors(query, specialty);
      if (data) {
        // Map backend data to the format DoctorCard expects
        // Assuming Backend returns: firstName, lastName, specialization, image, experience, consultationFee, doctorID, rating
        const formattedDoctors = data.map(doc => ({
          id: doc._id,
          name: `${doc.firstName} ${doc.lastName}`,
          specialty: doc.specialization,
          image: doc.image,
          rating: doc.rating || 4.5, // Default if not in DB
          experience: doc.experience,
          education: doc.qualification?.[0]?.degree || "MBBS", // specific to your schema structure
          location: "Medicare Hospital", // Hardcoded or from DB
          availability: "Mon - Sat", // Hardcoded or from DB
          consultationFee: doc.consultationFee
        }));

        setDoctorsList(formattedDoctors);

        // Extract unique specialties for the dropdown from the full list (or fetch from a separate API)
        if (specialtyList.length === 0 && !query && !specialty) {
           const uniqueSpecialties = Array.from(new Set(data.map(d => d.specialization))).filter(Boolean);
           setSpecialtyList(uniqueSpecialties);
        }
      }
    } catch (error) {
      console.error("Error loading doctors", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    // Fetch top experienced doctors (Backend sorts by experience by default)
    getDoctors();
  }, []);

  // --- Handle Search Button Click ---
  const handleSearch = () => {
    getDoctors(searchTerm, selectedSpecialty);
  };

  // --- Handle Enter Key in Input ---
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/10 to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${hospitalHero})` }}
        ></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Find Your Perfect
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Doctor</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with experienced healthcare professionals. Book appointments with top-rated doctors 
              and get the care you deserve.
            </p>
            
            {/* Search Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-elevated max-w-3xl mx-auto">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search name, dept..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-12 border-0 bg-white/70"
                  />
                </div>
                
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="h-12 border-0 bg-white/70">
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All specialties">All specialties</SelectItem>
                    {specialtyList.map((spec, index) => (
                      <SelectItem key={index} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="medical" 
                  size="lg" 
                  className="h-12"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                  Find Doctors
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">500+</div>
              <div className="text-muted-foreground">Expert Doctors</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-secondary" />
              </div>
              <div className="text-3xl font-bold text-foreground">30+</div>
              <div className="text-muted-foreground">Specialties</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-trust-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-trust-blue" />
              </div>
              <div className="text-3xl font-bold text-foreground">10k+</div>
              <div className="text-muted-foreground">Happy Patients</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-medical-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-medical-green" />
              </div>
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-muted-foreground">Care Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Meet Our Expert Doctors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our team of highly qualified medical professionals is dedicated to providing 
              exceptional healthcare services tailored to your needs.
            </p>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
          ) : doctorsList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-2xl font-semibold text-muted-foreground mb-2">
                No doctors found
              </div>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or browse all doctors.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialty("");
                  getDoctors("", ""); // Reset search
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctorsList.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Need Immediate Medical Attention?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our emergency services are available 24/7. Contact us now for urgent medical care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="appointment" size="lg">
              Emergency Services
            </Button>
            <Button variant="outline" size="lg">
              Schedule Check-up
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="w-6 h-6" />
            <span className="text-xl font-bold">MediCare Hospital</span>
          </div>
          <p className="text-primary-foreground/80">
            Providing exceptional healthcare services with compassion and expertise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FindDoctor;
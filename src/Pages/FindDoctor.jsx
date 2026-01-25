import { useState, useEffect } from "react";
import { DoctorCard } from "../Components/Core/FindDoctor/DoctorCard";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Search, Stethoscope, Users, Award, Star, Loader2 } from "lucide-react";
// import hospitalHero from "../img/hospital-hero.jpg"; // Adjust path
import hospitalHero from "../img/dep1.jpg";
import Navbar from "../Components/Common/Navbar";
import Footer from "../Components/Common/Footer";

// API
import { fetchPublicDoctors } from "../services/operations/DoctorApi";

const FindDoctor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialtyList, setSpecialtyList] = useState([]);

  const getDoctors = async (query = "", specialty = "") => {
    setLoading(true);
    try {
      const data = await fetchPublicDoctors(query, specialty);
      if (data) {
        const formattedDoctors = data.map(doc => ({
          id: doc._id,
          name: `${doc.firstName} ${doc.lastName}`,
          specialty: doc.specialization,
          image: doc.image,
          rating: doc.rating || 4.5,
          experience: doc.experience,
          education: doc.qualification?.[0]?.degree || "MBBS",
          // location: "Removed as requested", 
          availability: "Mon - Sat",
          consultationFee: doc.consultationFee
        }));

        setDoctorsList(formattedDoctors);

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

  // --- ADDED SCROLL TO TOP HERE ---
  useEffect(() => { 
    window.scrollTo(0, 0); // Forces page to start at the top
    getDoctors(); 
  }, []);

  const handleSearch = () => getDoctors(searchTerm, selectedSpecialty);
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      <main className="flex-1 pt-14 mt-[130px]">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-teal-800 via-slate-800 to-teal-800 overflow-hidden min-h-[500px] flex items-center">
          <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: `url(${hospitalHero})` }}></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Find Your Specialist
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                Book appointments with the best doctors in your city.
              </p>
              
              {/* Search Bar */}
              <div className="bg-white p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search doctor or condition..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 h-12 border-0 focus-visible:ring-0 text-base"
                  />
                </div>
                <div className="w-full md:w-48">
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="h-12 border-0 bg-gray-50 focus:ring-0">
                        <SelectValue placeholder="Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Specialties</SelectItem>
                        {specialtyList.map((spec, index) => (
                        <SelectItem key={index} value={spec}>{spec}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 bg-blue-600 hover:bg-blue-700 px-8">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="bg-white border-b border-slate-200">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                    <div>
                        <div className="text-3xl font-bold text-blue-600">500+</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Doctors</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600">30+</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Specialties</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600">10k+</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Patients</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-blue-600">24/7</div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mt-1">Support</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Results */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Expert Medical Professionals</h2>
            <p className="text-slate-500 mt-2">Highly qualified doctors ready to help you.</p>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
          ) : doctorsList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <h3 className="text-xl font-medium text-slate-900">No doctors found</h3>
              <p className="text-slate-500 mt-1">Try changing your search terms.</p>
              <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedSpecialty(""); getDoctors(); }} className="mt-4">
                Reset Filters
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
      </main>

      <Footer />
    </div>
  );
};

export default FindDoctor;
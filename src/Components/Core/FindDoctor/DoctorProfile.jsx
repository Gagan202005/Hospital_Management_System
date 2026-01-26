import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { 
  Star, Calendar, Award, Clock, Languages, GraduationCap, 
  ArrowLeft, IndianRupee, Loader2, Info 
} from "lucide-react";
import Navbar from "../../Common/Navbar";
import Footer from "../../Common/Footer";
import { fetchDoctorDetails } from "../../../services/operations/DoctorApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchDoctorDetails(id);
        if (data) {
          setDoctor({
            id: data._id,
            name: `${data.firstName} ${data.lastName}`,
            image: data.image,
            specialty: data.specialization,
            rating: data.rating || 4.8,
            experience: data.experience,
            department: data.department,
            consultationFee: data.consultationFee,
            about: data.about || `Dr. ${data.firstName} is a dedicated specialist in ${data.specialization} with over ${data.experience} of clinical experience.`,
            qualifications: data.qualification?.map(q => `${q.degree} - ${q.college} (${q.year})`) || [],
            languages: ["English", "Hindi"],
            availability: "Mon - Sat",
          });
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    if (id) getDetails();
  }, [id]);

  const handleBookClick = () => {
      if (!token) {
          toast.error("Please login to book an appointment");
          navigate("/login");
      } else {
          navigate(`/doctor/${doctor.id}/book`);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600"/></div>;
  if (!doctor) return <div className="min-h-screen flex items-center justify-center">Doctor Not Found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="fixed top-0 w-full z-50"><Navbar /></div>

      <main className="flex-1 pt-14 mt-[135px]">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-slate-500 hover:text-slate-800 p-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
                </Button>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative shrink-0">
                        <img src={doctor.image} alt={doctor.name} className="w-40 h-40 rounded-xl object-cover shadow-lg border border-slate-200"/>
                        <div className="absolute -bottom-3 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                            <Star className="w-3 h-3 fill-current" /> {doctor.rating}
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <div>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-2 border-0">{doctor.specialty}</Badge>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dr. {doctor.name}</h1>
                            <p className="text-lg text-slate-500">{doctor.department}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600"/> <span>{doctor.experience} of Experience</span></div>
                            <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-green-600"/> <span className="font-semibold">{doctor.consultationFee} Consultation Fee</span></div>
                        </div>

                        <div className="pt-2">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={handleBookClick}>
                                Book Appointment
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Details */}
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader><CardTitle className="text-xl">About</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{doctor.about}</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader><CardTitle className="text-xl flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-600"/> Education</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {doctor.qualifications.length > 0 ? doctor.qualifications.map((q, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 shrink-0"></div>
                                        <span className="text-slate-700">{q}</span>
                                    </li>
                                )) : <p className="text-slate-400 italic">No details available.</p>}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200 bg-blue-50/50">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Info className="w-5 h-5 text-blue-600"/> Booking Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Fee</span>
                                <span className="font-bold text-slate-900 flex items-center"><IndianRupee className="w-3 h-3"/> {doctor.consultationFee}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Booking Charge</span>
                                <span className="font-bold text-green-600 flex items-center"><IndianRupee className="w-3 h-3"/> 0 (Free)</span>
                            </div>
                            <Separator className="bg-blue-200"/>
                            <p className="text-xs text-slate-500 leading-normal">
                                * Appointment booking is free online. The consultation fee is payable at the hospital counter.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Languages className="w-5 h-5 text-purple-600"/> Languages</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {doctor.languages.map((lang, i) => <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">{lang}</Badge>)}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorProfile;
import { Card, CardContent, CardFooter } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Star, Calendar, Award, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-slate-200 overflow-hidden">
      <div className="relative h-24 bg-gradient-to-r from-blue-50 to-indigo-50"></div>
      <CardContent className="p-6 pt-0 text-center relative">
        <div className="relative -mt-12 mb-3 inline-block">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
            />
            <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1 border-2 border-white text-white">
              <Star className="w-3 h-3 fill-current" />
            </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 mb-1">{doctor.name}</h3>
        <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialty}</p>
        
        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-slate-500">
            <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600 hover:bg-slate-100">
                {doctor.experience} Exp
            </Badge>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>{doctor.education}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm mb-2">
            <span className="text-slate-500">Consultation</span>
            <span className="font-bold text-slate-900 flex items-center">
                <IndianRupee className="w-3 h-3" /> {doctor.consultationFee}
            </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2">
        <Button variant="outline" className="flex-1 border-slate-200" onClick={() => navigate(`/doctor/${doctor.id}`)}>
          Profile
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/doctor/${doctor.id}/book`)}>
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};
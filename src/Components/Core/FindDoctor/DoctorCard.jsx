import { Card, CardContent, CardFooter } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Star, MapPin, Calendar, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-elevated transition-all duration-300 hover:scale-105 bg-card border-0 shadow-card">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
            <div className="absolute -top-2 -right-2 bg-secondary rounded-full p-1">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-1">
            Dr. {doctor.name}
          </h3>
          
          <Badge variant="secondary" className="mb-3 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-0">
            {doctor.specialty}
          </Badge>
          
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{doctor.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({doctor.experience} exp.)
            </span>
          </div>
          
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4" />
              <span>{doctor.education}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{doctor.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{doctor.availability}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted rounded-lg w-full">
            <div className="text-sm text-muted-foreground">Consultation Fee</div>
            <div className="text-lg font-semibold text-primary">
              ${doctor.consultationFee}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate(`/doctor/${doctor.id}`)}
        >
          View Profile
        </Button>
        <Button 
          variant="appointment" 
          className="flex-1"
          onClick={() => navigate(`/doctor/${doctor.id}/book`)}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};
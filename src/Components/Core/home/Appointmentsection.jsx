import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"; // Adjusted path
import { Button } from "../../ui/button";     // Adjusted path
import { CalendarPlus, Phone, Globe, MapPin } from "lucide-react";

const AppointmentSection = () => {
  return (
    <section id="appointments" className="py-20 bg-gradient-to-r from-primary to-primary-soft">
      <div className="container mx-auto px-4">
        <div className="text-center text-primary-foreground mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Schedule Your Appointment Today
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Multiple convenient ways to book your appointment with our healthcare professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Online Booking */}
          <Card className="text-center shadow-medical border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 rounded-full bg-primary-light">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Online Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Book appointments 24/7 through our secure online portal. View available slots and choose your preferred time.
              </p>
              <Button variant="medical" className="w-full">
                <CalendarPlus className="h-4 w-4" />
                Book Online
              </Button>
            </CardContent>
          </Card>

          {/* Phone Booking */}
          <Card className="text-center shadow-medical border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 rounded-full bg-secondary-light">
                <Phone className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">Call Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Speak directly with our appointment coordinators. Available Monday through Friday, 8 AM to 6 PM.
              </p>
              <Button variant="care" className="w-full">
                <Phone className="h-4 w-4" />
                (555) 123-4567
              </Button>
            </CardContent>
          </Card>

          {/* Walk-in */}
          <Card className="text-center shadow-medical border-0 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 rounded-full bg-accent-light">
                <MapPin className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-xl">Walk-in Clinic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                No appointment needed for urgent care. Open daily from 7 AM to 9 PM for non-emergency medical needs.
              </p>
              <Button variant="outline" className="w-full">
                <MapPin className="h-4 w-4" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Notice */}
        <div className="mt-12 text-center">
          <Card className="bg-destructive/10 border-destructive/20 max-w-2xl mx-auto">
            <CardContent className="py-6">
              <h3 className="text-xl font-bold text-destructive mb-2">Medical Emergency?</h3>
              <p className="text-foreground mb-4">
                For life-threatening emergencies, call 911 or visit our Emergency Department immediately.
              </p>
              <Button variant="emergency" size="lg">
                <Phone className="h-5 w-5" />
                Call 911
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
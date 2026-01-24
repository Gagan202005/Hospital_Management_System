import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { CalendarPlus, Phone, Globe, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AppointmentSection = () => {
  return (
    <section id="appointments" className="py-20 bg-gradient-to-r from-primary to-primary-soft text-primary-foreground relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Begin Your Path to Better Health
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto font-light">
            Choose the most convenient way to connect with us.
          </p>
        </div>

        {/* Constrained Width for Smaller Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Online Booking */}
          <Card className="text-center shadow-xl border-0 hover:-translate-y-1 transition-transform duration-300 bg-card">
            <CardHeader className="p-6 pb-2">
              <div className="mx-auto mb-3 p-3 rounded-full bg-primary-light w-fit">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg text-foreground font-bold">Book Online</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-sm text-muted-foreground mb-6">
                View real-time availability and secure your slot instantly.
              </p>
              <Button variant="medical" className="w-full h-10 text-sm shadow-sm" asChild>
                <Link to="/find-doctor">
                  Schedule Now <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Phone Booking */}
          <Card className="text-center shadow-xl border-0 hover:-translate-y-1 transition-transform duration-300 bg-white/95 backdrop-blur">
            <CardHeader className="p-6 pb-2">
              <div className="mx-auto mb-3 p-3 rounded-full bg-secondary-light w-fit">
                <Phone className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="text-lg text-foreground font-bold">Call Center</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-sm text-muted-foreground mb-6">
                Speak with coordinators. <br/> Mon-Fri, 8 AM - 8 PM.
              </p>
              <Button variant="outline" className="w-full h-10 text-sm border-secondary text-secondary hover:bg-secondary-light" asChild>
                <a href="tel:+15551234567">
                  (555) 123-4567
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Emergency */}
          <Card className="text-center shadow-xl border-0 hover:-translate-y-1 transition-transform duration-300 bg-white/95 backdrop-blur border-t-4 border-t-destructive">
            <CardHeader className="p-6 pb-2">
              <div className="mx-auto mb-3 p-3 rounded-full bg-destructive/10 w-fit">
                <MapPin className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-lg text-foreground font-bold">Emergency</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-sm text-muted-foreground mb-6">
                For life-threatening situations, call us immediately.
              </p>
              <Button variant="destructive" className="w-full h-10 text-sm shadow-sm" asChild>
                <a href="tel:911">
                  Call 911
                </a>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
import { Button } from "../../ui/button";
import { CalendarPlus, Stethoscope, Heart } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center bg-gradient-to-r from-primary to-primary-soft">

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-accent animate-pulse" />
            <span className="text-accent font-medium">Trusted Healthcare Provider</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Your Health,
            <span className="text-accent"> Our Priority</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Experience compassionate, world-class medical care with our team of dedicated professionals. 
            We're here for you 24/7 with state-of-the-art facilities and personalized treatment plans.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button  size="lg" className=" text-lg bg-[#187394] hover:shadow-lg hover:scale-105 hover:bg-[#187394] transition-all duration-300">
              <CalendarPlus className="h-5 w-5" />
              Book Appointment
            </Button>
            <Button variant="outline" size="lg" className="text-lg bg-card/10 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Stethoscope className="h-5 w-5" />
              Our Services
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">25+</div>
              <div className="text-primary-foreground/80 text-sm">Years of Excellence</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">50+</div>
              <div className="text-primary-foreground/80 text-sm">Expert Doctors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">10k+</div>
              <div className="text-primary-foreground/80 text-sm">Happy Patients</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
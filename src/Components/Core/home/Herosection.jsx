import { Button } from "../../ui/button";
import { CalendarPlus, Stethoscope, Heart, ArrowRight } from "lucide-react";
import hospitalHero from "../../../img/hospital-hero.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center bg-gradient-to-r from-primary to-primary-soft">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-primary/20">
        <img 
          src={hospitalHero} 
          alt="Modern hospital facility" 
          className="w-full h-full object-cover mix-blend-overlay opacity-40"
        />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-3xl animate-in slide-in-from-left duration-700">
          <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1 rounded-full backdrop-blur-sm border border-white/20">
            <Heart className="h-5 w-5 text-accent animate-pulse" />
            <span className="text-accent font-medium text-sm">No.1 Trusted Healthcare Provider</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight drop-shadow-md">
            Your Health Journey,
            <br/>
            <span className="text-accent"> Our Sacred Commitment</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-10 leading-relaxed max-w-2xl">
            Access world-class medical expertise with a human touch. From preventive care 
            to complex surgeries, we are dedicated to your well-being 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button variant="medical" size="lg" className="text-lg h-14 px-8 shadow-lg shadow-black/20" asChild>
              <Link to="/find-doctor">
                <CalendarPlus className="h-5 w-5 mr-2" />
                Book Appointment
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg h-14 px-8 bg-white/10 border-accent text-accent hover:bg-accent hover:text-accent-foreground backdrop-blur-md" asChild>
              <a href="#services">
                <Stethoscope className="h-5 w-5 mr-2" />
                Explore Services
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 text-center border-t border-white/20 pt-8 max-w-xl">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">35+</div>
              <div className="text-primary-foreground/80 text-sm">Years Serving</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">500+</div>
              <div className="text-primary-foreground/80 text-sm">Medical Experts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">100k+</div>
              <div className="text-primary-foreground/80 text-sm">Lives Healed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
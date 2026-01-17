import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hospital Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">MediCare General Hospital</h3>
            <p className="text-primary-foreground/80 mb-4 leading-relaxed">
              Providing exceptional healthcare services to our community for over 35 years. 
              Your health and well-being are our top priorities.
            </p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#services" className="hover:text-accent transition-colors">Our Services</a></li>
              <li><a href="#doctors" className="hover:text-accent transition-colors">Find a Doctor</a></li>
              <li><a href="#appointments" className="hover:text-accent transition-colors">Book Appointment</a></li>
              <li><a href="#about" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-accent transition-colors">Careers</a></li>
              <li><a href="#news" className="hover:text-accent transition-colors">News & Events</a></li>
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Patient Resources</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#portal" className="hover:text-accent transition-colors">Patient Portal</a></li>
              <li><a href="#insurance" className="hover:text-accent transition-colors">Insurance</a></li>
              <li><a href="#billing" className="hover:text-accent transition-colors">Billing</a></li>
              <li><a href="#records" className="hover:text-accent transition-colors">Medical Records</a></li>
              <li><a href="#visiting" className="hover:text-accent transition-colors">Visiting Hours</a></li>
              <li><a href="#feedback" className="hover:text-accent transition-colors">Patient Feedback</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p>123 Health Street</p>
                  <p>Medical City, MC 12345</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0" />
                <span>info@medicarehospital.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p>Emergency: 24/7</p>
                  <p>General: Mon-Fri 6AM-10PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2024 MediCare General Hospital. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
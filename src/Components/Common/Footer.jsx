import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, Code, Bot } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* 1. Hospital Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">MediCare General Hospital</h3>
            <p className="text-primary-foreground/80 mb-4 leading-relaxed">
              Providing exceptional healthcare services to our community for over 35 years. 
              Your health and well-being are our top priorities.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-accent transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent transition-colors"><Instagram className="h-5 w-5" /></a>
              <a 
                href="https://www.linkedin.com/in/gagan-singhal-b20a95308/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-accent transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* 2. Quick Links (Mapped to App.js) */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/find-doctor" className="hover:text-accent transition-colors">Find a Doctor</Link></li>
              <li><Link to="/find-doctor" className="hover:text-accent transition-colors">Book Appointment</Link></li>
              <li><Link to="/ai-chat" className="hover:text-accent transition-colors flex items-center gap-2"><Bot className="w-4 h-4"/> AI Health Assistant</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* 3. Patient Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Patient Resources</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="/patient-dashboard" className="hover:text-accent transition-colors">Patient Portal</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Insurance Accepted</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Billing & Finance</a></li>
              <li><Link to="/patient-dashboard/appointments" className="hover:text-accent transition-colors">Medical Records</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Visiting Hours</a></li>
            </ul>
          </div>

          {/* 4. Contact Info */}
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
                <a href="mailto:medicarehospital340@gmail.com" className="hover:text-accent transition-colors">
                  medicarehospital340@gmail.com
                </a>
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

        {/* Footer Bottom / Developer Info */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left text-primary-foreground/60 text-sm gap-4">
          <p>&copy; {new Date().getFullYear()} MediCare General Hospital. All rights reserved.</p>
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Developed by 
              <a 
                href="https://www.linkedin.com/in/gagan-singhal-b20a95308/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-foreground hover:text-accent font-medium transition-colors"
              >
                Gagan Singhal
              </a>
            </span>
            <span className="hidden md:inline">|</span>
            <a 
              href="mailto:gagansinghal2005@gmail.com" 
              className="hover:text-accent transition-colors"
            >
              gagansinghal2005@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
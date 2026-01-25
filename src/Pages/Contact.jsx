import { useState, useEffect } from "react";
import Navbar from "../Components/Common/Navbar";
import Footer from "../Components/Common/Footer";
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Label } from "../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { 
  Phone, Mail, MapPin, Clock, Ambulance, MessageSquare, Send,
  Building, Stethoscope, HeartPulse, Baby, Brain, Loader2
} from "lucide-react";
// import hospitalReception from "../img/hospital-reception.jpg"; // Ensure path is correct
import hospitalReception from "../img/dep7.jpg";
// Import API
import { contactUsApi } from "../services/operations/authApi"; 

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    subject: "",
    message: ""
  });

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // API Call - passing setLoading to handle spinner state within the operation
    // Or handle it here locally if the operation returns a promise
    await contactUsApi(formData, setLoading);
    
    // Reset form after submission (assuming success if no error thrown by API wrapper)
    setFormData({
        name: "", email: "", phone: "", department: "", subject: "", message: ""
    });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      primary: "+1 (555) 123-4567",
      secondary: "+1 (555) 987-6543",
      description: "Available 24/7 for inquiries"
    },
    {
      icon: Ambulance,
      title: "Emergency",
      primary: "911",
      secondary: "Immediate response team",
      description: "24/7 Emergency Services"
    },
    {
      icon: Mail,
      title: "Email",
      primary: "info@medicare.com",
      secondary: "help@medicare.com",
      description: "Response within 24 hours"
    },
    {
      icon: MapPin,
      title: "Address",
      primary: "123 Healthcare Avenue",
      secondary: "Medical District, NY 10001",
      description: "Free patient parking"
    }
  ];

  const departments = [
    { icon: HeartPulse, name: "Cardiology", phone: "+1 (555) 123-4001" },
    { icon: Brain, name: "Neurology", phone: "+1 (555) 123-4002" },
    { icon: Stethoscope, name: "General Medicine", phone: "+1 (555) 123-4003" },
    { icon: Baby, name: "Pediatrics", phone: "+1 (555) 123-4004" },
    { icon: Building, name: "Orthopedics", phone: "+1 (555) 123-4005" },
  ];

  const hours = [
    { day: "Monday - Friday", time: "8:00 AM - 8:00 PM" },
    { day: "Saturday", time: "9:00 AM - 6:00 PM" },
    { day: "Sunday", time: "10:00 AM - 4:00 PM" },
    { day: "Emergency", time: "24/7" },
  ];

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "You can book through our 'Find a Doctor' page, call our helpline, or visit the reception desk."
    },
    {
      question: "What insurance do you accept?",
      answer: "We accept most major insurance providers. Please contact our billing department for specific coverage inquiries."
    },
    {
      question: "Is parking available?",
      answer: "Yes, we have free parking available for patients and visitors in our multi-level parking facility."
    },
    {
      question: "How can I access my medical records?",
      answer: "Login to the Patient Dashboard to view and download your history and reports."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      <main className="flex-1 pt-14">
        
        {/* Hero Section */}
        <section className="relative h-[40vh] min-h-[350px] overflow-hidden flex items-center mt-[133px]">
            {/* Background */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${hospitalReception})` }}
            />
            {/* Professional Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800/95 via-teal-800/90 to-slate-900/95" />
            
            <div className="relative container mx-auto px-4 z-10">
                <div className="max-w-2xl text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-md">Get in Touch</h1>
                    <p className="text-lg md:text-xl text-slate-200 font-light">
                        We're here to listen and help. Reach out for appointments, medical inquiries, 
                        or assistance. Our team is available 24/7.
                    </p>
                </div>
            </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 -mt-16 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 border border-teal-100">
                      <info.icon className="w-6 h-6 text-teal-700" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 text-lg">{info.title}</h3>
                    <p className="text-teal-700 font-medium">{info.primary}</p>
                    <p className="text-slate-500 text-sm">{info.secondary}</p>
                    <p className="text-slate-400 text-xs mt-3 pt-3 border-t border-slate-100">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <Card className="border-0 shadow-lg border-t-4 border-t-teal-600 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                    <MessageSquare className="w-6 h-6 text-teal-600" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input 
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="John Doe"
                          required
                          className="bg-slate-50 border-slate-200 focus:ring-teal-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="john@example.com"
                          required
                          className="bg-slate-50 border-slate-200 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+1 (555) 000-0000"
                          className="bg-slate-50 border-slate-200 focus:ring-teal-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Select 
                          value={formData.department}
                          onValueChange={(value) => setFormData({...formData, department: value})}
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-teal-500">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General">General Inquiry</SelectItem>
                            <SelectItem value="Appointments">Appointments</SelectItem>
                            <SelectItem value="Billing">Billing</SelectItem>
                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                            <SelectItem value="Neurology">Neurology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input 
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="How can we help you?"
                        required
                        className="bg-slate-50 border-slate-200 focus:ring-teal-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea 
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Please describe your inquiry in detail..."
                        rows={5}
                        required
                        className="bg-slate-50 border-slate-200 focus:ring-teal-500"
                      />
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 text-lg shadow-md" 
                        disabled={loading}
                    >
                      {loading ? (
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                      ) : (
                          <><Send className="w-4 h-4 mr-2" /> Send Message</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Map & Hours */}
              <div className="space-y-6">
                {/* Map Placeholder */}
                <Card className="border-0 shadow-lg overflow-hidden h-[300px]">
                  <div className="h-full bg-slate-200 relative">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.35231269033!2d88.26495039327918!3d22.535406374522976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1709667749000!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Hospital Location"
                      className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-lg p-4 shadow-lg border border-slate-100">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800">MediCare Hospital</p>
                          <p className="text-sm text-slate-500">123 Healthcare Avenue, Medical District</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Operating Hours */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                      <Clock className="w-5 h-5 text-teal-600" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hours.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                          <span className="font-medium text-slate-700">{schedule.day}</span>
                          <span className={`font-mono text-sm ${schedule.day === 'Emergency' ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                            {schedule.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Department Contacts */}
        <section className="py-16 bg-slate-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Department Contacts</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Reach out directly to our specialized departments for specific inquiries.
              </p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {departments.map((dept, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-xl transition-shadow text-center bg-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <dept.icon className="w-6 h-6 text-teal-700" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">{dept.name}</h3>
                    <p className="text-teal-600 text-sm font-medium">{dept.phone}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Common Questions</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Quick answers to the most frequently asked questions.
              </p>
            </div>
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-slate-200 shadow-sm hover:border-teal-200 transition-colors">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-800 mb-2 text-lg">{faq.question}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="py-12 bg-slate-800 border-t border-slate-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center animate-pulse border border-red-600/50">
                  <Ambulance className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Medical Emergency?</h3>
                  <p className="text-slate-400">Our trauma team is standing by 24/7.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 font-bold gap-2">
                  <Phone className="w-4 h-4" />
                  +1 (555) 911-1234
                </Button>
                <Button variant="outline" size="lg" className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white">
                  Call 911
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Contact;
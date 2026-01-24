import { Card, CardContent } from "../Components/ui/card";
import { Heart, Shield, Users, Award, Target, Eye, Clock, Stethoscope, GraduationCap, Building } from "lucide-react";
import hospitalBuilding from "../img/hospital-building.jpg"; // Adjust path as needed
import medicalTeam from "../img/medical-team.jpg";           // Adjust path as needed
import medicalEquipment from "../img/medical-equipment.jpg"; // Adjust path as needed
import hospitalReception from "../img/hospital-reception.jpg"; // Adjust path as needed
import Navbar from "../Components/Common/Navbar";
import Footer from "../Components/Common/Footer";
import { useEffect } from "react";
const About = () => {
  const stats = [
    { icon: Users, value: "50,000+", label: "Patients Treated Annually" },
    { icon: Stethoscope, value: "500+", label: "Expert Doctors" },
    { icon: Building, value: "30+", label: "Specialized Departments" },
    { icon: Clock, value: "29+", label: "Years of Excellence" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We treat every patient with empathy, understanding, and genuine care, ensuring they feel supported throughout their healthcare journey."
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We uphold the highest ethical standards in all our practices, maintaining transparency and honesty in patient care and communication."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for clinical excellence through continuous learning, research, and adoption of cutting-edge medical technologies."
    },
    {
      icon: Users,
      title: "Teamwork",
      description: "Our multidisciplinary teams collaborate seamlessly to provide comprehensive, patient-centered care for optimal outcomes."
    },
  ];

  const milestones = [
    { year: "1995", event: "Hospital Founded", description: "MediCare Hospital was established with a vision to provide world-class healthcare." },
    { year: "2000", event: "First Expansion", description: "Added 200 beds and opened 10 new specialized departments." },
    { year: "2008", event: "Research Center", description: "Launched our state-of-the-art medical research facility." },
    { year: "2015", event: "Digital Transformation", description: "Implemented advanced electronic health records and telemedicine services." },
    { year: "2020", event: "COVID-19 Response", description: "Established dedicated COVID care units and vaccination centers." },
    { year: "2024", event: "AI Integration", description: "Pioneered AI-assisted diagnostics and treatment planning." },
  ];

  const leadership = [
    { name: "Dr. Robert Johnson", role: "Chief Executive Officer", specialty: "Healthcare Administration" },
    { name: "Dr. Sarah Williams", role: "Chief Medical Officer", specialty: "Internal Medicine" },
    { name: "Dr. Michael Chen", role: "Chief of Surgery", specialty: "Cardiovascular Surgery" },
    { name: "Dr. Emily Davis", role: "Director of Research", specialty: "Medical Research" },
  ];
// --- ADDED SCROLL TO TOP HERE ---
  useEffect(() => { 
    window.scrollTo(0, 0); // Forces page to start at the top
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      <main className="flex-1 pt-14"> {/* Added padding-top to account for fixed navbar */}
        
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] overflow-hidden mt-[142px]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${hospitalBuilding})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 mix-blend-multiply" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white animate-in slide-in-from-left duration-700">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-md">About MediCare Hospital</h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Leading the way in healthcare excellence since 1995. We combine cutting-edge 
                technology with compassionate care to deliver exceptional medical services.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted/30 border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-lg bg-card hover:-translate-y-1 transition-transform duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Who We Are
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Founded in 1995, MediCare Hospital began as a small community clinic with a 
                    big vision: to make world-class healthcare accessible to everyone. What started 
                    with just 50 beds and a handful of dedicated physicians has grown into one of 
                    the region's most trusted healthcare institutions.
                  </p>
                  <p>
                    Over nearly three decades, we have continuously evolved, embracing new medical 
                    technologies and treatment methodologies while never losing sight of our core 
                    mission—putting patients first. Today, we are proud to serve over 50,000 patients 
                    annually with a team of more than 500 expert physicians across 30+ specialties.
                  </p>
                  <p>
                    Our growth has been guided by a simple philosophy: every patient deserves the 
                    same quality of care we would want for our own families. This commitment to 
                    excellence has earned us numerous accolades and, more importantly, the trust 
                    of the communities we serve.
                  </p>
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl transform rotate-2 blur-lg"></div>
                <img 
                  src={medicalTeam} 
                  alt="Our Medical Team" 
                  className="rounded-2xl shadow-2xl w-full relative z-10 hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute -bottom-6 -left-6 bg-card text-card-foreground p-6 rounded-xl shadow-xl z-20 border border-border">
                  <div className="text-4xl font-bold text-primary">29+</div>
                  <div className="text-sm font-medium">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow bg-card">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To provide exceptional, patient-centered healthcare services that improve the 
                    health and well-being of our community. We are committed to delivering 
                    compassionate care through clinical excellence, innovative treatments, and 
                    a dedicated team of healthcare professionals who prioritize the needs of 
                    every patient we serve.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow bg-card">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To be recognized as the leading healthcare institution in the region, known 
                    for our unwavering commitment to quality, innovation, and patient satisfaction. 
                    We envision a future where advanced medical technology and compassionate human 
                    care come together to transform lives and set new standards in healthcare delivery.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do and shape how we care for our patients.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <img 
                    src={medicalEquipment} 
                    alt="Medical Equipment" 
                    className="rounded-xl shadow-lg w-full h-48 object-cover hover:opacity-90 transition-opacity"
                  />
                  <img 
                    src={hospitalReception} 
                    alt="Hospital Reception" 
                    className="rounded-xl shadow-lg w-full h-48 object-cover hover:opacity-90 transition-opacity"
                  />
                  <img 
                    src={hospitalBuilding} 
                    alt="Hospital Building" 
                    className="rounded-xl shadow-lg w-full h-48 object-cover col-span-2 hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl font-bold text-foreground mb-6">World-Class Facilities</h2>
                <div className="space-y-4 text-muted-foreground text-lg">
                  <p>
                    Our hospital is equipped with state-of-the-art medical technology and 
                    infrastructure designed to provide the highest quality care in a comfortable, 
                    healing environment.
                  </p>
                  <ul className="space-y-3 mt-4">
                    {[
                      "Advanced diagnostic imaging with MRI, CT, and PET scanners",
                      "Fully equipped operating theaters with robotic surgery capabilities",
                      "24/7 emergency department with trauma care facilities",
                      "Dedicated ICU and CCU units with continuous monitoring",
                      "Modern patient rooms designed for comfort and recovery"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        </div>
                        <span className="text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Journey</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Key milestones in our journey of healthcare excellence.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border hidden md:block" />
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    <div className={`flex-1 w-full ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <Card className="border-0 shadow-lg inline-block w-full md:w-auto bg-card hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="text-primary font-bold text-xl mb-2">{milestone.year}</div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{milestone.event}</h3>
                          <p className="text-muted-foreground text-sm">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center z-10 flex-shrink-0 shadow-lg border-4 border-background">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Leadership</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Meet the experienced professionals guiding our hospital's vision and operations.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadership.map((leader, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <span className="text-3xl font-bold text-white tracking-widest">
                        {leader.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{leader.name}</h3>
                    <div className="text-primary font-medium text-sm mb-2">{leader.role}</div>
                    <div className="text-muted-foreground text-sm">{leader.specialty}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default About;
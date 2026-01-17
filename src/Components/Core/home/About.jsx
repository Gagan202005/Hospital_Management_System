import { Card, CardContent } from "../../ui/card"; // Changed from @/components/ui/card
import { Button } from "../../ui/button";         // Changed from @/components/ui/button
import medicalTeam from "../../../img/new.webp";      // Changed from @/assets/medical-team.jpg
import { features } from "../../../Data/features";
const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Excellence in Healthcare Since 1985
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              MediCare General Hospital has been serving our community for over 35 years,
              providing compassionate, comprehensive healthcare services. Our commitment to
              medical excellence and patient-centered care has made us a trusted healthcare
              partner for thousands of families.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary-light shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button size="lg">
              Learn More About Us
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <Card className="overflow-hidden shadow-medical border-0">
              <CardContent className="p-0">
                <img
                  src={medicalTeam}
                  alt="Our medical team"
                  className="w-full h-[400px] object-cover"
                />
              </CardContent>
            </Card>

            {/* Floating Stats Card */}
            <Card className="absolute -bottom-6 -left-6 bg-card shadow-medical border-0 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">98%</div>
                <div className="text-sm text-muted-foreground">Patient Satisfaction</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
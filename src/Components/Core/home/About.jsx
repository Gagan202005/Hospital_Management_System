import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import medicalTeam from "../../../img/new.webp";
import { features } from "../../../Data/features";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Side */}
          <div>
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary-light rounded-full">
              Who We Are
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              A Legacy of Healing, <br/> A Future of Hope
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              MediCare General Hospital has been a pillar of the community for over 35 years. 
              We believe in treating the person, not just the disease, through a holistic approach 
              that combines medical expertise with genuine compassion.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" variant="default" className="shadow-lg shadow-primary/20" asChild>
              <Link to="/about">
                Read Our Story <ArrowRight className="ml-2 h-4 w-4"/>
              </Link>
            </Button>
          </div>

          {/* Image Side - Original Styling Preserved */}
          <div className="relative">
            <Card className="overflow-hidden shadow-medical border-0">
              <CardContent className="p-0">
                <img
                  src={medicalTeam}
                  alt="Our medical team"
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
                />
              </CardContent>
            </Card>

            {/* Floating Stats Card */}
            <Card className="absolute -bottom-6 -left-6 bg-card shadow-medical border-0 p-6 hidden md:block">
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
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { services } from "../../../Data/Services";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-background to-primary-light/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Centers of Excellence
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Combining advanced technology with specialized care across key medical disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="group hover:shadow-medical transition-all duration-300 hover:-translate-y-2 border-0 shadow-card bg-card">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-primary-light group-hover:bg-primary transition-colors duration-300 shadow-inner">
                    <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl text-foreground font-bold">{service.title}</CardTitle>
                  <div className="flex items-center justify-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/10 px-3 py-1 rounded-full w-fit mx-auto mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{service.available}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                    {service.description}
                  </p>
                  <Button variant="ghost" className="group/btn text-primary hover:text-primary hover:bg-primary-light" asChild>
                    <Link to="/find-doctor">
                      Consult Specialist 
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
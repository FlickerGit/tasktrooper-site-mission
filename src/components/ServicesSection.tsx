import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Wrench, Sparkles, Settings } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Garden Maintenance",
    description: "Lawn mowing, hedge trimming, pruning, and seasonal cleanups — keeping your gardens crisp, clean, and thriving year-round.",
    color: "text-trooper-green"
  },
  {
    icon: Wrench,
    title: "Building Maintenance",
    description: "Repairs, touch-ups, and upkeep for properties of all sizes — from strata common areas to private home fixes.",
    color: "text-trooper-accent"
  },
  {
    icon: Sparkles,
    title: "End-of-Lease & Strata Cleaning",
    description: "Reliable property refreshes, bin area cleanups, and presentation-ready garden care for real estate, tenants, and managers.",
    color: "text-primary"
  },
  {
    icon: Settings,
    title: "Custom Requests",
    description: "Have a specific job in mind? Let us know and we'll tailor a solution to suit your space and schedule.",
    color: "text-trooper-green-light"
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Services</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive maintenance solutions tailored to your property's needs across Sydney's Lower North Shore and Northern Beaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow group">
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 p-3 rounded-full bg-muted ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-center leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
import { Check, MapPin, Phone, Leaf, Eye, Home, TrendingUp, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: Eye, text: "Improve curb appeal and first impressions" },
  { icon: TrendingUp, text: "Increase perceived property value" },
  { icon: Home, text: "Create a welcoming, cared-for appearance" },
  { icon: Check, text: "Reduce concerns about ongoing maintenance" },
  { icon: Users, text: "Encourage positive buyer, tenant, and visitor reactions" },
];

const services = [
  "Regular lawn mowing and edging",
  "Hedge trimming and pruning",
  "Garden clean-ups and green waste removal",
  "Ongoing maintenance tailored to your property",
  "Reliable, professional service you can trust",
];

const GardenMaintenanceSection = () => {
  const scrollToQuote = () => {
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="garden-maintenance" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Professional Garden Care</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Professional Garden Maintenance{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">in Sydney</span>
          </h2>
          <p className="text-2xl md:text-3xl text-muted-foreground font-light max-w-3xl mx-auto">
            Making Gardens Look Tidy, Healthy & Inviting
          </p>
        </div>

        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 md:p-12">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              At <span className="text-primary font-semibold">TaskTroopers</span>, we provide reliable garden maintenance services that keep properties looking their best. A well-maintained garden creates a strong first impression, improves the overall presentation of a home or building, and reflects pride of ownership.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We help homeowners and strata managers across Sydney's Lower North Shore and Northern Beaches maintain gardens that are neat, welcoming, and professionally cared for year-round.
            </p>
          </div>
        </div>

        {/* Why Garden Presentation Matters */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Garden Presentation{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">Matters</span>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              The garden is often the first thing visitors see. A tidy, well-presented outdoor space immediately improves how a property is perceived — before anyone even steps inside.
            </p>
            <p className="text-muted-foreground italic border-l-4 border-primary pl-4 py-2">
              An untidy or overgrown garden can have the opposite effect, detracting from an otherwise well-presented property.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-6">Well-maintained gardens:</p>
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-card/50 border border-border rounded-xl hover:border-primary/50 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gardens That Add Value */}
        <div className="bg-gradient-to-r from-primary/5 via-trooper-green/5 to-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 mb-20">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Gardens That Add{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">Value</span>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Quality garden maintenance doesn't just improve appearance — it supports property value and lifestyle. Clean lawns, trimmed hedges, healthy plants, and tidy garden beds make outdoor spaces more enjoyable and functional.
            </p>
            <p className="text-xl text-foreground font-medium">
              People don't just look at gardens — they <span className="text-primary">feel</span> them.
            </p>
            <p className="text-muted-foreground mt-4">
              A well-kept garden helps people imagine themselves enjoying the space, relaxing outdoors, or welcoming guests.
            </p>
          </div>
        </div>

        {/* Why Choose TaskTroopers */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="order-2 lg:order-1">
            <div className="bg-card border border-border rounded-2xl p-8">
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-6">Our Services Include:</p>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <span className="text-foreground">{service}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-lg text-muted-foreground">
                  Our focus is simple:{" "}
                  <span className="text-foreground font-medium">to keep every garden looking neat, healthy, and inviting.</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Choose{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">TaskTroopers</span>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We specialise in professional garden maintenance for residential homes, strata properties, and investment properties.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With years of experience across Sydney's Lower North Shore and Northern Beaches, we understand what it takes to keep gardens looking their absolute best throughout the year.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Local, Reliable Garden Care
          </h3>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <MapPin className="h-5 w-5" />
              <span>Sydney's Lower North Shore & Northern Beaches</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <Leaf className="h-5 w-5" />
              <span>Professional garden & property maintenance</span>
            </div>
          </div>
          
          <Button 
            onClick={scrollToQuote}
            size="lg"
            className="bg-background text-primary hover:bg-background/90 font-semibold px-8 py-6 text-lg"
          >
            <Phone className="h-5 w-5 mr-2" />
            Contact TaskTroopers Today
          </Button>
          <p className="text-primary-foreground/80 mt-4 text-sm">
            Get a tailored maintenance solution for your property
          </p>
        </div>
      </div>
    </section>
  );
};

export default GardenMaintenanceSection;

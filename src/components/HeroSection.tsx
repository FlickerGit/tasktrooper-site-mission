import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroIllustration from "@/assets/hero-gardening-illustration.png";

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      {/* Hero illustration background */}
      <div className="absolute inset-0 opacity-30">
        <img 
          src={heroIllustration} 
          alt="Gardening illustration" 
          className="w-full h-full object-cover object-bottom"
        />
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-trooper-green rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-trooper-accent rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
            Your Property.{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Our Mission.
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional garden & building maintenance for homes, strata, and businesses across the Lower North Shore and Northern Beaches.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 shadow-glow"
            >
              Request a Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Explore Our Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
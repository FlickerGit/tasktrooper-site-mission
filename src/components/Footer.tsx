import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/20 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/9339ea5f-8267-4cb7-aa75-5a50bbd6123e.png" 
                alt="TaskTroopers Logo" 
                className="h-10 w-10"
              />
              <h4 className="text-xl font-bold text-foreground">TaskTroopers</h4>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Professional garden & building maintenance for homes, strata, and businesses across Sydney's Lower North Shore and Northern Beaches.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h5 className="text-lg font-semibold text-foreground">Quick Links</h5>
            <nav className="flex flex-col space-y-2">
              <a href="#home" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
              <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</a>
              <a href="#quote" className="text-muted-foreground hover:text-primary transition-colors">Request a Quote</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a>
              <span className="text-muted-foreground/50 cursor-not-allowed">Blog (Coming Soon)</span>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h5 className="text-lg font-semibold text-foreground">Contact Info</h5>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">+61 452 252 550</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">mark@tasktroopers.com.au</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-muted-foreground">Lower North Shore & Northern Beaches, Sydney</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 TaskTroopers. All rights reserved. | Professional maintenance services across Sydney.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
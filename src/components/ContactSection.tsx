import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

const ContactSection = () => {
  const header = useRevealOnScroll<HTMLDivElement>();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Supabase when integration is activated
    toast({
      title: "Message Sent",
      description: "Thank you for your message. We'll get back to you soon!",
    });
    setFormData({ fullName: "", email: "", message: "" });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={header.ref}
          className={`text-center mb-16 transition-all duration-700 ease-out ${
            header.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get in <span className="bg-gradient-primary bg-clip-text text-transparent">Touch</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your property? Contact us today for professional maintenance services across Sydney's Lower North Shore and Northern Beaches.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-semibold text-foreground mb-6">Contact Information</h4>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Phone</h5>
                    <p className="text-muted-foreground">Call us for immediate assistance</p>
                    <p className="text-primary font-medium">+61 452 252 550</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Email</h5>
                    <p className="text-muted-foreground">Send us your queries anytime</p>
                    <p className="text-primary font-medium">mark@tasktroopers.com.au</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground">Service Areas</h5>
                    <p className="text-muted-foreground">We service the following areas:</p>
                    <p className="text-primary font-medium">Lower North Shore & Northern Beaches, Sydney</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-primary rounded-lg text-primary-foreground">
              <h5 className="text-xl font-semibold mb-2">Professional & Reliable</h5>
              <p className="text-primary-foreground/90">
                With years of experience serving Sydney's premium residential areas, TaskTroopers delivers quality maintenance services you can trust.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="bg-card border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Send us a Message</CardTitle>
              <CardDescription>
                Have a question or want to discuss your maintenance needs? We'd love to hear from you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Full Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                    className="bg-background min-h-[120px]"
                    placeholder="Tell us about your maintenance needs or ask any questions..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90 text-lg py-3"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
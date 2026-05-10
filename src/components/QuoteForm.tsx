import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const QuoteForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    serviceType: "",
    description: "",
    preferredDate: ""
  });
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("quote_requests").insert({
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      service_type: formData.serviceType,
      description: formData.description,
      preferred_date: formData.preferredDate || null,
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Quote Request Submitted",
      description: "We'll get back to you within 24 hours with a detailed quote.",
    });
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      serviceType: "",
      description: "",
      preferredDate: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="quote" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Request a <span className="bg-gradient-primary bg-clip-text text-transparent">Quote</span>
            </h3>
            <p className="text-xl text-muted-foreground">
              Tell us about your project and we'll provide a detailed quote within 24 hours.
            </p>
          </div>

          <Card className="bg-card border-border shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Get Your Free Quote</CardTitle>
              <CardDescription>
                Fill out the form below and we'll contact you with a personalized quote for your maintenance needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Type of Service *</Label>
                    <Select value={formData.serviceType} onValueChange={(value) => handleInputChange("serviceType", value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="garden">Garden Maintenance</SelectItem>
                        <SelectItem value="building">Building Maintenance</SelectItem>
                        <SelectItem value="both">Both Garden & Building</SelectItem>
                        <SelectItem value="cleaning">End-of-Lease & Strata Cleaning</SelectItem>
                        <SelectItem value="custom">Custom Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                    className="bg-background"
                    placeholder="Enter the full property address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange("preferredDate", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description of the Job *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                    className="bg-background min-h-[120px]"
                    placeholder="Please describe the work you need done in detail..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photos">Upload Photos (optional)</Label>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    className="bg-background"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload photos to help us better understand your project requirements.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-gradient-primary hover:opacity-90 text-lg py-6"
                >
                  {submitting ? "Submitting..." : "Submit Quote Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
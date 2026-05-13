import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notify, type TimeWindow } from "@/lib/jobs";

type PlaceAutocompleteSuggestion = {
  placePrediction?: {
    text?: { text?: string };
    placeId?: string;
  };
};

const QuoteForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    serviceType: "",
    description: "",
    preferredDate: "",
    preferredTimeWindow: "" as TimeWindow | "",
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const formLoadedAt = useRef<number>(Date.now());
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ description: string; placeId: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const addressDebounceRef = useRef<number | null>(null);
  const addressBlurTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const query = formData.address.trim();
    if (addressDebounceRef.current) window.clearTimeout(addressDebounceRef.current);
    if (query.length < 3) {
      setAddressSuggestions([]);
      setLoadingAddress(false);
      return;
    }
    setLoadingAddress(true);
    addressDebounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "AIzaSyDA-u_jDSyq8Bgd3o_Y7sI_ySBcHp0b0VQ",
          },
          body: JSON.stringify({
            input: query,
            includedRegionCodes: ["au"],
            languageCode: "en-AU",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const suggestions = ((data.suggestions ?? []) as PlaceAutocompleteSuggestion[])
            .filter((s) => s.placePrediction)
            .map((s) => ({
              description: s.placePrediction.text?.text ?? "",
              placeId: s.placePrediction.placeId ?? "",
            }));
          setAddressSuggestions(suggestions);
        }
      } catch {
        // silent — fallback to manual entry
      } finally {
        setLoadingAddress(false);
      }
    }, 350);
    return () => {
      if (addressDebounceRef.current) window.clearTimeout(addressDebounceRef.current);
    };
  }, [formData.address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Spam protection: honeypot field only. Avoid silently dropping fast legitimate/test submissions.
    if (website.trim() !== "") {
      toast({
        title: "Quote Request Submitted",
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        serviceType: "",
        description: "",
        preferredDate: "",
        preferredTimeWindow: "",
      });
      return;
    }
    setSubmitting(true);
    const id = crypto.randomUUID();
    const { error } = await supabase.from("quote_requests").insert({
      id,
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      service_type: formData.serviceType,
      description: formData.description,
      preferred_date: formData.preferredDate || null,
      preferred_time_window: formData.preferredTimeWindow || null,
      customer_id: user?.id ?? null,
    });
    if (error) {
      setSubmitting(false);
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Upload photos to job-photos bucket if user is logged in (RLS requires auth)
    if (user && photoFiles && photoFiles.length > 0) {
      for (const file of Array.from(photoFiles)) {
        const path = `${id}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("job-photos")
          .upload(path, file, { upsert: false });
        if (!upErr) {
          await supabase.from("job_attachments").insert({
            job_id: id,
            uploaded_by: user.id,
            storage_path: path,
          });
        }
      }
    }
    setSubmitting(false);

    // Notification placeholder — admin gets pinged about new request
    notify.adminNewQuoteRequest(id);

    // Notify the business owner — fire and forget
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "quote-request-notification",
        recipientEmail: "mark@tasktroopers.com.au",
        idempotencyKey: `quote-${id}`,
        templateData: {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          serviceType: formData.serviceType,
          description: formData.description,
          preferredDate: formData.preferredDate || "",
        },
      },
    });

    // Forward to Zapier through the backend webhook so JSON arrives reliably.
    try {
      const { error: zapError } = await supabase.functions.invoke("zapier-quote-webhook", {
        body: {
          id,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          serviceType: formData.serviceType,
          description: formData.description,
          preferredDate: formData.preferredDate || "",
          preferredTimeWindow: formData.preferredTimeWindow || "",
          triggered_at: new Date().toISOString(),
          source: "tasktroopers-quote-form",
        },
      });
      if (zapError) {
        console.error("Zapier webhook failed:", zapError);
      } else {
        console.log("Zapier webhook fired");
      }
    } catch (err) {
      console.error("Zapier webhook invoke failed:", err);
    }
    toast({
      title: "Quote Request Submitted",
      description: "We'll get back to you within 24 hours with a detailed quote.",
    });
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      serviceType: "",
      description: "",
      preferredDate: "",
      preferredTimeWindow: "",
    });
    setPhotoFiles(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectAddress = (description: string) => {
    setFormData(prev => ({ ...prev, address: description }));
    setAddressSuggestions([]);
    setShowSuggestions(false);
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
                {/* Honeypot field — hidden from users, bots fill it */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
                  <Label htmlFor="quote-website">Website</Label>
                  <Input
                    id="quote-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                  <Label htmlFor="address">Property Address *</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => {
                        handleInputChange("address", e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        // Delay to allow click on suggestion
                        addressBlurTimeoutRef.current = window.setTimeout(() => setShowSuggestions(false), 150);
                      }}
                      autoComplete="off"
                      required
                      className="bg-background"
                      placeholder="Start typing your address..."
                    />
                    {showSuggestions && (addressSuggestions.length > 0 || loadingAddress) && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg max-h-64 overflow-y-auto">
                        {loadingAddress && addressSuggestions.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Searching…</div>
                        )}
                        {addressSuggestions.map((s) => (
                          <button
                            key={s.placeId}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectAddress(s.description);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            {s.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Suggestions powered by Google. Australian addresses only.</p>
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
                  <Label htmlFor="timeWindow">Preferred Time Window</Label>
                  <Select
                    value={formData.preferredTimeWindow}
                    onValueChange={(v) => setFormData((p) => ({ ...p, preferredTimeWindow: v as TimeWindow }))}
                  >
                    <SelectTrigger id="timeWindow" className="bg-background">
                      <SelectValue placeholder="Select a time window" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8am – 12pm)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12pm – 5pm)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
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
                    onChange={(e) => setPhotoFiles(e.target.files)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {user
                      ? "Photos help us prepare a better quote."
                      : "Sign in to attach photos with your request — or add them later from your dashboard."}
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
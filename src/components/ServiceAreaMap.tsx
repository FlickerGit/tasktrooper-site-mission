import { MapPin } from "lucide-react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

const suburbs = [
  "Mosman",
  "Cremorne",
  "Neutral Bay",
  "Kirribilli",
  "Lane Cove",
  "Chatswood",
  "Willoughby",
  "Northbridge",
  "Manly",
  "Dee Why",
  "Freshwater",
  "Collaroy",
  "Narrabeen",
  "Mona Vale",
  "Avalon",
  "Palm Beach",
];

const ServiceAreaMap = () => {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="service-area" className="py-20 bg-muted/10">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`text-center mb-12 transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Where We Work</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Service Area</span>
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Proudly servicing Sydney's Lower North Shore and Northern Beaches.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Map */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-border shadow-xl bg-card">
            <div className="aspect-[4/3] w-full">
              <iframe
                title="TaskTroopers Service Area — Lower North Shore & Northern Beaches"
                src="https://www.google.com/maps?q=Northern+Beaches+Sydney+NSW&z=11&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.2) contrast(1.05)" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* Suburb list */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8">
            <h4 className="text-lg font-semibold text-foreground mb-2">Suburbs we cover</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Plus surrounding areas — get in touch to confirm your location.
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {suburbs.map((suburb) => (
                <div key={suburb} className="flex items-center gap-2 text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-sm">{suburb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceAreaMap;
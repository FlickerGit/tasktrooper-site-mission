import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import GardenMaintenanceSection from "@/components/GardenMaintenanceSection";
import ServiceAreaMap from "@/components/ServiceAreaMap";
import QuoteForm from "@/components/QuoteForm";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <GardenMaintenanceSection />
        <ServiceAreaMap />
        <QuoteForm />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

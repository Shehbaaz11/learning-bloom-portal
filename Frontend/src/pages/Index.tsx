import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InfoGrid from "@/components/InfoGrid";
import PrincipalMessage from "@/components/PrincipalMessage";
import OperatingHours from "@/components/OperatingHours";
import FacilitiesSection from "@/components/FacilitiesSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingAdmission from "@/components/FloatingAdmission";
import AdmissionModal from "@/components/AdmissionModal";
import FeesModal from "@/components/FeesModal";

const Index = () => {
  const [admissionOpen, setAdmissionOpen] = useState(false);
  const [feesOpen, setFeesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onOpenAdmission={() => setAdmissionOpen(true)}
        onOpenFees={() => setFeesOpen(true)}
      />
      <HeroSection />
      <InfoGrid />
      <PrincipalMessage />
      <OperatingHours />
      <FacilitiesSection />
      <ContactSection />
      <Footer />

      <FloatingAdmission onClick={() => setAdmissionOpen(true)} />
      <AdmissionModal open={admissionOpen} onClose={() => setAdmissionOpen(false)} />
      <FeesModal open={feesOpen} onClose={() => setFeesOpen(false)} />
    </div>
  );
};

export default Index;

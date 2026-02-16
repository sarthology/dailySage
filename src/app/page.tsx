import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LandingContent } from "@/components/landing/LandingContent";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <LandingContent />
      <Footer />
    </div>
  );
}

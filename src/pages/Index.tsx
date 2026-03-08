import StickyHeader from "@/components/StickyHeader";
import HeroSection from "@/components/HeroSection";
import ScheduleSection from "@/components/ScheduleSection";
import CoachSection from "@/components/CoachSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LogisticsSection from "@/components/LogisticsSection";
import FinalCTA from "@/components/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <HeroSection />
      <ScheduleSection />
      <CoachSection />
      <TestimonialsSection />
      <LogisticsSection />
      <FinalCTA />

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 Alex Moreno. Barcelona, Spain.</p>
          <p className="text-xs">Strength & Conditioning Coaching</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

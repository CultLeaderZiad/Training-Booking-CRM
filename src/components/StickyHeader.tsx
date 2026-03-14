import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooking } from "@/hooks/use-booking";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { label: "Schedule", href: "#schedule" },
  { label: "Coach", href: "#coach" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Logistics", href: "#logistics" },
];

const StickyHeader = () => {
  const { handleBook } = useBooking();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ALEX <span className="text-primary">MORENO</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNavClick(l.href)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </button>
          ))}
          <Link to="/login">
            <Button size="sm" variant="ghost" className="rounded-lg font-medium text-muted-foreground hover:text-foreground">
              Login
            </Button>
          </Link>
          <Button size="sm" className="rounded-lg font-medium" onClick={() => handleBook()}>
            Book Now
          </Button>
        </nav>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Link to="/login">
            <Button size="sm" variant="ghost" className="rounded-lg font-medium text-xs px-2 text-muted-foreground">
              Login
            </Button>
          </Link>
          <Button size="sm" className="rounded-lg font-medium text-xs px-3.5" onClick={() => handleBook()}>
            Book
          </Button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-foreground p-1">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => handleNavClick(l.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left py-1"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default StickyHeader;

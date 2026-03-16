import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooking } from "@/hooks/use-booking";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, ShieldCheck, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { label: "Schedule", href: "#schedule" },
  { label: "Coach", href: "#coach" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Logistics", href: "#logistics" },
];

const StickyHeader = () => {
  const { handleBook } = useBooking();
  const { user, role, signOut } = useAuth();
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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 transform translate-z-0 ${
        scrolled
        ? "bg-background/98 backdrop-blur-xl border-b border-border shadow-2xl py-4"
        : "bg-background/90 border-b border-border/50 py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between transition-all duration-500">
        <a href="#" className="font-bold text-xl tracking-tighter text-foreground flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ALEX <span className="text-primary">MORENO</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNavClick(l.href)}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
            >
              {l.label}
            </button>
          ))}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <UserAvatar 
                    avatarPath={user.user_metadata?.avatar_url} 
                    name={user.user_metadata?.full_name} 
                    email={user.email} 
                    className="h-8 w-8" 
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild className="focus:bg-secondary/50">
                  <Link to="/dashboard/profile-settings" className="cursor-pointer w-full flex items-center py-2 text-foreground">
                    <User className="w-4 h-4 mr-3 text-primary" />
                    <span className="font-bold">Profile Info</span>
                  </Link>
                </DropdownMenuItem>
                
                {role === 'admin' ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer w-full flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-500 focus:text-red-500 flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="ghost" className="rounded-lg font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                Login
              </Button>
            </Link>
          )}
          <Button size="sm" className="rounded-lg font-medium" onClick={() => handleBook()}>
            Book Now
          </Button>
        </nav>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full mr-2">
                  <UserAvatar 
                    avatarPath={user.user_metadata?.avatar_url} 
                    name={user.user_metadata?.full_name} 
                    email={user.email} 
                    className="h-8 w-8" 
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer w-full flex items-center">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                {role === 'admin' ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer w-full flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
                      <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-500 focus:text-red-500 flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="ghost" className="rounded-lg font-medium text-xs px-2 text-muted-foreground">
                Login
              </Button>
            </Link>
          )}
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

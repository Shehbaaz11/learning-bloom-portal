import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import schoolLogo from "@/assets/school-logo.png";

interface NavbarProps {
  onOpenAdmission: () => void;
  onOpenFees: () => void;
}

const Navbar = ({ onOpenAdmission, onOpenFees }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "Academics", href: "#academics" },
    { label: "Facilities", href: "#facilities" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-border"
          : "bg-white/20 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 lg:h-20 px-4">
        <a href="#home" className="flex items-center gap-3">
          <img src={schoolLogo} alt="Learning High School" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
          <span className="font-serif font-bold text-lg text-primary hidden sm:inline">
            Learning High School
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-colors rounded-xl hover:bg-primary/5"
            >
              {l.label}
            </a>
          ))}
          <Button variant="gold" size="sm" onClick={onOpenFees} className="ml-3 rounded-2xl">
            Pay Fees
          </Button>
        </nav>

        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-border overflow-hidden"
          >
            <div className="container mx-auto py-4 px-4 flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Button variant="gold" className="mt-3 rounded-2xl" onClick={() => { onOpenFees(); setMobileOpen(false); }}>
                Pay Fees
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

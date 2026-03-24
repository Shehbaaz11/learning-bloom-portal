import { MapPin, Phone, Mail } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={schoolLogo} alt="Logo" className="w-12 h-12 object-contain brightness-0 invert" />
              <span className="font-serif font-bold text-lg">Learning High School</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Empowering minds and shaping futures since 2021. Providing world-class education in Bhiwandi, Maharashtra.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider mb-4 text-gold">Quick Links</h4>
            <div className="space-y-2.5">
              {[
                { label: "Home", href: "#home" },
                { label: "About Us", href: "#about" },
                { label: "Academics", href: "#academics" },
                { label: "Facilities", href: "#facilities" },
                { label: "Contact", href: "#contact" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="block text-sm text-primary-foreground/60 hover:text-gold transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider mb-4 text-gold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-primary-foreground/60">
                  Learning High School, Bhiwandi, Maharashtra, India
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gold flex-shrink-0" />
                <span className="text-sm text-primary-foreground/60">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gold flex-shrink-0" />
                <span className="text-sm text-primary-foreground/60">info@learninghighschool.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} Learning High School, Bhiwandi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Learning High School Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      <div className="relative z-10 container mx-auto text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-gold font-sans font-medium tracking-[0.25em] uppercase text-sm mb-6"
        >
          Bhiwandi's Premier Institution
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-bold text-white leading-[1.05] mb-6"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
         Welcome to day 3 school test-33333 bigboss john cena the rockss
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/80 font-sans text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          Empowering Minds, Shaping Futures since 2021.
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full" preserveAspectRatio="none">
          <path
            d="M0 120V60C240 20 480 0 720 20C960 40 1200 80 1440 60V120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;

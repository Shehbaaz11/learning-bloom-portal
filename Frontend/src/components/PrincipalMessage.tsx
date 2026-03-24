import { motion } from "framer-motion";
import principalImg from "@/assets/principal.jpg";

const PrincipalMessage = () => {
  return (
    <section id="about" className="section-padding-lg bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden border-4 border-accent shadow-2xl">
              <img
                src={principalImg}
                alt="Principal of Learning High School"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-2xl px-6 py-3 shadow-xl">
              <p className="font-serif font-bold text-sm">Est. 2021</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-accent font-semibold text-sm tracking-[0.15em] uppercase mb-3">About Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-6 leading-tight">
              Principal's Vision & Our Mission
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                At Learning High School, we believe in holistic development. Established in 2021, our mission is to
                provide world-class education with strong moral values.
              </p>
              <p>
                Under the guidance of our highly experienced Principal and dedicated staff, we nurture every child's
                potential. Our approach combines rigorous academics with character building, creativity, and critical
                thinking.
              </p>
              <p>
                We are committed to creating an environment where every student feels inspired, supported, and
                empowered to achieve their dreams — building the leaders and thinkers of tomorrow.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-0.5 bg-accent" />
              <p className="font-serif font-bold text-primary">Learning High School, Bhiwandi</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-20">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0 80V30Q360 0 720 30Q1080 60 1440 30V80H0Z" fill="hsl(var(--primary))" />
        </svg>
      </div>
    </section>
  );
};

export default PrincipalMessage;

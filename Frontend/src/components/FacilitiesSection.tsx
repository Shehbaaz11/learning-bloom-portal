import { Monitor, FlaskConical, BookOpen, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const facilities = [
  {
    icon: Monitor,
    title: "Smart Classrooms",
    description: "Interactive digital boards and modern AV equipment for immersive, engaging lessons.",
  },
  {
    icon: FlaskConical,
    title: "Advanced Science Labs",
    description: "State-of-the-art physics, chemistry, and biology labs for hands-on experimentation.",
  },
  {
    icon: BookOpen,
    title: "Digital Library",
    description: "A vast collection of books, journals, and digital resources for research and learning.",
  },
  {
    icon: Trophy,
    title: "Sports Complex",
    description: "Modern facilities for cricket, basketball, athletics, and indoor sports activities.",
  },
];

const FacilitiesSection = () => {
  return (
    <section id="facilities" className="section-padding-lg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="text-accent font-semibold text-sm tracking-[0.15em] uppercase mb-3">Our Infrastructure</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-4">
            Experience Our World-Class Facilities
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Modern infrastructure designed to inspire curiosity, creativity, and excellence.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {facilities.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-card rounded-3xl border border-border shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="h-40 bg-secondary flex items-center justify-center">
                <f.icon className="text-primary/40 group-hover:text-primary transition-colors" size={56} />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-bold text-primary mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;

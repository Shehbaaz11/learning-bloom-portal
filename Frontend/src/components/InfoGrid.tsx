import { GraduationCap, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    icon: Calendar,
    title: "Legacy of Excellence",
    description: "Founded in 2021, building a tradition of academic brilliance and character development.",
  },
  {
    icon: GraduationCap,
    title: "Comprehensive Education",
    description: "Educating students from 1st to 12th grade with a holistic and future-ready curriculum.",
  },
  {
    icon: Users,
    title: "Expert Faculty",
    description: "Highly experienced teachers and Principal dedicated to nurturing every child's potential.",
  },
];

const InfoGrid = () => {
  return (
    <section className="relative z-20 -mt-28 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card rounded-3xl p-8 text-center hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto mb-5">
                <item.icon className="text-accent" size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoGrid;

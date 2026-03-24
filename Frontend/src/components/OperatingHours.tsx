import { Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const scheduleItems = [
  { month: "April", event: "New Academic Session Begins" },
  { month: "June", event: "First Unit Test & Summer Activities" },
  { month: "August", event: "Independence Day Celebrations & Sports Week" },
  { month: "September", event: "Half-Yearly Examinations" },
  { month: "October", event: "Diwali Vacation & Cultural Fest" },
  { month: "December", event: "Annual Day & Winter Break" },
  { month: "January", event: "Republic Day Program & Science Exhibition" },
  { month: "March", event: "Final Examinations & Result Declaration" },
];

const OperatingHours = () => {
  return (
    <section id="academics" className="bg-primary text-primary-foreground">
      <div className="section-padding-lg">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14"
          >
            <p className="text-gold font-semibold text-sm tracking-[0.15em] uppercase mb-3">Academics & Timings</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">School Operating Hours</h2>
            <p className="text-primary-foreground/60 max-w-xl mx-auto">
              Structured timings designed to maximize learning, growth, and well-being.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
            {[
              {
                title: "Primary Section",
                subtitle: "Classes 1st – 5th",
                time: "11:00 AM – 2:30 PM",
                desc: "Focus on foundational learning and play.",
              },
              {
                title: "Secondary Section",
                subtitle: "Classes 6th – 12th",
                time: "8:30 AM – 2:30 PM",
                desc: "Focus on advanced academics and skill-building.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10"
              >
                <Clock className="text-gold mb-4" size={32} />
                <h3 className="font-serif text-xl font-bold mb-1">{item.title}</h3>
                <p className="text-primary-foreground/50 text-sm mb-3">{item.subtitle}</p>
                <p className="text-gold font-bold text-2xl mb-2">{item.time}</p>
                <p className="text-primary-foreground/60 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="text-gold" size={24} />
              <h3 className="font-serif text-2xl font-bold">Yearly Schedule & Curriculum</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {scheduleItems.map((item, i) => (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10"
                >
                  <span className="text-gold font-bold text-sm min-w-[56px]">{item.month}</span>
                  <p className="text-primary-foreground/70 text-sm">{item.event}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OperatingHours;

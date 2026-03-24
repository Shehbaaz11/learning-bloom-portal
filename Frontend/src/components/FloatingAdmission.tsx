import { motion } from "framer-motion";

interface FloatingAdmissionProps {
  onClick: () => void;
}

const FloatingAdmission = ({ onClick }: FloatingAdmissionProps) => {
  return (
    <motion.button
      initial={{ x: 60 }}
      animate={{ x: 0 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 120, damping: 14 }}
      onClick={onClick}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase px-4 py-3 rounded-l-2xl shadow-2xl hover:bg-primary/90 active:scale-[0.97] transition-all origin-right"
      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      aria-label="Admissions Open"
    >
      Admissions Open
    </motion.button>
  );
};

export default FloatingAdmission;

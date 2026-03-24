import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeesModalProps {
  open: boolean;
  onClose: () => void;
}

const FeesModal = ({ open, onClose }: FeesModalProps) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card rounded-t-3xl flex items-center justify-between p-6 border-b border-border z-10">
              <h2 className="font-serif text-xl font-bold text-primary">Fees Receipt</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-xl transition-colors" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="font-serif text-lg font-bold text-primary">Receipt Generated!</p>
                <p className="text-muted-foreground text-sm mt-2">Payment details recorded successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Field label="Student Name" required />
                <Field label="Contact Number" type="tel" required />
                <Field label="Total Fees" type="number" required />
                <Field label="Last Paid Amount (Optional)" type="number" />
                <Field label="Today's Payment" type="number" required />
                <Field label="Fine Due Date" type="date" required />
                <Field label="Total Remaining Balance" type="number" required />
                <Button type="submit" variant="gold" className="w-full mt-2 rounded-2xl py-3">
                  Generate Receipt
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, type = "text", required = false }: { label: string; type?: string; required?: boolean }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <input
      type={type}
      required={required}
      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default FeesModal;

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdmissionModalProps {
  open: boolean;
  onClose: () => void;
}

const AdmissionModal = ({ open, onClose }: AdmissionModalProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    studentPhone: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    parentOccupation: '',
    existingSchool: '',
    busRequired: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/admission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            studentName: '',
            studentPhone: '',
            dateOfBirth: '',
            parentName: '',
            parentPhone: '',
            parentOccupation: '',
            existingSchool: '',
            busRequired: '',
            address: ''
          });
          onClose();
        }, 2000);
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('Server se connect nahi ho pa raha. Backend chal raha hai?');
    } finally {
      setLoading(false);
    }
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
              <h2 className="font-serif text-xl font-bold text-primary">Admission Form</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-xl transition-colors" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="font-serif text-lg font-bold text-primary">Application Submitted!</p>
                <p className="text-muted-foreground text-sm mt-2">We will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <Field
                  label="Student Full Name"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                />
                <Field
                  label="Student Phone Number"
                  type="tel"
                  required
                  value={formData.studentPhone}
                  onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                />
                <Field
                  label="Date of Birth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                <Field
                  label="Parent Full Name"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                />
                <Field
                  label="Parent Contact Number"
                  type="tel"
                  required
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                />
                <Field
                  label="Parent Occupation"
                  required
                  value={formData.parentOccupation}
                  onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                />
                <Field
                  label="Existing School"
                  required
                  value={formData.existingSchool}
                  onChange={(e) => setFormData({ ...formData, existingSchool: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    School Bus Required <span className="text-destructive">*</span>
                  </label>
                  <select
                    required
                    value={formData.busRequired}
                    onChange={(e) => setFormData({ ...formData, busRequired: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Home Address <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="gold"
                  className="w-full mt-2 rounded-2xl py-3"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({
  label,
  type = "text",
  required = false,
  value,
  onChange
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default AdmissionModal;
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdmissionModalProps {
  open: boolean;
  onClose: () => void;
}

const AdmissionModal = ({ open, onClose }: AdmissionModalProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const formRef = useRef<HTMLFormElement>(null);

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
  
  // Aaj ki date ko YYYY-MM-DD format mein nikalne ke liye
const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.status === 201) {
        setApplicationNumber(data.data.applicationNumber);
        setSubmitted(true);
        setFormData({
          studentName: '', studentPhone: '', dateOfBirth: '', parentName: '',
          parentPhone: '', parentOccupation: '', existingSchool: '', busRequired: '', address: ''
        });
      } else if (response.status === 400 && data.errors) {
        const newErrors: Record<string, string> = {};
        data.errors.forEach((err: { field: string; message: string }) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);

        setTimeout(() => {
          const firstErrorField = document.querySelector('.text-destructive');
          if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
      } else if (response.status === 409) {
        setErrors({ studentName: data.message });
        formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.message || "An unexpected error occurred.");
      }
    } catch (err) {
      alert('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card rounded-t-3xl flex items-center justify-between p-6 border-b z-10">
              <h2 className="text-xl font-bold text-primary">Admission Application</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-xl transition-colors"><X size={20} /></button>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1.1 }} 
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 size={48} className="text-green-600" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-green-700">Admission Successfully Completed!</h2>
                <p className="text-muted-foreground mt-2">Your application has been received. We will contact you soon.</p>
                
                <div className="mt-8 p-6 bg-secondary/50 rounded-3xl border-2 border-dashed border-border">
                  <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-1">Your Application Number</p>
                  <p className="text-4xl font-mono font-black text-primary tracking-tighter">
                    {applicationNumber}
                  </p>
                </div>

                <Button className="mt-8 w-full h-14 rounded-2xl bg-primary text-lg font-bold" onClick={onClose}>
                  Close Window
                </Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
                {errors.studentName && errors.studentName.includes("Duplicate") && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm"
                  >
                    <span>⚠️</span> {errors.studentName}
                  </motion.div>
                )}

                <Field
                  label="Student Full Name"
                  placeholder="e.g. Jack Hills"
                  required
                  value={formData.studentName}
                  error={errors.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Student Phone"
                    type="tel"
                    required
                    placeholder="10 digit number"
                    value={formData.studentPhone}
                    error={errors.studentPhone}
                    onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                  />
               <Field
  label="Date of Birth"
  type="date"
  required
  max={today} // Yeh future dates ko disable kar dega
  value={formData.dateOfBirth}
  error={errors.dateOfBirth}
  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
/>
                </div>

                <Field
                  label="Parent Full Name"
                  required
                  value={formData.parentName}
                  error={errors.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Parent Contact"
                    type="tel"
                    required
                    placeholder="Must be different"
                    value={formData.parentPhone}
                    error={errors.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  />
                  <Field
                    label="Occupation"
                    required
                    value={formData.parentOccupation}
                    error={errors.parentOccupation}
                    onChange={(e) => setFormData({ ...formData, parentOccupation: e.target.value })}
                  />
                </div>

                <Field
                  label="Existing School"
                  required
                  value={formData.existingSchool}
                  error={errors.existingSchool}
                  onChange={(e) => setFormData({ ...formData, existingSchool: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Bus Service Required? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.busRequired}
                    onChange={(e) => setFormData({ ...formData, busRequired: e.target.value })}
                    className={`w-full rounded-2xl border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-maroon/20 outline-none transition-all ${errors.busRequired ? 'border-destructive' : 'border-input'}`}
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {errors.busRequired && <p className="text-destructive text-xs mt-1 ml-1 font-medium">{errors.busRequired}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Residential Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full rounded-2xl border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-maroon/20 outline-none resize-none transition-all ${errors.address ? 'border-destructive' : 'border-input'}`}
                  />
                  {errors.address && <p className="text-destructive text-xs mt-1 ml-1 font-medium">{errors.address}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-maroon hover:bg-maroon-dark text-white font-bold transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : 'Confirm Admission'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, type = "text", value, onChange, error, placeholder, required }: any) => (
  <div className="w-full">
    <label className="block text-sm font-medium mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className={`w-full rounded-2xl border bg-background px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-maroon/20 outline-none ${error ? 'border-destructive shadow-[0_0_0_1px_rgba(220,38,38,0.1)]' : 'border-input'}`}
    />
    {error && <p className="text-destructive text-xs mt-1 ml-1 font-medium">{error}</p>}
  </div>
);

export default AdmissionModal;
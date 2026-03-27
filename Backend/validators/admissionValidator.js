const { z } = require('zod');

const admissionZodSchema = z.object({
  studentName: z.string()
    .min(1, "Student name is required")
    .min(5, "Student Full Name must be at least 5 characters long")
    .max(100, "Student name cannot exceed 100 characters"),

  studentPhone: z.string()
    .regex(/^[0-9]{10}$/, "Student phone must be a valid 10-digit number"),

  dateOfBirth: z.string()
  .min(1, "Date of birth is required")
  .refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    return selectedDate <= today; // Sirf aaj ya purani date allow hogi
  }, {
    message: "Date of birth cannot be in the future",
  }),

  parentName: z.string()
    .min(1, "Parent/Guardian name is required")
    .min(5, "Parent name must be at least 5 characters long"),

  parentPhone: z.string()
    .regex(/^[0-9]{10}$/, "Parent phone must be a valid 10-digit number"),

  parentOccupation: z.string()
    .min(1, "Parent occupation is required"),

  // 1. Existing School: Optional banaya (Required nahi hai)
  existingSchool: z.string().min(1, "Previous school name is required"),

  // 2. Bus Required: Sirf 'yes' aur 'no' allow hoga
  busRequired: z.enum(["yes", "no"], {
    errorMap: () => ({ message: "Please select either 'yes' or 'no' for bus service" })
  }),

  address: z.string()
    .min(10, "Full address is required (minimum 10 characters)"),
});

module.exports = { admissionZodSchema };
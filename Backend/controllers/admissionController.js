const { pool } = require("../config/db");
const { admissionZodSchema } = require("../validators/admissionValidator");

// POST - Submit Admission Form (Production Level)
const submitAdmission = async (req, res) => {
  console.log("📥 Incoming Admission Request...");

  // 1. Zod Validation
  const validation = admissionZodSchema.safeParse(req.body);

  if (!validation.success) {
    const formattedErrors = validation.error.errors.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation Failed",
      errors: formattedErrors,
    });
  }

  const data = validation.data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Start Transaction

    // 2. Duplication Check
    const duplicateCheck = await client.query(
      `SELECT id, student_name FROM admission_forms 
           WHERE student_phone = $1 OR (student_name = $2 AND student_phone = $1)`,
      [data.studentPhone, data.studentName]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      const existing = duplicateCheck.rows[0];
      const message =
        existing.student_name !== data.studentName
          ? "This phone number is already registered with another student."
          : "Duplicate Entry: A student with this name and phone number is already registered.";
      return res.status(409).json({ success: false, message });
    }

    // 3. Student & Parent Phone Same Check
    // 3. Student & Parent Phone Same Check
    if (data.studentPhone === data.parentPhone) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Validation Failed", // Common message
        errors: [
          {
            field: "parentPhone", // Ab frontend ko pata chalega ki kahan dikhana hai
            message: "Student and parent contact numbers cannot be the same.",
          },
        ],
      });
    }

    // 3. Insert Base Data
    const insertQuery = `
            INSERT INTO admission_forms 
            (student_name, student_phone, date_of_birth, parent_name, 
             parent_phone, parent_occupation, existing_school, bus_required, address)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;

    const values = [
      data.studentName,
      data.studentPhone,
      data.dateOfBirth,
      data.parentName,
      data.parentPhone,
      data.parentOccupation,
      data.existingSchool || null,
      data.busRequired,
      data.address,
    ];

    const result = await client.query(insertQuery, values);
    const newId = result.rows[0].id;

    // 4. Generate & Update Application Number
    const applicationNumber = `APP-${5000 + newId}`;
    await client.query(
      `UPDATE admission_forms SET application_number = $1 WHERE id = $2`,
      [applicationNumber, newId]
    );

    await client.query("COMMIT"); // Final Save

    return res.status(201).json({
      success: true,
      message: "Admission form submitted successfully!",
      data: { id: newId, applicationNumber: applicationNumber },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Transaction Error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  } finally {
    client.release();
  }
};

// GET - Get All Applications
const getAllAdmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM admission_forms ORDER BY created_at DESC`
    );
    const data = result.rows.map((s) => ({
      ...s,
      fees: { total: s.fees_total, paid: s.fees_paid, pending: s.fees_pending },
    }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET - Get Single Application by ID
const getAdmissionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM admission_forms WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET - Search by Application Number
const searchByApplicationNumber = async (req, res) => {
  const { appNumber } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM admission_forms WHERE application_number = $1`,
      [appNumber]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No student found" });
    }
    const student = result.rows[0];
    return res.json({
      success: true,
      data: {
        ...student,
        fees: {
          total: student.fees_total,
          paid: student.fees_paid,
          pending: student.fees_pending,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH - Update Status
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  try {
    const result = await pool.query(
      `UPDATE admission_forms SET status = $1 WHERE id = $2 RETURNING id`,
      [status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH - Update Fees
const updateFees = async (req, res) => {
  const { id } = req.params;
  const { feesTotal, feesPaid } = req.body;
  const feesPending = feesTotal - feesPaid;
  try {
    await pool.query(
      `UPDATE admission_forms SET fees_total = $1, fees_paid = $2, fees_pending = $3 WHERE id = $4`,
      [feesTotal, feesPaid, feesPending, id]
    );
    return res.json({ success: true, message: "Fees updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// --- CRITICAL: All functions must be exported ---
module.exports = {
  submitAdmission,
  getAllAdmissions,
  getAdmissionById,
  searchByApplicationNumber,
  updateStatus,
  updateFees,
};

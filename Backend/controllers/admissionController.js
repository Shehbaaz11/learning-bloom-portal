const { pool } = require("../config/db");

// Generate Application Number
const generateApplicationNumber = (id) => {
  return `APP-${5000 + id}`;
};

// POST - Submit Admission Form
const submitAdmission = async (req, res) => {
  console.log("📥 New Admission Received:", req.body);

  const {
    studentName,
    studentPhone,
    dateOfBirth,
    parentName,
    parentPhone,
    parentOccupation,
    existingSchool,
    busRequired,
    address,
  } = req.body;

  // Validation
  if (
    !studentName ||
    !studentPhone ||
    !dateOfBirth ||
    !parentName ||
    !parentPhone ||
    !parentOccupation ||
    !existingSchool ||
    !busRequired ||
    !address
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Step 1: Insert karo
    const insertQuery = `
      INSERT INTO admission_forms 
        (student_name, student_phone, date_of_birth, parent_name, 
         parent_phone, parent_occupation, existing_school, bus_required, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const values = [
      studentName,
      studentPhone,
      dateOfBirth,
      parentName,
      parentPhone,
      parentOccupation,
      existingSchool,
      busRequired,
      address,
    ];

    const result = await pool.query(insertQuery, values);
    const newId = result.rows[0].id;
    const applicationNumber = generateApplicationNumber(newId);

    // Step 2: Application number update karo
    await pool.query(
      `UPDATE admission_forms SET application_number = $1 WHERE id = $2`,
      [applicationNumber, newId]
    );

    console.log(
      `✅ Saved! ID: ${newId} | Application Number: ${applicationNumber}`
    );

    return res.status(201).json({
      success: true,
      message: "Admission form submitted successfully!",
      applicationId: newId,
      applicationNumber: applicationNumber,
    });
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message,
    });
  }
};

// GET - Saari Applications
const getAllAdmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM admission_forms ORDER BY created_at DESC`
    );

    const data = result.rows.map((s) => ({
      ...s,
      fees: {
        total: s.fees_total,
        paid: s.fees_paid,
        pending: s.fees_pending,
      },
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET - Application Number se Search
const searchByApplicationNumber = async (req, res) => {
  const { appNumber } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM admission_forms WHERE application_number = $1`,
      [appNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No student found with this application number",
      });
    }

    const student = result.rows[0];

    return res.json({
      success: true,
      data: {
        applicationNumber: student.application_number,
        studentName: student.student_name,
        studentPhone: student.student_phone,
        dateOfBirth: student.date_of_birth,
        parentName: student.parent_name,
        parentPhone: student.parent_phone,
        parentOccupation: student.parent_occupation,
        existingSchool: student.existing_school,
        busRequired: student.bus_required,
        address: student.address,
        status: student.status,
        fees: {
          total: student.fees_total,
          paid: student.fees_paid,
          pending: student.fees_pending,
        },
        submittedAt: student.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET - ID se Single Record
const getAdmissionById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM admission_forms WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH - Status Update
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Use: pending, reviewed, accepted, rejected",
    });
  }

  try {
    await pool.query(`UPDATE admission_forms SET status = $1 WHERE id = $2`, [
      status,
      id,
    ]);

    return res.json({
      success: true,
      message: `Status updated to ${status}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH - Fees Update
const updateFees = async (req, res) => {
  const { id } = req.params;
  const { feesTotal, feesPaid } = req.body;

  if (feesTotal === undefined || feesPaid === undefined) {
    return res.status(400).json({
      success: false,
      message: "feesTotal and feesPaid are required",
    });
  }

  const feesPending = feesTotal - feesPaid;

  try {
    await pool.query(
      `UPDATE admission_forms 
       SET fees_total = $1, fees_paid = $2, fees_pending = $3 
       WHERE id = $4`,
      [feesTotal, feesPaid, feesPending, id]
    );

    return res.json({
      success: true,
      message: "Fees updated successfully",
      fees: {
        total: feesTotal,
        paid: feesPaid,
        pending: feesPending,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  submitAdmission,
  getAllAdmissions,
  getAdmissionById,
  searchByApplicationNumber,
  updateStatus,
  updateFees,
};

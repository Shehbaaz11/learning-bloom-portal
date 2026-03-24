const { db } = require('../config/db');

// POST - Submit Admission Form
const submitAdmission = (req, res) => {
  console.log('📥 New Admission Received:', req.body);

  const {
    studentName,
    studentPhone,
    dateOfBirth,
    parentName,
    parentPhone,
    parentOccupation,
    existingSchool,
    busRequired,
    address
  } = req.body;

  // Validation
  if (!studentName || !studentPhone || !dateOfBirth || !parentName ||
    !parentPhone || !parentOccupation || !existingSchool || !busRequired || !address) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  const query = `
    INSERT INTO admission_forms 
      (student_name, student_phone, date_of_birth, parent_name, 
       parent_phone, parent_occupation, existing_school, bus_required, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    studentName, studentPhone, dateOfBirth, parentName,
    parentPhone, parentOccupation, existingSchool, busRequired, address
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('❌ DB Error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    console.log('✅ Saved to MySQL! Application ID:', result.insertId);

    return res.status(201).json({
      success: true,
      message: 'Admission form submitted successfully!',
      applicationId: result.insertId
    });
  });
};

// GET - Saari Applications
const getAllAdmissions = (req, res) => {
  const query = `SELECT * FROM admission_forms ORDER BY created_at DESC`;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    return res.json({ success: true, data: results });
  });
};

// GET - Single Application by ID
const getAdmissionById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM admission_forms WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    return res.json({ success: true, data: result[0] });
  });
};

module.exports = { submitAdmission, getAllAdmissions, getAdmissionById };
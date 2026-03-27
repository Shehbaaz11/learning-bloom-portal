const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');

router.post('/', admissionController.submitAdmission);
router.get('/', admissionController.getAllAdmissions);
router.get('/search/:appNumber', admissionController.searchByApplicationNumber);
router.get('/:id', admissionController.getAdmissionById);
router.patch('/:id/status', admissionController.updateStatus);
router.patch('/:id/fees', admissionController.updateFees);

module.exports = router;
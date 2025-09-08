const express = require('express');
const router = express.Router();
const paintingRSSMController = require('../controllers/paintingRSSMController');

// Create a new registration
router.post('/create_paint', paintingRSSMController.createRegistration);

// Get all registrations with pagination, filters, search, sorting
router.get('/get_paint', paintingRSSMController.getAllRegistrations);

// Get all registrations without pagination/filters
router.get('/nopagination', paintingRSSMController.getAllRegistrationsNoPagination);

// Get registration summary by ageGroup
router.get('/summarybyagegroup', paintingRSSMController.getregsummarybyagegroup);

// Get registration summary by paintingType
router.get('/summarybypaintingtype', paintingRSSMController.getregsummarybyagegroup);

// Get registration by ID
router.get('/get_paint/:id', paintingRSSMController.getRegistrationById);

// Update registration by ID
router.put('/update_paint/:id', paintingRSSMController.updateRegistration);

// Delete registration by ID
router.delete('/delete/:id', paintingRSSMController.deleteRegistration);

module.exports = router; 
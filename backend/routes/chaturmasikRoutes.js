const express = require('express');
const router = express.Router();
const controller = require('../controllers/chaturmasikController');

// Create a new registration
router.post('/', controller.createRegistration);

// Get all registrations with pagination and filters
router.get('/allchaturmasikreg', controller.getAllRegistrations);

// Get registration summary / stats
router.get('/summary', controller.getregsummary);

// Get all registrations without pagination
router.get('/allregistrations', controller.getAllRegistrationsNoPagination);

// Get registration by ID
router.get('/:id', controller.getRegistrationById);

// Update registration by ID
router.put('/:id', controller.updateRegistration);

// Delete registration by ID
router.delete('/:id', controller.deleteRegistration);

module.exports = router;

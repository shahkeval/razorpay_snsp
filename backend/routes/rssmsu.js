const express = require('express');
const router = express.Router();
const controller = require('../controllers/rssmsuController');




// Create a new registration
router.post('/', controller.createRegistration);

// Get all registrations
router.get('/allrssmreg', controller.getAllRegistrations);
router.get('/rsummary', controller.getregsummary);
// Get registrarions without pagination and filters
router.get('/allregistartions',controller.getAllRegistrationsNoPagination);
// Update a registration by ID
router.put('/:id', controller.updateRegistration);

// Delete a registration by ID
router.delete('/:id', controller.deleteRegistration);

// Get registration by ID
router.get('/:id', controller.getRegistrationById);




module.exports = router; 
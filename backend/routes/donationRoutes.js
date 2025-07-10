const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

// CRUD routes for donation management
router.get('/', donationController.getDonations); // List with filters/search
router.post('/', donationController.createDonation);
router.put('/:id', donationController.updateDonation);
router.delete('/:id', donationController.deleteDonation);

// Dashboard summary
router.get('/summary', donationController.getDonationSummary);

module.exports = router; 
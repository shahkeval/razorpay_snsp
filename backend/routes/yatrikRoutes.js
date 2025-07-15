const express = require('express');
const router = express.Router();
const yatrikController = require('../controllers/yatrikController');

// Get all Yatrik records
router.get('/getallyatrik', yatrikController.getAllYatriks);

// Get a single Yatrik by ID
router.get('/getyatrik/:id', yatrikController.getYatrikById);

// Update a Yatrik by ID
router.put('/updateyatrik/:id', yatrikController.updateYatrik);

// Delete a Yatrik by ID
router.delete('/deleteyatrik/:id', yatrikController.deleteYatrik);

// Get summary of Yatrik records
router.get('/summary', yatrikController.getYatrikSummary);

// Get Yatrik howToReachPalitana summary
router.get('/howtoreach-summary', yatrikController.getYatrikHowToReachSummary);

// Payment Link flow
router.post('/create-payment-link', yatrikController.createPaymentLink);
router.post('/razorpay-webhook', yatrikController.razorpayWebhook);
router.get('/verify-payment', yatrikController.verifyPayment); // Accepts yatrikNo or orderId as query param

// Get all Payment records with filters and pagination
router.get('/allpayments', yatrikController.getAllPayments);

// Get summary of paid and unpaid Yatrik records
router.get('/payment-status-summary', yatrikController.getYatrikPaymentStatusSummary);

module.exports = router; 
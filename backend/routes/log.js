const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

// Create a new log entry
router.post('/create-log', logController.createLog);
router.post('/create-webhook', logController.create_webhhok);

module.exports = router; 
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/gallery/day-1', authController.getDay1GalleryImages);

module.exports = router; 
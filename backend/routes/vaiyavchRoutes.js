const express = require('express');
const router = express.Router();
const vaiyavachiController = require('../controllers/vaiyavachiController');

// Create Vaiyavachi with image upload
router.post('/createvaiyavachi', vaiyavachiController.createVaiyavachi);

// Get all Vaiyavachis
router.get('/getvaiyavchi', vaiyavachiController.getAllVaiyavachis);

// Get Vaiyavachi by ID
router.get('/getvaiyavachi/:id', vaiyavachiController.getVaiyavachiById);

// Update Vaiyavachi by ID
router.put('/updatevaiyavachi/:id', vaiyavachiController.updateVaiyavachi);

// Delete Vaiyavachi by ID
router.delete('/deletevaiyavachi/:id', vaiyavachiController.deleteVaiyavachi);

// Get Vaiyavachi summary
router.get('/vaiyavachisummary', vaiyavachiController.getVaiyavachiSummary);

module.exports = router;


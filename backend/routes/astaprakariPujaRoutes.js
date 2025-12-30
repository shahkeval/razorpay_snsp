const express = require("express");
const router = express.Router();
const astapController = require("../controllers/astaprakaripujaController");

// Payment Link flow for Astaprakari Puja
router.post("/create-payment-link", astapController.createPaymentLink);
router.post("/razorpay-webhook", astapController.razorpayWebhook);
router.get("/verify-payment", astapController.verifyPayment); // Accepts yatrikNo or orderId as query param

router.get("/getall_astaprakari_puja", astapController.getAllAstaprakariPuja);
router.get("/getHowtoreachSummary",astapController.getHowToReachSummary);
router.get("/getAstaprakariExcel",astapController.fetchAstaprakariForExcel);
module.exports = router;

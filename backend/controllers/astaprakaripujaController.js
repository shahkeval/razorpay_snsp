const Astaprakari = require("../models/astaprakari_puja-26");
const Payment = require("../models/Payment");
const path = require("path");
const multer = require("multer");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const fs = require("fs");

// Multer storage config for astaprakari photo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../upload/astaprakari_puja_26"));
  },
  filename: async function (req, file, cb) {
    try {
      const ext = path.extname(file.originalname);
      // Find the highest NY26-#### number
      const last = await Astaprakari.findOne({
        yatrikNo: { $regex: /^NY26-\d{4}$/ },
      }).sort({ createdAt: -1 });
      let nextNumber = 1;
      if (last && last.yatrikNo) {
        const match = last.yatrikNo.match(/NY26-(\d{4})/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
      }
      const filename = `ASTAPRAKARI-${nextNumber}${ext}`;
      cb(null, filename);
    } catch (err) {
      cb(null, `ASTAPRAKARI-${Date.now()}${path.extname(file.originalname)}`);
    }
  },
});

// Multer with higher fieldSize for base64 in createPaymentLink
const uploadLargeField = multer({
  storage,
  limits: { fieldSize: 10 * 1024 * 1024 },
});

// Helper to save base64 image
async function saveBase64Image(base64String, folderPath, filename) {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 image string");
  const ext = matches[1].split("/")[1];
  const buffer = Buffer.from(matches[2], "base64");
  const filePath = path.join(folderPath, filename + `.${ext}`);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/astaprakari/${filename}.${ext}`;
}

// 1. Create Razorpay Payment Link and store Astaprakari + Payment
exports.createPaymentLink = [
  async (req, res, next) => {
    if (
      req.headers["content-type"] &&
      req.headers["content-type"].includes("multipart/form-data")
    ) {
      uploadLargeField.single("yatrikPhoto")(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    try {
      const {
        name,
        mobileNumber,
        whatsappNumber,
        emailAddress,
        education,
        religiousEducation,
        weight,
        height,
        dob,
        address,
        city,
        state,
        familyMemberName,
        relation,
        familyMemberWANumber,
        emergencyNumber,
        howToReachPalitana,
        isActive,
        isPaid,
        isConfoirmSeat,
        yatrikPhoto,
      } = req.body;

      // Ensure photo present either as file or base64
      if (
        !req.file &&
        !(yatrikPhoto && yatrikPhoto.startsWith("data:image/"))
      ) {
        return res.status(400).json({ message: "Photo is required." });
      }

      // Save Astaprakari registration (temporary yatrikPhoto empty)
      const newRecord = new Astaprakari({
        name,
        mobileNumber,
        whatsappNumber,
        emailAddress,
        education,
        religiousEducation,
        weight,
        height,
        dob,
        address,
        city,
        state,
        familyMemberName,
        relation,
        familyMemberWANumber,
        emergencyNumber,
        howToReachPalitana,
        isActive: typeof isActive !== "undefined" ? isActive : true,
        isPaid: isPaid || "unpaid",
        isConfoirmSeat:
          typeof isConfoirmSeat !== "undefined" ? isConfoirmSeat : true,
        yatrikPhoto: "",
      });

      await newRecord.save();

      const yatrikNo = newRecord.yatrikNo;
      let photoPath = "";
      const folderPath = path.join(__dirname, "../upload/astaprakari_puja_26");

      // Ensure folder exists
      await fs.promises.mkdir(folderPath, { recursive: true });

      if (req.file) {
        const ext = path.extname(req.file.originalname);
        const newFileName = `${yatrikNo}${ext}`;
        const newFilePath = path.join(folderPath, newFileName);
        await fs.promises.rename(req.file.path, newFilePath);
        photoPath = `/uploads/astaprakari/${newFileName}`;
      } else if (yatrikPhoto && yatrikPhoto.startsWith("data:image/")) {
        const matches = yatrikPhoto.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error("Invalid base64 image string");
        const ext = matches[1].split("/")[1];
        const fileName = `${yatrikNo}.${ext}`;
        const filePath = path.join(folderPath, fileName);
        const buffer = Buffer.from(matches[2], "base64");
        await fs.promises.writeFile(filePath, buffer);
        photoPath = `/uploads/astaprakari/${fileName}`;
      }

      if (photoPath) {
        newRecord.yatrikPhoto = photoPath;
        await newRecord.save();
      }

      // Create Razorpay Payment Link
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const expireBy = Math.floor((Date.now() + 16 * 60 * 1000) / 1000);
      const paymentLink = await razorpay.paymentLink.create({
        amount: 20000, // Rs. 500.00 in paise - change if needed
        currency: "INR",
        accept_partial: false,
        description: "Donation for Astaprakari Puja",
        customer: {
          name,
          email: emailAddress,
          contact: mobileNumber,
        },
        notify: { sms: true, email: true },
        callback_url: process.env.PAYMENT_CALLBACK_URL_astaprakari,
        callback_method: "get",
        reference_id: newRecord._id.toString(),
        expire_by: expireBy,
        notes: { yatrikNo: newRecord.yatrikNo },
      });
      console.log(
        "Callback URL:",
        process.env.PAYMENT_CALLBACK_URL_astaprakari
      );
      // Store Payment record
      newRecord.paymentLink = paymentLink.short_url;
      await newRecord.save();

      const payment = new Payment({
        yatrikNo: newRecord.yatrikNo,
        orderId: paymentLink.id,
        paymentId: paymentLink.payment_id || "",
        signature: "",
        amount: 500,
        currency: "INR",
        status: "created",
        link: paymentLink.short_url,
      });

      await payment.save();

      res.json({
        paymentLink: paymentLink.short_url,
        yatrikNo: newRecord.yatrikNo,
        orderId: paymentLink.id,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

// 2. Razorpay Webhook for payment status
exports.razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    if (event === "payment_link.paid") {
      const paymentLinkId = req.body.payload.payment_link.entity.id;
      const paymentId = req.body.payload.payment.entity.id;
      const paymentSignature = signature;

      const payment = await Payment.findOneAndUpdate(
        { orderId: paymentLinkId },
        {
          status: "paid",
          paymentId,
          signature: paymentSignature,
          paymentCompletedAt: new Date(),
        },
        { new: true }
      );

      if (payment && payment.yatrikNo) {
        await Astaprakari.findOneAndUpdate(
          { yatrikNo: payment.yatrikNo },
          { isPaid: "paid" }
        );
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Verify payment status (frontend polling after redirect)
exports.verifyPayment = async (req, res) => {
  try {
    const { yatrikNo, orderId } = req.query;
    let payment;
    if (orderId) payment = await Payment.findOne({ orderId });
    else if (yatrikNo) payment = await Payment.findOne({ yatrikNo });

    if (!payment) return res.status(404).json({ status: "not_found" });

    if (payment.status === "paid") {
      if (payment.yatrikNo) {
        await Astaprakari.updateOne(
          { yatrikNo: payment.yatrikNo },
          { isPaid: "paid" }
        );
      }
      return res.json({ status: "paid", No: payment.yatrikNo });
    }

    // Fetch from Razorpay if not paid
    let razorpayRes;
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      razorpayRes = await razorpay.paymentLink.fetch(orderId);
    } catch (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Razorpay fetch failed" });
    }

    if (razorpayRes.status === "paid") {
      payment.status = "paid";
      payment.amount = "5000";
      payment.method = razorpayRes.payment
        ? razorpayRes.payment.method
        : payment.method;
      payment.razorpayDetails = razorpayRes;
      payment.paidAt = razorpayRes.paid_at
        ? new Date(razorpayRes.paid_at * 1000)
        : new Date();
      payment.paymentId =
        razorpayRes.razorpay_payment_id ||
        (razorpayRes.payment ? razorpayRes.payment.id : payment.paymentId);
      payment.signature = razorpayRes.razorpay_signature || payment.signature;
      payment.paymentCompletedAt = razorpayRes.paid_at
        ? new Date(razorpayRes.paid_at * 1000)
        : new Date();
      await payment.save();

      if (payment.yatrikNo) {
        await Astaprakari.updateOne(
          { yatrikNo: payment.yatrikNo },
          { isPaid: "paid" }
        );
      }

      return res.json({ status: "paid", No: payment.yatrikNo });
    }

    return res.json({ status: razorpayRes.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

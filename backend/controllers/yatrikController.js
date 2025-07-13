const Yatrik = require('../models/7jatrayatrik-25');
const Payment = require('../models/Payment');
const path = require('path');
const multer = require('multer');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Multer storage config for yatrik photo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/7-jatra-yatrik'));
    },
    filename: async function (req, file, cb) {
        try {
            const ext = path.extname(file.originalname);
            // Find the highest yatrikNo in the database
            const highestYatrik = await Yatrik.findOne().sort({ yatrikNo: -1 });
            let nextNumber = 1;
            if (highestYatrik && highestYatrik.yatrikNo) {
                const match = highestYatrik.yatrikNo.match(/yatrik-(\d+)/i);
                if (match) {
                    nextNumber = parseInt(match[1], 10) + 1;
                }
            }
            const filename = `YATRIK-${nextNumber}${ext}`;
            cb(null, filename);
        } catch (err) {
            // fallback to timestamp if error
            cb(null, `YATRIK-${Date.now()}${path.extname(file.originalname)}`);
        }
    }
});
const upload = multer({ storage });

// 1. Create Razorpay Payment Link and store Yatrik + Payment
exports.createPaymentLink = [
  upload.single('yatrikPhoto'),
  async (req, res) => {
    try {
      // Extract registration fields
      const {
        name, mobileNumber, whatsappNumber, emailAddress, education, religiousEducation, weight, height, dob, address, city, state,
        familyMemberName, relation, familyMemberWANumber, emergencyNumber, is7YatraDoneEarlier, earlier7YatraCounts, howToReachPalitana, yatrikConfirmation, familyConfirmation
      } = req.body;
      // Save Yatrik registration (isPaid: 'unpaid')
      const yatrikPhotoPath = req.file ? `/7-jatra-yatrik/${req.file.filename}` : '';
      const newYatrik = new Yatrik({
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
        is7YatraDoneEarlier,
        earlier7YatraCounts,
        howToReachPalitana,
        yatrikConfirmation,
        familyConfirmation,
        yatrikPhoto: yatrikPhotoPath,
        isPaid: 'unpaid',
      });
      await newYatrik.save();
      // Create Razorpay Payment Link
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const paymentLink = await razorpay.paymentLink.create({
        amount: 50000, // Rs. 500.00 in paise
        currency: 'INR',
        accept_partial: false,
        description: '7 Yatra 2025 Registration',
        customer: {
          name,
          email: emailAddress,
          contact: mobileNumber,
        },
        notify: {
          sms: true,
          email: true,
        },
        callback_url: process.env.PAYMENT_CALLBACK_URL, // e.g. https://yourdomain.com/payment-redirect
        callback_method: 'get',
        reference_id: newYatrik._id.toString(),
      });
      // Store Payment record
      newYatrik.paymentLink = paymentLink.short_url;
      await newYatrik.save();
      const payment = new Payment({
        yatrikNo: newYatrik.yatrikNo,
        orderId: paymentLink.id,
        paymentId: paymentLink.payment_id || '',
        signature: '',
        amount: 500,
        currency: 'INR',
        status: 'created',
        link: paymentLink.short_url,
      });
      await payment.save();
      // Return payment link to frontend
      res.json({ paymentLink: paymentLink.short_url, yatrikNo: newYatrik.yatrikNo, orderId: paymentLink.id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// 2. Razorpay Webhook for payment status
exports.razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (signature !== expectedSignature) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }
  const event = req.body.event;
  if (event === 'payment_link.paid') {
    const paymentLinkId = req.body.payload.payment_link.entity.id;
    const paymentId = req.body.payload.payment.entity.id;
    const paymentSignature = signature;
    // Update Payment and Yatrik
    const payment = await Payment.findOneAndUpdate(
      { orderId: paymentLinkId },
      { status: 'paid', paymentId, signature: paymentSignature, paymentCompletedAt: new Date() },
      { new: true }
    );
    if (payment) {
      await Yatrik.findOneAndUpdate(
        { yatrikNo: payment.yatrikNo },
        { isPaid: 'paid' }
      );
    }
  }
  res.json({ status: 'ok' });
};

// 3. Verify payment status (frontend polling after redirect)
exports.verifyPayment = async (req, res) => {
  try {
    const { yatrikNo, orderId } = req.query;
    let payment;
    if (orderId) {
      payment = await Payment.findOne({ orderId });
    } else if (yatrikNo) {
      payment = await Payment.findOne({ yatrikNo });
    }
    if (!payment) return res.status(404).json({ status: 'not_found' });
    if (payment.status === 'paid') {
      // Only update isPaid field in Yatrik collection
      if (payment.yatrikNo) {
        await Yatrik.updateOne(
          { yatrikNo: payment.yatrikNo },
          { isPaid: 'paid' }
        );
      }
      return res.json({ status: 'paid' });
    }
    // If not paid, check Razorpay directly
    let razorpayRes;
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      razorpayRes = await razorpay.paymentLink.fetch(orderId);
    } catch (err) {
      return res.status(500).json({ status: 'error', message: 'Razorpay fetch failed' });
    }
    if (razorpayRes.status === 'paid') {
      // Update existing Payment record with all details
      payment.status = 'paid';
      payment.amount = '500';
      payment.method = razorpayRes.payment ? razorpayRes.payment.method : payment.method;
      payment.razorpayDetails = razorpayRes;
      payment.paidAt = razorpayRes.paid_at ? new Date(razorpayRes.paid_at * 1000) : new Date();
      // Save paymentId and signature if available
      payment.paymentId = razorpayRes.razorpay_payment_id || (razorpayRes.payment ? razorpayRes.payment.id : payment.paymentId);
      payment.signature = razorpayRes.razorpay_signature || payment.signature;
      // Save paymentCompletedAt
      payment.paymentCompletedAt = razorpayRes.paid_at ? new Date(razorpayRes.paid_at * 1000) : new Date();
      await payment.save();
      // Only update isPaid field in Yatrik collection
      if (payment.yatrikNo) {
        await Yatrik.updateOne(
          { yatrikNo: payment.yatrikNo },
          { isPaid: 'paid' }
        );
      }
      return res.json({ status: 'paid' });
    }
    // Not paid yet, return current status
    return res.json({ status: razorpayRes.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Yatrik records with pagination, search, sorting, and filtering
exports.getAllYatriks = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc',
            search = '',
            ...filters
        } = req.query;

        let filter = {};
        // Build filter for each field
        Object.keys(filters).forEach(key => {
            if (filters[key] && !['page', 'limit', 'sortBy', 'order', 'search'].includes(key)) {
                // Special handling for boolean fields
                if ([
                    'is7YatraDoneEarlier',
                    'yatrikConfirmation',
                    'familyConfirmation'
                ].includes(key)) {
                    const val = String(filters[key]).toLowerCase();
                    if (val === 'true' || val === 'false') {
                        filter[key] = (val === 'true');
                    } else {
                        // fallback to regex for partial search (e.g. 't' or 'f')
                        filter[key] = { $regex: filters[key], $options: 'i' };
                    }
                } else {
                    filter[key] = { $regex: filters[key], $options: 'i' }; // Case-insensitive search
                }
            }
        });

        // Global search
        if (search) {
            filter.$or = [
                { yatrikNo: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } },
                { whatsappNumber: { $regex: search, $options: 'i' } },
                { emailAddress: { $regex: search, $options: 'i' } },
                { education: { $regex: search, $options: 'i' } },
                { religiousEducation: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } },
                { familyMemberName: { $regex: search, $options: 'i' } },
                { relation: { $regex: search, $options: 'i' } },
                { familyMemberWANumber: { $regex: search, $options: 'i' } },
                { emergencyNumber: { $regex: search, $options: 'i' } },
                { howToReachPalitana: { $regex: search, $options: 'i' } },
                { transactionNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Yatrik.countDocuments(filter);
        const yatriks = await Yatrik.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ yatriks, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single Yatrik record by ID
exports.getYatrikById = async (req, res) => {
    try {
        const yatrik = await Yatrik.findById(req.params.id);
        if (!yatrik) return res.status(404).json({ message: 'Yatrik not found' });
        res.status(200).json(yatrik);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a Yatrik record by ID
exports.updateYatrik = async (req, res) => {
    try {
        const updatedYatrik = await Yatrik.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedYatrik) return res.status(404).json({ message: 'Yatrik not found' });
        res.status(200).json(updatedYatrik);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a Yatrik record by ID
exports.deleteYatrik = async (req, res) => {
    try {
        const deletedYatrik = await Yatrik.findByIdAndDelete(req.params.id);
        if (!deletedYatrik) return res.status(404).json({ message: 'Yatrik not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get summary of Yatrik records (total, old category, new category)
exports.getYatrikSummary = async (req, res) => {
    try {
        const totalRecords = await Yatrik.countDocuments();
        const oldCategoryCount = await Yatrik.countDocuments({ is7YatraDoneEarlier: 'yes' });
        const newCategoryCount = await Yatrik.countDocuments({ is7YatraDoneEarlier: 'no' });
        res.status(200).json({
            totalRecords,
            oldCategoryCount,
            newCategoryCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
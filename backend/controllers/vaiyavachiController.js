const path = require('path');
const multer = require('multer');
const Vaiyavachi = require('../models/7jatravaiyavachi-25');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const fs = require('fs');

// Multer storage config for vaiyavachi image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../upload/7_jatra_viyavach_2025'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `VAIYAVACHI-${Date.now()}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });
// Multer with higher fieldSize for base64 in createPaymentLink
const uploadLargeField = multer({ storage, limits: { fieldSize: 10 * 1024 * 1024 } });

// Helper to save base64 image
async function saveBase64Image(base64String, folderPath, prefix = 'VAIYAVACHI') {
  // base64String: data:image/png;base64,....
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 image string');
  const ext = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${prefix}-${Date.now()}.${ext}`;
  const filePath = path.join(folderPath, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/vaiyavach/${filename}`;
}

// Create a new Vaiyavachi record with image upload (multer only)
exports.createVaiyavachi = [
    upload.single('vaiyavachiImage'),
    async (req, res) => {
        try {
            const vaiyavachiImagePath = req.file ? `/uploads/vaiyavach/${req.file.filename}` : '';
            const body = req.body;
            const vaiyavachi = new Vaiyavachi({
                ...body,
                vaiyavachiImage: vaiyavachiImagePath
            });
            await vaiyavachi.save();
            res.status(201).json(vaiyavachi);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
];

// 1. Create Razorpay Payment Link and store Vaiyavachi + Payment
exports.createPaymentLink = [
  async (req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      uploadLargeField.single('vaiyavachiImage')(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    try {
      // Extract registration fields
      const {
        name, mobileNumber, whatsappNumber, emailAddress, education, religiousEducation, weight, height, dob, address, city, state,
        familyMemberName, relation, familyMemberWANumber, emergencyNumber, is7YatraDoneEarlier, haveYouDoneVaiyavachEarlier, howToReachPalitana, howManyDaysJoin, typeOfVaiyavach, valueOfVaiyavach, vaiyavachiConfirmation, familyConfirmation, vaiyavachiImage
      } = req.body;
      // Save Vaiyavachi registration (isPaid: 'unpaid', no image yet)
      const newVaiyavachi = new Vaiyavachi({
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
        haveYouDoneVaiyavachEarlier,
        howToReachPalitana,
        howManyDaysJoin,
        typeOfVaiyavach,
        valueOfVaiyavach,
        vaiyavachiConfirmation,
        familyConfirmation,
        isPaid: 'unpaid',
      });
      await newVaiyavachi.save();
      // Now get vaiyavachNo
      const vaiyavachNo = newVaiyavachi.vaiyavachNo;
      let vaiyavachiImagePath = '';
      const folderPath = path.join(__dirname, '../upload/7_jatra_viyavach_2025');
      if (req.file) {
        // Rename uploaded file to match vaiyavachNo
        const ext = path.extname(req.file.originalname);
        const newFileName = `${vaiyavachNo}${ext}`;
        const newFilePath = path.join(folderPath, newFileName);
        await fs.promises.rename(req.file.path, newFilePath);
        vaiyavachiImagePath = `/uploads/vaiyavach/${newFileName}`;
      } else if (vaiyavachiImage && vaiyavachiImage.startsWith('data:image/')) {
        // Save base64 image with vaiyavachNo
        const matches = vaiyavachiImage.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error('Invalid base64 image string');
        const ext = matches[1].split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `${vaiyavachNo}.${ext}`;
        const filePath = path.join(folderPath, fileName);
        await fs.promises.writeFile(filePath, buffer);
        vaiyavachiImagePath = `/uploads/vaiyavach/${fileName}`;
      }
      // Update document with image path
      if (vaiyavachiImagePath) {
        newVaiyavachi.vaiyavachiImage = vaiyavachiImagePath;
        await newVaiyavachi.save();
      }
      // Create Razorpay Payment Link
      // console.log('Creating Razorpay payment link for Vaiyavachi:', newVaiyavachi);
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const expireBy = Math.floor(Date.now() / 1000) + 16 * 60; // 16 minutes from now (buffer for server time skew)
      const paymentLink = await razorpay.paymentLink.create({
        amount: 50000, // Rs. 500.00 in paise
        currency: 'INR',
        accept_partial: false,
        description: 'Donation for 7 Yatra',
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
        reference_id: newVaiyavachi._id.toString(),
        expire_by: expireBy, // <-- 16 minute expiry (buffered)
        notes: {
          vaiyavachNo: newVaiyavachi.vaiyavachNo
        },
      });
      // Store Payment record
      // console.log(paymentLink)
      newVaiyavachi.paymentLink = paymentLink.short_url;
      await newVaiyavachi.save();
      const payment = new Payment({
        vaiyavachiNo: newVaiyavachi.vaiyavachNo,
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
      res.json({ paymentLink: paymentLink.short_url, vaiyavachNo: newVaiyavachi.vaiyavachNo, orderId: paymentLink.id });
    } catch (error) {
      console.error('Vaiyavach payment link error:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
];

// 2. Razorpay Webhook for payment status (Vaiyavach)
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
    // Update Payment and Vaiyavachi
    const payment = await Payment.findOneAndUpdate(
      { orderId: paymentLinkId },
      { status: 'paid', paymentId, signature: paymentSignature, paymentCompletedAt: new Date() },
      { new: true }
    );
    if (payment) {
      await Vaiyavachi.findOneAndUpdate(
        { vaiyavachNo: payment.vaiyavachiNo },
        { isPaid: 'paid' }
      );
    }
  }
  res.json({ status: 'ok' });
};

// 3. Verify payment status (frontend polling after redirect)
exports.verifyPayment = async (req, res) => {
  try {
    const { vaiyavachNo, orderId } = req.query;
    let payment;
    if (orderId) {
      payment = await Payment.findOne({ orderId });
    } else if (vaiyavachNo) {
      payment = await Payment.findOne({ vaiyavachiNo: vaiyavachNo });
    }
    if (!payment) return res.status(404).json({ status: 'not_found' });
    if (payment.status === 'paid') {
      // Only update isPaid field in Vaiyavachi collection
      if (payment.vaiyavachiNo) {
        await Vaiyavachi.updateOne(
          { vaiyavachNo: payment.vaiyavachiNo },
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
      payment.amount = '5000';
      payment.method = razorpayRes.payment ? razorpayRes.payment.method : payment.method;
      payment.razorpayDetails = razorpayRes;
      payment.paidAt = razorpayRes.paid_at ? new Date(razorpayRes.paid_at * 1000) : new Date();
      // Save paymentId and signature if available
      payment.paymentId = razorpayRes.razorpay_payment_id || (razorpayRes.payment ? razorpayRes.payment.id : payment.paymentId);
      payment.signature = razorpayRes.razorpay_signature || payment.signature;
      // Save paymentCompletedAt
      payment.paymentCompletedAt = razorpayRes.paid_at ? new Date(razorpayRes.paid_at * 1000) : new Date();
      await payment.save();
      // Only update isPaid field in Vaiyavachi collection
      if (payment.vaiyavachiNo) {
        await Vaiyavachi.updateOne(
          { vaiyavachNo: payment.vaiyavachiNo },
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

// Get all Vaiyavachi records with pagination, search, sorting, and filtering
exports.getAllVaiyavachis = async (req, res) => {
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
                filter[key] = { $regex: filters[key], $options: 'i' }; // Case-insensitive search
            }
        });

        // Global search
        if (search) {
            filter.$or = [
                { vaiyavachNo: { $regex: search, $options: 'i' } },
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
                { transactionNumber: { $regex: search, $options: 'i' } },
                { typeOfVaiyavach: { $regex: search, $options: 'i' } },
                { valueOfVaiyavach: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Vaiyavachi.countDocuments(filter);
        const vaiyavachis = await Vaiyavachi.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ vaiyavachis, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single Vaiyavachi record by ID
exports.getVaiyavachiById = async (req, res) => {
    try {
        const vaiyavachi = await Vaiyavachi.findById(req.params.id);
        if (!vaiyavachi) return res.status(404).json({ message: 'Vaiyavachi not found' });
        res.status(200).json(vaiyavachi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a Vaiyavachi record by ID
exports.updateVaiyavachi = async (req, res) => {
    try {
        const updatedVaiyavachi = await Vaiyavachi.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedVaiyavachi) return res.status(404).json({ message: 'Vaiyavachi not found' });
        res.status(200).json(updatedVaiyavachi);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a Vaiyavachi record by ID
exports.deleteVaiyavachi = async (req, res) => {
    try {
        const deletedVaiyavachi = await Vaiyavachi.findByIdAndDelete(req.params.id);
        if (!deletedVaiyavachi) return res.status(404).json({ message: 'Vaiyavachi not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get summary of Vaiyavachi records (total, done earlier, not done earlier)
exports.getVaiyavachiSummary = async (req, res) => {
    try {
        const totalRecords = await Vaiyavachi.countDocuments();
        const twoDaysCount = await Vaiyavachi.countDocuments({ howManyDaysJoin: '2' });
        const fourDaysCount = await Vaiyavachi.countDocuments({ howManyDaysJoin: '4' });
        res.status(200).json({
            totalRecords,
            twoDaysCount,
            fourDaysCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Endpoint: GET /api/vaiyavach/type-value-counts
exports.getTypeValueCounts = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { type: "$typeOfVaiyavach", value: "$valueOfVaiyavach" },
          count: { $sum: 1 }
        }
      }
    ];
    const results = await Vaiyavachi.aggregate(pipeline);
    // Format result as { type: { value: count } }
    const counts = {};
    results.forEach(({ _id, count }) => {
      const { type, value } = _id;
      if (!counts[type]) counts[type] = {};
      counts[type][value] = count;
    });
    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New summary endpoint for howToReachPalitana and typeOfVaiyavach
exports.getVaiyavachiTypeSummary = async (req, res) => {
    try {
        // How to reach Palitana
        const withUsCount = await Vaiyavachi.countDocuments({ howToReachPalitana: 'with_us' });
        const directPalitanaCount = await Vaiyavachi.countDocuments({ howToReachPalitana: 'direct_palitana' });
        // Type of Vaiyavach
        const spotCount = await Vaiyavachi.countDocuments({ typeOfVaiyavach: 'spot' });
        const roammingCount = await Vaiyavachi.countDocuments({ typeOfVaiyavach: 'roamming' });
        const chaityavandanCount = await Vaiyavachi.countDocuments({ typeOfVaiyavach: 'chaityavandan' });
        res.status(200).json({
            howToReachPalitana: {
                with_us: withUsCount,
                direct_palitana: directPalitanaCount
            },
            typeOfVaiyavach: {
                spot: spotCount,
                roamming: roammingCount,
                chaityavandan: chaityavandanCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get summary of paid and unpaid Vaiyavach records
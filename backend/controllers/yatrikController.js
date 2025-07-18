const Yatrik = require('../models/7jatrayatrik-25');
const Payment = require('../models/Payment');
const Vaiyavachi = require('../models/7jatravaiyavachi-25');
const path = require('path');
const multer = require('multer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const fs = require('fs');

// Multer storage config for yatrik photo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../upload/7_jatra_yatriks_2025'));
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

// Helper to save base64 image
async function saveBase64Image(base64String, folderPath, prefix = 'YATRIK') {
  // base64String: data:image/png;base64,....
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 image string');
  const ext = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `${prefix}-${Date.now()}.${ext}`;
  const filePath = path.join(folderPath, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/yatrik/${filename}`;
}

// Multer with higher fieldSize for base64 in createPaymentLink
const uploadLargeField = multer({ storage, limits: { fieldSize: 10 * 1024 * 1024 } });

// 1. Create Razorpay Payment Link and store Yatrik + Payment
exports.createPaymentLink = [
  async (req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      uploadLargeField.single('yatrikPhoto')(req, res, next);
    } else {
      next();
    }
  },
  async (req, res) => {
    try {
      // Extract registration fields
      const {
        name, mobileNumber, whatsappNumber, emailAddress, education, religiousEducation, weight, height, dob, address, city, state,
        familyMemberName, relation, familyMemberWANumber, emergencyNumber, is7YatraDoneEarlier, earlier7YatraCounts, howToReachPalitana, yatrikConfirmation, familyConfirmation, yatrikPhoto
      } = req.body;
      // Check for image presence
      if (!req.file && !(yatrikPhoto && yatrikPhoto.startsWith('data:image/'))) {
        return res.status(400).json({ message: 'Yatrik photo is required.' });
      }
      // Save Yatrik registration (isPaid: 'unpaid', no image yet)
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
        yatrikPhoto: '', // Temporary value to pass validation
        isPaid: 'unpaid',
      });
      await newYatrik.save();
      // Now get yatrikNo
      const yatrikNo = newYatrik.yatrikNo;
      let yatrikPhotoPath = '';
      const folderPath = path.join(__dirname, '../upload/7_jatra_yatriks_2025');
      if (req.file) {
        // Rename uploaded file to match yatrikNo
        const ext = path.extname(req.file.originalname);
        const newFileName = `${yatrikNo}${ext}`;
        const newFilePath = path.join(folderPath, newFileName);
        await fs.promises.rename(req.file.path, newFilePath);
        yatrikPhotoPath = `/uploads/yatrik/${newFileName}`;
      } else if (yatrikPhoto && yatrikPhoto.startsWith('data:image/')) {
        // Save base64 image with yatrikNo
        const matches = yatrikPhoto.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error('Invalid base64 image string');
        const ext = matches[1].split('/')[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `${yatrikNo}.${ext}`;
        const filePath = path.join(folderPath, fileName);
        await fs.promises.writeFile(filePath, buffer);
        yatrikPhotoPath = `/uploads/yatrik/${fileName}`;
      }
      // Update document with image path
      if (yatrikPhotoPath) {
        newYatrik.yatrikPhoto = yatrikPhotoPath;
        await newYatrik.save();
      }
      // Create Razorpay Payment Link
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const expireBy = Math.floor((Date.now() + 16 * 60 * 1000) / 1000); // 16 minutes from now (buffer for server time skew)
      const paymentLink = await razorpay.paymentLink.create({
        amount: 1000, // Rs. 500.00 in paise
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
        reference_id: newYatrik._id.toString(),
        expire_by: expireBy, // <-- 16 minute expiry (buffered)
        notes: {
          yatrikNo: newYatrik.yatrikNo
        },
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
    console.log(`paymentlinkid: ${paymentLinkId}, paymentId: ${paymentId}, signature: ${paymentSignature}`);

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
    // console.log("1");
    const { yatrikNo, orderId } = req.query;
    let payment;
    if (orderId) {
      payment = await Payment.findOne({ orderId });
      // console.log("2");
    } else if (yatrikNo) {
      payment = await Payment.findOne({ yatrikNo });
      // console.log("3");
    }
    if (!payment) return res.status(404).json({ status: 'not_found' });
    if (payment.status === 'paid') {
      // Only update isPaid field in Yatrik collection
      // console.log("4");
      if (payment.yatrikNo) {
        // console.log("5");
        await Yatrik.updateOne(
          { yatrikNo: payment.yatrikNo },
          { isPaid: 'paid' }
        );
      }
      // console.log("6");
      return res.json({ status: 'paid' });
    }
    // If not paid, check Razorpay directly
    // console.log("7");
    let razorpayRes;
    try {
      // console.log("8");
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      // console.log("9");
      razorpayRes = await razorpay.paymentLink.fetch(orderId);
    } catch (err) {
      // console.log("10");
      return res.status(500).json({ status: 'error', message: 'Razorpay fetch failed' });
    }
    // console.log("11");
    if (razorpayRes.status === 'paid') {
      // Update existing Payment record with all details
      // console.log("12");
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
      // Only update isPaid field in Yatrik collection
      if (payment.yatrikNo) {
        // console.log("13");
        await Yatrik.updateOne(
          { yatrikNo: payment.yatrikNo },
          { isPaid: 'paid' }
        );
        // console.log("14");
      }
      return res.json({ status: 'paid' });
    }
    // console.log("15");
    // Not paid yet, return current status
    return res.json({ status: razorpayRes.status });
  } catch (error) {
    // console.log("16");
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

// New summary endpoint for howToReachPalitana (with_us, direct_palitana)
exports.getYatrikHowToReachSummary = async (req, res) => {
    try {
        const withUsCount = await Yatrik.countDocuments({ howToReachPalitana: 'with_us' });
        const directPalitanaCount = await Yatrik.countDocuments({ howToReachPalitana: 'direct_palitana' });
        res.status(200).json({
            with_us: withUsCount,
            direct_palitana: directPalitanaCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all Payment records with pagination, search, sorting, and filtering
exports.getAllPayments = async (req, res) => {
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
        // Special handling for mobileNumber filter
        let mobileNumberFilter = null;
        if (filters.mobileNumber) {
            mobileNumberFilter = filters.mobileNumber;
            delete filters.mobileNumber;
        }
        // Build filter for each field
        Object.keys(filters).forEach(key => {
            if (filters[key] && !['page', 'limit', 'sortBy', 'order', 'search'].includes(key)) {
                filter[key] = { $regex: filters[key], $options: 'i' }; // Case-insensitive search
            }
        });

        // Global search
        if (search) {
            filter.$or = [
                { yatrikNo: { $regex: search, $options: 'i' } },
                { vaiyavachiNo: { $regex: search, $options: 'i' } },
                { paymentLinkId: { $regex: search, $options: 'i' } },
                { orderId: { $regex: search, $options: 'i' } },
                { paymentId: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
                { link: { $regex: search, $options: 'i' } },
                { currency: { $regex: search, $options: 'i' } },
                { userAgent: { $regex: search, $options: 'i' } },
                { ip: { $regex: search, $options: 'i' } }
            ];
        }

        // If filtering by mobileNumber, find matching yatrikNo and vaiyavachNo
        let yatrikNoSet = null;
        let vaiyavachNoSet = null;
        if (mobileNumberFilter) {
            const yatriks = await Yatrik.find({ mobileNumber: { $regex: mobileNumberFilter, $options: 'i' } }, 'yatrikNo');
            const vaiyavachis = await Vaiyavachi.find({ mobileNumber: { $regex: mobileNumberFilter, $options: 'i' } }, 'vaiyavachNo');
            yatrikNoSet = new Set(yatriks.map(y => y.yatrikNo));
            vaiyavachNoSet = new Set(vaiyavachis.map(v => v.vaiyavachNo));
            filter.$or = [
                { yatrikNo: { $in: Array.from(yatrikNoSet) } },
                { vaiyavachiNo: { $in: Array.from(vaiyavachNoSet) } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Payment.countDocuments(filter);
        const payments = await Payment.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Attach mobileNumber to each payment
        const yatrikNos = payments.filter(p => p.yatrikNo).map(p => p.yatrikNo);
        const vaiyavachNos = payments.filter(p => p.vaiyavachiNo).map(p => p.vaiyavachiNo);
        const yatrikMap = {};
        const vaiyavachMap = {};
        if (yatrikNos.length > 0) {
            const yatriks = await Yatrik.find({ yatrikNo: { $in: yatrikNos } }, 'yatrikNo mobileNumber');
            yatriks.forEach(y => { yatrikMap[y.yatrikNo] = y.mobileNumber; });
        }
        if (vaiyavachNos.length > 0) {
            const vaiyavachis = await Vaiyavachi.find({ vaiyavachNo: { $in: vaiyavachNos } }, 'vaiyavachNo mobileNumber');
            vaiyavachis.forEach(v => { vaiyavachMap[v.vaiyavachNo] = v.mobileNumber; });
        }
        const paymentsWithMobile = payments.map(p => {
            let mobileNumber = '';
            if (p.yatrikNo && yatrikMap[p.yatrikNo]) mobileNumber = yatrikMap[p.yatrikNo];
            else if (p.vaiyavachiNo && vaiyavachMap[p.vaiyavachiNo]) mobileNumber = vaiyavachMap[p.vaiyavachiNo];
            return { ...p.toObject(), mobileNumber };
        });

        res.json({ payments: paymentsWithMobile, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get dynamic summary of Payment records by status (using Payment collection)
exports.getYatrikPaymentStatusSummary = async (req, res) => {
    try {
        const statusCounts = await Payment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const summary = {};
        statusCounts.forEach(item => {
            summary[item._id] = item.count;
        });
        res.status(200).json({ yatrik: summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


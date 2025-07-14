const path = require('path');
const multer = require('multer');
const Vaiyavachi = require('../models/7jatravaiyavachi-25');
const fs = require('fs');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const crypto = require('crypto');

// Multer storage config for vaiyavachi image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/7-jatra-vaiyavach'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `VAIYAVACHI-${Date.now()}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

// Create a new Vaiyavachi record with image upload or base64
exports.createVaiyavachi = async (req, res) => {
    try {
        let vaiyavachiImagePath = '';
        let body = req.body;
        // If base64 image is sent
        if (body.vaiyavachiImage && typeof body.vaiyavachiImage === 'string' && body.vaiyavachiImage.startsWith('data:image')) {
            // Parse base64
            const matches = body.vaiyavachiImage.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
            if (!matches) throw new Error('Invalid image data');
            const ext = matches[1].split('/')[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const filename = `VAIYAVACHI-${Date.now()}.${ext}`;
            const savePath = path.join(__dirname, '../../public/7-jatra-vaiyavach', filename);
            fs.writeFileSync(savePath, buffer);
            vaiyavachiImagePath = `/7-jatra-vaiyavach/${filename}`;
            // Remove base64 from body so it doesn't get stored in DB
            body = { ...body, vaiyavachiImage: undefined };
        } else if (req.file) {
            // Fallback to multer file upload
            vaiyavachiImagePath = `/7-jatra-vaiyavach/${req.file.filename}`;
        }
        const vaiyavachi = new Vaiyavachi({
            ...body,
            vaiyavachiImage: vaiyavachiImagePath
        });
        await vaiyavachi.save();
        res.status(201).json(vaiyavachi);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create Razorpay Payment Link and store Vaiyavachi + Payment
exports.createPaymentLink = [
  upload.single('vaiyavachiPhoto'),
  async (req, res) => {
    try {
      console.log('--- [createPaymentLink] Request received ---');
      // Extract registration fields
      const {
        name, mobileNumber, whatsappNumber, emailAddress, education, religiousEducation, weight, height, dob, address, city, state,
        familyMemberName, relation, familyMemberWANumber, emergencyNumber, is7YatraDoneEarlier, haveYouDoneVaiyavachEarlier, howToReachPalitana, howManyDaysJoin, typeOfVaiyavach, valueOfVaiyavach, vaiyavachiConfirmation, familyConfirmation
      } = req.body;
      console.log('Request body:', req.body);
      console.log('File:', req.file);
      // Save Vaiyavachi registration (isPaid: 'unpaid')
      const vaiyavachiImagePath = req.file ? `/7-jatra-vaiyavach/${req.file.filename}` : '';
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
        vaiyavachiImage: vaiyavachiImagePath,
        isPaid: 'unpaid',
      });
      await newVaiyavachi.save();
      console.log('Vaiyavachi saved:', newVaiyavachi._id);
      // Fetch the saved Vaiyavachi to get vaiyavachiNo (pre-save hook runs here)
      const savedVaiyavachi = await Vaiyavachi.findById(newVaiyavachi._id);
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
        reference_id: savedVaiyavachi._id.toString(),
      });
      console.log('Payment link created:', paymentLink.short_url);
      // Store Payment link in Vaiyavachi
      savedVaiyavachi.paymentLink = paymentLink.short_url;
      savedVaiyavachi.orderId = paymentLink.id;
      await savedVaiyavachi.save();
      // Store Payment record with correct vaiyavachiNo
      const payment = new Payment({
        vaiyavachiNo: savedVaiyavachi.vaiyavachiNo,
        orderId: paymentLink.id,
        paymentId: paymentLink.payment_id || '',
        signature: '',
        amount: 500,
        currency: 'INR',
        status: 'created',
        link: paymentLink.short_url,
      });
      await payment.save();
      console.log('Payment record saved:', payment._id);
      // Return payment link to frontend
      res.json({ paymentLink: paymentLink.short_url, vaiyavachiNo: savedVaiyavachi.vaiyavachiNo, orderId: paymentLink.id });
      console.log('--- [createPaymentLink] Response sent ---');
    } catch (error) {
      console.error('--- [createPaymentLink] ERROR ---', error);
      res.status(500).json({ message: error.message });
    }
  }
];


// Razorpay Webhook for payment status (Vaiyavach)
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
        { vaiyavachiNo: payment.vaiyavachiNo },
        { isPaid: 'paid' }
      );
    }
  }
  res.json({ status: 'ok' });
};
  
  // Verify payment status (frontend polling after redirect) for Vaiyavach
  exports.verifyPayment = async (req, res) => {
    try {
      const { vaiyavachiNo, orderId } = req.query;
      let payment;
      if (orderId) {
        payment = await Payment.findOne({ orderId });
      } else if (vaiyavachiNo) {
        payment = await Payment.findOne({ vaiyavachiNo });
      }
      if (!payment) return res.status(404).json({ status: 'not_found' });
      if (payment.status === 'paid') {
        // Only update isPaid field in Vaiyavachi collection
        if (payment.vaiyavachiNo) {
          await Vaiyavachi.updateOne(
            { vaiyavachiNo: payment.vaiyavachiNo },
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
        // Only update isPaid field in Vaiyavachi collection
        if (payment.vaiyavachiNo) {
          await Vaiyavachi.updateOne(
            { vaiyavachiNo: payment.vaiyavachiNo },
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
                filter[key] = { $regex: filters[key], $options: 'i' };
            }
        });

        // Global search
        if (search) {
            filter.$or = [
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
        const doneEarlierCount = await Vaiyavachi.countDocuments({ is7YatraDoneEarlier: 'yes' });
        const notDoneEarlierCount = await Vaiyavachi.countDocuments({ is7YatraDoneEarlier: 'no' });
        res.status(200).json({
            totalRecords,
            doneEarlierCount,
            notDoneEarlierCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Endpoint: Get counts of registrations for each valueOfVaiyavach grouped by typeOfVaiyavach
exports.getVaiyavachTypeCounts = async (req, res) => {
    try {
        const pipeline = [
            {
                $group: {
                    _id: { typeOfVaiyavach: "$typeOfVaiyavach", valueOfVaiyavach: "$valueOfVaiyavach" },
                    count: { $sum: 1 }
                }
            }
        ];
        const results = await Vaiyavachi.aggregate(pipeline);
        // Format: { spot: { value1: count, ... }, roamming: { value1: count, ... }, chaityavandan: { value1: count, ... } }
        const response = {};
        results.forEach(r => {
            const type = r._id.typeOfVaiyavach;
            const value = r._id.valueOfVaiyavach;
            if (!response[type]) response[type] = {};
            response[type][value] = r.count;
        });
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

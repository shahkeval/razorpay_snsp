const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const multer = require('multer');

// const rssmsuRoutes = require('./routes/rssmsu');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS with specific allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://namonamahshaswatparivar.in', // Add your frontend URL(s) here
  // 'https://your-production-frontend.com',
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Mount routers
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rssmsu', require('./routes/rssmsu'));
app.use('/api/yatriks', require('./routes/yatrikRoutes'));
app.use('/api/vaiyavach', require('./routes/vaiyavchRoutes'));

// Razorpay webhook endpoint (ensure raw body for signature verification)
app.post('/api/yatriks/razorpay-webhook', bodyParser.raw({ type: '*/*' }), require('./controllers/yatrikController').razorpayWebhook);

// Multer/global error handler
app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors (e.g., file too large)
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Other errors
    return res.status(500).json({ message: err.message });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.get('/', async (req, res) => {
  res.json("WORKING");
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');

// const rssmsuRoutes = require('./routes/rssmsu');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rssmsu', require('./routes/rssmsu'));
app.use('/api/yatriks', require('./routes/yatrikRoutes'));
app.use('/api/vaiyavach', require('./routes/vaiyavchRoutes'));

// Razorpay webhook endpoint (ensure raw body for signature verification)
app.post('/api/yatriks/razorpay-webhook', bodyParser.raw({ type: '*/*' }), require('./controllers/yatrikController').razorpayWebhook);

const PORT = process.env.PORT || 5000;

app.get('/', async (req, res) => {
  res.json("WORKING");
});

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
}); 
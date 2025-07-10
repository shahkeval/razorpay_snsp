const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  yatrikNo: { type: String, required: true, index: true },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  signature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'started', 'paid', 'failed', 'cancelled', 'expired'], default: 'created' },
  linkState: { type: String, enum: ['generated', 'expired', 'active'], default: 'generated' },
  linkGeneratedAt: { type: Date, default: Date.now },
  linkExpiredAt: { type: Date },
  link: { type: String },
  paymentStartedAt: { type: Date },
  paymentCompletedAt: { type: Date },
  paymentCancelledAt: { type: Date },
  paymentErrorAt: { type: Date },
  errorReason: { type: String },
  cancelledReason: { type: String },
  userAgent: { type: String },
  ip: { type: String },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema); 
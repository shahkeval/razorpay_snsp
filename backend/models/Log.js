const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  error: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model('Log', LogSchema, 'logs'); 
const mongoose = require('mongoose');

const RSSMsuSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  birthdate: { type: Date, required: true },
  gender: { type: String, required: true },
  profession: { type: String, required: true },
  whatsapp: { type: String, required: true },
  sangh: { type: String, required: true },
  category: { type: String, required: true },
  registrationId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Generate unique registrationId before saving
RSSMsuSchema.pre('save', async function(next) {
  if (!this.registrationId) {
    const Model = this.constructor;
    const lastRegistration = await Model.findOne().sort({ registrationId: -1 }).exec();
    const lastId = lastRegistration ? parseInt(lastRegistration.registrationId.split('-')[1]) : 0; // Extract the numeric part
    this.registrationId = `RSSM-${(lastId + 1).toString().padStart(5, '0')}`; // Increment and format
  }
  next();
});

module.exports = mongoose.model('RSSMsu', RSSMsuSchema); 
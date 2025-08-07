const mongoose = require('mongoose');

const PaintingRSSMSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  gender: { type: String, required: true },
  area: { type: String, required: true },
  sanghName: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  ageGroup: { type: String, required: true },
  paintingType: { type: String, required: true },
  paintingNo: { type: String, unique: true },
}, { timestamps: true });

// Pre-save hook to auto-generate paintingNo (RSSM-P-0001, RSSM-P-0002, ...)
PaintingRSSMSchema.pre('save', async function(next) {
  if (!this.isNew || this.paintingNo) return next();
  // Find the highest paintingNo
  const last = await this.constructor
    .findOne({ paintingNo: { $regex: /^RSSM-P-\d{4}$/ } })
    .sort({ createdAt: -1 });

  let highestNumber = 0;
  if (last && last.paintingNo) {
    const match = last.paintingNo.match(/RSSM-P-(\d{4})/);
    if (match) {
      highestNumber = parseInt(match[1], 10);
    }
  }
  this.paintingNo = `RSSM-P-${String(highestNumber + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('PaintingRSSM', PaintingRSSMSchema, 'painting_rssm'); 
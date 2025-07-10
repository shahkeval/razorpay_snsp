const mongoose = require('mongoose');

const yatrikSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    education: { type: String, required: true },
    religiousEducation: { type: String, required: true },
    weight: { type: String, required: true },
    height: { type: String, required: true },
    dob: { type: Date, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    familyMemberName: { type: String, required: true },
    relation: { type: String, required: true },
    familyMemberWANumber: { type: String, required: true },
    emergencyNumber: { type: String, required: true },
    is7YatraDoneEarlier: { type: String, required: true },
    earlier7YatraCounts: { type: Number, default: 0 },
    howToReachPalitana: { type: String, required: true },
    yatrikConfirmation: { type: String, required:true },
    familyConfirmation: { type: String, required:true },
    isActive: { type: Boolean, default: true },
    yatrikNo: { type: String, unique: true },
    yatrikPhoto: { type: String, required: true },
    isPaid: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to auto-generate yatrikNo
yatrikSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    const highestYatrik = await this.constructor.findOne().sort({ yatrikNo: -1 });
    const highestNumber = highestYatrik ? parseInt(highestYatrik.yatrikNo.split('-')[1]) : 0;
    this.yatrikNo = `yatrik-${String(highestNumber + 1).padStart(4, '0')}`;
    next();
});

module.exports = mongoose.model('Yatrik', yatrikSchema); 
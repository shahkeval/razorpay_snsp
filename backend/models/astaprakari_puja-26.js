const mongoose = require('mongoose');

const astaprakariSchema = new mongoose.Schema({
    yatrikNo: { type: String, unique: true },
    name: { type: String, required: true },
    yatrikPhoto: { type: String },
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
    howToReachPalitana: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isPaid: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid', required: true },
    isConfoirmSeat: { type: Boolean, default: true },
    paymentLink: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to auto-generate yatrikNo in the format NY26-0001
astaprakariSchema.pre('save', async function(next) {
    if (!this.isNew) return next();

    // Find the last document with a yatrikNo that matches the NY26-#### pattern
    const last = await this.constructor
        .findOne({ yatrikNo: { $regex: /^NY26-\d{4}$/ } })
        .sort({ createdAt: -1 });

    let highestNumber = 0;
    if (last && last.yatrikNo) {
        const match = last.yatrikNo.match(/NY26-(\d{4})/);
        if (match) {
            highestNumber = parseInt(match[1], 10);
        }
    }

    this.yatrikNo = `NY26-${String(highestNumber + 1).padStart(4, '0')}`;
    next();
});

module.exports = mongoose.model('AstaprakariPuja', astaprakariSchema);

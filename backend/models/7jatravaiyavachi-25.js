const mongoose = require('mongoose');

const vaiyavachiSchema = new mongoose.Schema({
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
    haveYouDoneVaiyavachEarlier: { type: String, required: true },
    howToReachPalitana: { type: String, required: true },
    howManyDaysJoin: { type: String, required: true },
    typeOfVaiyavach: { type: String, required: true },
    valueOfVaiyavach: { type: String, required: true },
    vaiyavachiConfirmation: { type: String, required: true },
    familyConfirmation: { type: String, required: true },
    transactionNumber: { type: String },
    vaiyavachiImage: { type: String },
    vaiyavachNo: { type: String, unique: true },
    isPaid: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid', required: true },
    paymentLink: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to auto-increment vaiyavachNo (4-digit, zero-padded)
vaiyavachiSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    // Find the highest vaiyavachNo using regex and sort by createdAt
    const last = await this.constructor
        .findOne({ vaiyavachNo: { $regex: /^vaiyavach-\d{4}$/ } })
        .sort({ createdAt: -1 });

    let highestNumber = 0;
    if (last && last.vaiyavachNo) {
        const match = last.vaiyavachNo.match(/vaiyavach-(\d{4})/);
        if (match) {
            highestNumber = parseInt(match[1], 10);
        }
    }
    this.vaiyavachNo = `vaiyavach-${String(highestNumber + 1).padStart(4, '0')}`;
    next();
});

module.exports = mongoose.model('JatraVaiyavachi25', vaiyavachiSchema); 
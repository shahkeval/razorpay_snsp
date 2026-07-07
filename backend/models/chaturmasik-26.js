const mongoose = require('mongoose');

const chaturmasikSchema = new mongoose.Schema({
    chaturmasikNo: { type: String, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    sanghName: { type: String, required: true },
    samayik: { type: String, default: "" },
    navkar: { type: String, default: "" },
    swadhyay: { type: Boolean, default: false },
    brahmacharya: { type: Boolean, default: false },
    brahmacharyaPartnerName: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to auto-generate chaturmasikNo (4-digit, zero-padded)
chaturmasikSchema.pre('save', async function(next) {
    if (!this.isNew) return next();
    
    // Find the highest chaturmasikNo using regex and sort by createdAt
    const last = await this.constructor
        .findOne({ chaturmasikNo: { $regex: /^chaturmasik-\d{4}$/ } })
        .sort({ createdAt: -1 });

    let highestNumber = 0;
    if (last && last.chaturmasikNo) {
        const match = last.chaturmasikNo.match(/chaturmasik-(\d{4})/);
        if (match) {
            highestNumber = parseInt(match[1], 10);
        }
    }
    
    this.chaturmasikNo = `chaturmasik-${String(highestNumber + 1).padStart(4, '0')}`;
    next();
});

module.exports = mongoose.model('Chaturmasik', chaturmasikSchema);

const Donation = require('../models/Donation');

// Get all donations with optional filters, search, pagination, and sorting
exports.getDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      search = '',
      ...filters
    } = req.query;

    let filter = {};
    // Build filter for each field
    Object.keys(filters).forEach(key => {
      if (filters[key] && !['page','limit','sortBy','order','search'].includes(key)) {
        filter[key] = { $regex: filters[key], $options: 'i' };
      }
    });

    // Global search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Donation.countDocuments(filter);
    const donations = await Donation.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ donations, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Create a new donation
exports.createDonation = async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update a donation
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!donation) return res.status(404).json({ message: 'Donation not found.' });
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete a donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found.' });
    res.json({ message: 'Donation deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get donation summary for dashboard (total amount and totals by category)
exports.getDonationSummary = async (req, res) => {
  try {
    const totalResult = await Donation.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    const totalAmount = totalResult[0]?.totalAmount || 0;

    const byCategory = await Donation.aggregate([
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $project: { _id: 0, category: "$_id", amount: 1 } }
    ]);

    res.json({ totalAmount, byCategory });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 
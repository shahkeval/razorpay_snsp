const RSSMsu = require('../models/RSSMsu');

// Create a new registration
exports.createRegistration = async (req, res) => {
  try {
    const registration = new RSSMsu(req.body);
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all registrations with optional filters, search, pagination, and sorting
exports.getAllRegistrations = async (req, res) => {
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
      if (filters[key] && !['page', 'limit', 'sortBy', 'order', 'search'].includes(key)) {
        filter[key] = { $regex: filters[key], $options: 'i' }; // Case-insensitive search
      }
    });

    // Global search
    if (search) {
      filter.$or = [
        {registrationId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { gender: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } },
        { whatsapp: { $regex: search, $options: 'i' } },
        { sangh: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await RSSMsu.countDocuments(filter);
    const registrations = await RSSMsu.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ registrations, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get registration by ID
exports.getRegistrationById = async (req, res) => {
  try {
    const registration = await RSSMsu.findById(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a registration by ID
exports.updateRegistration = async (req, res) => {
  try {
    const registration = await RSSMsu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a registration by ID
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await RSSMsu.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Registration deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get registration summary (total count and totals by category)
exports.getregsummary = async (req, res) => {
  try {
    // Get total count of registrations
    const totalCount = await RSSMsu.countDocuments();

    // Get count of registrations by category
    const byCategory = await RSSMsu.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }, // Group by category
      { $project: { _id: 0, category: "$_id", count: 1 } } // Project the result
    ]);

    res.json({ totalCount, byCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all registrations without pagination and filters
exports.getAllRegistrationsNoPagination = async (req, res) => {
  try {
    const registrations = await RSSMsu.find();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
} 

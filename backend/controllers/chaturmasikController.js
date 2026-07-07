const Chaturmasik = require('../models/chaturmasik-26');

// Create a new registration
exports.createRegistration = async (req, res) => {
  try {
    const registration = new Chaturmasik(req.body);
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
        { chaturmasikNo: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { sanghName: { $regex: search, $options: 'i' } },
        { samayik: { $regex: search, $options: 'i' } },
        { navkar: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Chaturmasik.countDocuments(filter);
    const registrations = await Chaturmasik.find(filter)
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
    const registration = await Chaturmasik.findById(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a registration by ID
exports.updateRegistration = async (req, res) => {
  try {
    const registration = await Chaturmasik.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a registration by ID
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await Chaturmasik.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Registration deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get registration summary (total count and totals by target activities)
exports.getregsummary = async (req, res) => {
  try {
    const totalCount = await Chaturmasik.countDocuments();

    // Get count of registrations by samayik target
    const bySamayik = await Chaturmasik.aggregate([
      { $group: { _id: "$samayik", count: { $sum: 1 } } },
      { $project: { _id: 0, target: "$_id", count: 1 } }
    ]);

    // Get count of registrations by navkar target
    const byNavkar = await Chaturmasik.aggregate([
      { $group: { _id: "$navkar", count: { $sum: 1 } } },
      { $project: { _id: 0, target: "$_id", count: 1 } }
    ]);

    // Get count of registrations by swadhyay consent
    const bySwadhyay = await Chaturmasik.aggregate([
      { $group: { _id: "$swadhyay", count: { $sum: 1 } } },
      { $project: { _id: 0, consented: "$_id", count: 1 } }
    ]);

    // Get count of registrations by brahmacharya consent
    const byBrahmacharya = await Chaturmasik.aggregate([
      { $group: { _id: "$brahmacharya", count: { $sum: 1 } } },
      { $project: { _id: 0, consented: "$_id", count: 1 } }
    ]);

    res.json({ totalCount, bySamayik, byNavkar, bySwadhyay, byBrahmacharya });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all registrations without pagination and filters
exports.getAllRegistrationsNoPagination = async (req, res) => {
  try {
    const registrations = await Chaturmasik.find();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

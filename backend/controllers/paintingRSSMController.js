const PaintingRSSM = require('../models/PaintingRSSM');

// Create a new painting registration
exports.createRegistration = async (req, res) => {
  try {
    const registration = new PaintingRSSM(req.body);
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
    const dateFields = ['createdAt', 'updatedAt'];
    // Build filter for each field
    Object.keys(filters).forEach(key => {
      if (filters[key] && !['page', 'limit', 'sortBy', 'order', 'search'].includes(key)) {
        if (dateFields.includes(key)) {
          // For date fields, use exact match (or you can implement range if needed)
          filter[key] = new Date(filters[key]);
        } else {
          filter[key] = { $regex: filters[key], $options: 'i' }; // Case-insensitive search for strings
        }
      }
    });

    // Global search
    if (search) {
      filter.$or = [
        { paintingNo: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { gender: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { sanghName: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { ageGroup: { $regex: search, $options: 'i' } },
        { paintingType: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PaintingRSSM.countDocuments(filter);
    const registrations = await PaintingRSSM.find(filter)
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
    const registration = await PaintingRSSM.findById(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a registration by ID
exports.updateRegistration = async (req, res) => {
  try {
    const registration = await PaintingRSSM.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json(registration);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a registration by ID
exports.deleteRegistration = async (req, res) => {
  try {
    const registration = await PaintingRSSM.findByIdAndDelete(req.params.id);
    if (!registration) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Registration deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get registration summary (total count and totals by ageGroup)
exports.getregsummarybyagegroup = async (req, res) => {
  try {
    // Get total count of registrations
    const totalCount = await PaintingRSSM.countDocuments();

    // Get count of registrations by ageGroup
    const byAgeGroup = await PaintingRSSM.aggregate([
      { $group: { _id: "$ageGroup", count: { $sum: 1 } } },
      { $project: { _id: 0, ageGroup: "$_id", count: 1 } }
    ]);

    res.json({ totalCount, byAgeGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all registrations without pagination and filters
exports.getAllRegistrationsNoPagination = async (req, res) => {
  try {
    const registrations = await PaintingRSSM.find();
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get registration summary (total count and totals by paintingType)
exports.getregsummarybypaintingtype = async (req, res) => {
  try {
    // Get total count of registrations
    const totalCount = await PaintingRSSM.countDocuments();

    // Get count of registrations by paintingType
    const byPaintingType = await PaintingRSSM.aggregate([
      { $group: { _id: "$ageGroup", count: { $sum: 1 } } },
      { $project: { _id: 0, paintingType: "$_id", count: 1 } }
    ]);

    res.json({ totalCount, byPaintingType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
}; 
const path = require('path');
const multer = require('multer');
const Vaiyavachi = require('../models/7jatravaiyavachi-25');

// Multer storage config for vaiyavachi image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/7-jatra-vaiyavach'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `VAIYAVACHI-${Date.now()}${ext}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

// Create a new Vaiyavachi record with image upload
exports.createVaiyavachi = [
    upload.single('vaiyavachiImage'),
    async (req, res) => {
        try {
            const vaiyavachiImagePath = req.file ? `/7-jatra-vaiyavach/${req.file.filename}` : '';
            const body = req.body;
            const vaiyavachi = new Vaiyavachi({
                ...body,
                vaiyavachiImage: vaiyavachiImagePath
            });
            await vaiyavachi.save();
            res.status(201).json(vaiyavachi);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
];

// Get all Vaiyavachi records with pagination, search, sorting, and filtering
exports.getAllVaiyavachis = async (req, res) => {
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
                filter[key] = { $regex: filters[key], $options: 'i' };
            }
        });

        // Global search
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { mobileNumber: { $regex: search, $options: 'i' } },
                { whatsappNumber: { $regex: search, $options: 'i' } },
                { emailAddress: { $regex: search, $options: 'i' } },
                { education: { $regex: search, $options: 'i' } },
                { religiousEducation: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } },
                { familyMemberName: { $regex: search, $options: 'i' } },
                { relation: { $regex: search, $options: 'i' } },
                { familyMemberWANumber: { $regex: search, $options: 'i' } },
                { emergencyNumber: { $regex: search, $options: 'i' } },
                { howToReachPalitana: { $regex: search, $options: 'i' } },
                { transactionNumber: { $regex: search, $options: 'i' } },
                { typeOfVaiyavach: { $regex: search, $options: 'i' } },
                { valueOfVaiyavach: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Vaiyavachi.countDocuments(filter);
        const vaiyavachis = await Vaiyavachi.find(filter)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ vaiyavachis, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single Vaiyavachi record by ID
exports.getVaiyavachiById = async (req, res) => {
    try {
        const vaiyavachi = await Vaiyavachi.findById(req.params.id);
        if (!vaiyavachi) return res.status(404).json({ message: 'Vaiyavachi not found' });
        res.status(200).json(vaiyavachi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a Vaiyavachi record by ID
exports.updateVaiyavachi = async (req, res) => {
    try {
        const updatedVaiyavachi = await Vaiyavachi.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedVaiyavachi) return res.status(404).json({ message: 'Vaiyavachi not found' });
        res.status(200).json(updatedVaiyavachi);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a Vaiyavachi record by ID
exports.deleteVaiyavachi = async (req, res) => {
    try {
        const deletedVaiyavachi = await Vaiyavachi.findByIdAndDelete(req.params.id);
        if (!deletedVaiyavachi) return res.status(404).json({ message: 'Vaiyavachi not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get summary of Vaiyavachi records (total, done earlier, not done earlier)
exports.getVaiyavachiSummary = async (req, res) => {
    try {
        const totalRecords = await Vaiyavachi.countDocuments();
        const doneEarlierCount = await Vaiyavachi.countDocuments({ is7YatraDoneEarlier: 'yes' });
        const notDoneEarlierCount = await Vaiyavachi.countDocuments({ is7YatraDoneEarlier: 'no' });
        res.status(200).json({
            totalRecords,
            doneEarlierCount,
            notDoneEarlierCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
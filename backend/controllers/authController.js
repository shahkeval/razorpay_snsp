const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 

exports.getDay1GalleryImages = async (req, res) => {
  try {
    const { cursor } = req.query; // cursor from frontend (optional)

    const search = cloudinary.search
      .expression('folder:"7 Jatra 2026/Day-1"')
      .sort_by('created_at', 'asc')
      .max_results(50);

    // 🔹 If cursor exists, fetch next batch
    if (cursor) {
      search.next_cursor(cursor);
    }

    const result = await search.execute();

    res.status(200).json({
      images: result.resources,
      nextCursor: result.next_cursor || null,
      total: result.total_count, // total images in folder
    });
  } catch (error) {
    console.error('Cloudinary Error:', error);
    res.status(500).json({ message: 'Failed to fetch gallery images.' });
  }
};

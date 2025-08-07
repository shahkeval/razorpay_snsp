const Log = require('../models/Log');

// Create a new log entry
exports.createLog = async (req, res) => {
  try {
    const log = new Log({
      error: req.body.error,
      date: req.body.date || new Date(),
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 


// Create a new log entry
exports.create_webhhok = async (req, res) => {
  try {
    // Use the error field if present, otherwise stringify the whole body
    const error_message = req.body.error || JSON.stringify(req.body);
    const date = new Date();
    const log = new Log({
      error: error_message,
      date: date,
    });
    await log.save();
    res.status(200).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 
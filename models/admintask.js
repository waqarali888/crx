const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  link: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const videoPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  videos: [videoSchema]
});

// Agar model already exist karta hai to use reuse karo
module.exports = mongoose.models.VideoPlan || mongoose.model('VideoPlan', videoPlanSchema);

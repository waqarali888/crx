const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  link: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // URL ya local path
  totalInvestment: { type: Number, required: true },
  dailyAds: { type: Number, required: true },
  dailyProfit: { type: Number, required: true },
  totalProfit: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  videos: [videoSchema] // **yaha videos field add ki**
}, { timestamps: true });

module.exports = mongoose.models.Plan || mongoose.model('Plan', planSchema);

const mongoose = require('mongoose');

const taskVideoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  watched: { type: Boolean, default: false },
   link: { type: String },       // <-- frontend ke liye
  watchTime: { type: Number, default: 0 } // seconds
});

const taskHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  date: { type: Date, required: true },
  videos: [taskVideoSchema],
  completed: { type: Boolean, default: false },
  collected: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('TaskHistory', taskHistorySchema);

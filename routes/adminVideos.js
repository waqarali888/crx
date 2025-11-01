const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const adminAuth = require('../middleware/adminAuth');
const Plan = require('../models/Plan'); // old Plan model use karenge

// ===== Add/Update all videos for a plan =====
router.post('/update', adminAuth, async (req, res) => {
  const { planName, videos } = req.body; // videos = array of links/iframe

  if(!planName || !videos || !videos.length) 
    return res.status(400).json({ message: 'Invalid data' });

  try {
    const plan = await Plan.findOne({ name: planName });
    if(!plan) return res.status(404).json({ message: 'Plan not found' });

    // Agar plan me pehle se videos nahi hai to array create karo
    if(!plan.videos) plan.videos = [];

    videos.forEach(link => {
      plan.videos.push({
        videoId: uuidv4(),
        link,
        date: new Date()
      });
    });

    await plan.save();
    res.json({ message: 'Videos updated successfully', videos: plan.videos });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Get all videos of a plan =====
router.get('/:planName', adminAuth, async (req, res) => {
  const { planName } = req.params;
  try {
    const plan = await Plan.findOne({ name: planName });
    if(!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ videos: plan.videos || [] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Delete single video =====
router.delete('/:planName/:videoId', adminAuth, async (req, res) => {
  const { planName, videoId } = req.params;

  try {
    const plan = await Plan.findOne({ name: planName });
    if(!plan) return res.status(404).json({ message: 'Plan not found' });

    plan.videos = (plan.videos || []).filter(v => v.videoId !== videoId);
    await plan.save();
    res.json({ message: 'Video deleted successfully' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Delete multiple/all videos =====
router.delete('/:planName', adminAuth, async (req, res) => {
  const { planName } = req.params;
  const { videoIds } = req.body; // array of videoIds

  try {
    const plan = await Plan.findOne({ name: planName });
    if(!plan) return res.status(404).json({ message: 'Plan not found' });

    if(videoIds && videoIds.length > 0) {
      plan.videos = (plan.videos || []).filter(v => !videoIds.includes(v.videoId));
    } else {
      plan.videos = []; // agar videoIds nahi diye to sab delete
    }

    await plan.save();
    res.json({ message: 'Videos deleted successfully', videos: plan.videos });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

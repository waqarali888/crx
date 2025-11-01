const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); // JWT middleware

// Get all plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get plan by ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Buy plan - only 1 active plan per user
router.post('/buy/:planId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.activePlan) return res.status(400).json({ message: 'You already have an active plan.' });

    const plan = await Plan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Save only the plan ID in user.activePlan
    user.activePlan = plan._id;
    await user.save();

    // Populate activePlan to send full plan info in response
    const updatedUser = await User.findById(user._id).populate('activePlan');

    res.json({ message: 'Plan purchased successfully', activePlan: updatedUser.activePlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

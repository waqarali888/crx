const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware'); // JWT middleware

// Get all plans (sorted by price low → high)
router.get('/', async (req, res) => {
  try {
    // ✨ Always return plans in proper order (ascending)
    const plans = await Plan.find({}).sort({ totalInvestment: 1 });

    // Extra safety: agar plans empty hue to clear message
    if (!plans.length) {
      return res.status(404).json({ message: 'No plans found' });
    }

    res.status(200).json(plans);
  } catch (err) {
    console.error('❌ Error fetching plans:', err.message);
    res.status(500).json({ message: 'Server error while fetching plans' });
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

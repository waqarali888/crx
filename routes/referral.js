const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Reward levels configuration
const rewardLevels = [
  { level: 1, referrals: 3, reward: 1 },
  { level: 2, referrals: 6, reward: 2 },
  { level: 3, referrals: 9, reward: 3 },
  { level: 4, referrals: 12, reward: 4 },
  { level: 5, referrals: 50, reward: 13 },
  { level: 6, referrals: 100, reward: 25 }
];

// Get referral data for logged-in user
router.get('/data', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('referrals', 'name email createdAt activePlan')
      .select('name referralCode referralCount lastProcessedLevel wallet referrals');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      name: user.name,
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      lastProcessedLevel: user.lastProcessedLevel || 0,
      wallet: user.wallet || 0,
      referrals: user.referrals || []
    });
  } catch (error) {
    console.error('Error fetching referral data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Claim referral reward (multi-level)
router.post('/claim', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalReferrals = user.referralCount || 0;
    let lastLevel = user.lastProcessedLevel || 0;

    // Find highest eligible level
    let eligibleLevel = null;
    for (const lvl of rewardLevels) {
      if (totalReferrals >= lvl.referrals && lvl.level > lastLevel) {
        eligibleLevel = lvl;
      }
    }

    if (!eligibleLevel) {
      const nextLevel = rewardLevels.find(lvl => lvl.level === lastLevel + 1);
      const remaining = nextLevel ? nextLevel.referrals - totalReferrals : 0;
      return res.status(400).json({
        success: false,
        message: `You need ${remaining > 0 ? remaining : 0} more referrals to reach next reward level`
      });
    }

    // Add reward to wallet
    const rewardAmount = eligibleLevel.reward;
    user.wallet = (user.wallet || 0) + rewardAmount;
    user.lastProcessedLevel = eligibleLevel.level;
    await user.save();

    res.json({
      success: true,
      message: `🎉 Level ${eligibleLevel.level} reward claimed successfully!`,
      rewardAmount,
      newWallet: user.wallet,
      achievedLevel: eligibleLevel.level,
      totalReferrals,
      nextTarget: rewardLevels.find(l => l.level === eligibleLevel.level + 1) || null
    });

  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while claiming reward' 
    });
  }
});

// Get referral statistics (for dashboard)
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('referrals', 'createdAt activePlan');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalReferrals = user.referralCount || 0;
    const lastLevel = user.lastProcessedLevel || 0;
    const activeReferrals = user.referrals.filter(r => r.activePlan).length;

    const nextLevel = rewardLevels.find(l => l.level === lastLevel + 1);
    const remaining = nextLevel ? Math.max(0, nextLevel.referrals - totalReferrals) : 0;
    const totalEarned = rewardLevels
      .filter(l => l.level <= lastLevel)
      .reduce((sum, l) => sum + l.reward, 0);

    res.json({
      totalReferrals,
      activeReferrals,
      lastLevel,
      totalEarned,
      remainingForNextLevel: remaining,
      nextLevel
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

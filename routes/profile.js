// routes/referral.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('name email referralCode referralCount wallet referrals referralEarnings')
      .populate('referrals', 'name email');

    if (!user) return res.status(404).json({ message: 'User not found' });

    // ---------- Referral reward logic ----------
    // Har 5 referrals par 1$ add karna hai
    const rewardUnit = 5; // 5 referrals = 1$
    const totalRewardsEarned = Math.floor(user.referralCount / rewardUnit);

    // Pichle credited rewards ke against naya reward calculate
    const newRewards = totalRewardsEarned - user.referralEarnings;

    if (newRewards > 0) {
      user.wallet += newRewards; // wallet me add karo
      user.referralEarnings += newRewards; // referralEarnings me track karo
      await user.save();
    }

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      wallet: user.wallet,
      depositMessage: newRewards > 0 ? `Deposit $${newRewards} in your wallet` : null,
      referrals: user.referrals
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

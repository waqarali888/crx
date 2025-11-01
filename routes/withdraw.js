const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const WithdrawRequest = require('../models/WithdrawRequest');
const User = require('../models/User');

// ------------------- USER -------------------
// Create withdraw request
router.post('/', auth, async (req, res) => {
  try {
    const { amount, accountNumber, accountName, bankName } = req.body;

    if(amount < 5) return res.status(400).json({ message: 'Minimum withdraw amount is $5' });

    const fee = parseFloat((amount * 0.3).toFixed(2));
    const finalAmount = amount - fee;

    const user = await User.findById(req.userId);

    if(user.wallet < amount) return res.status(400).json({ message: 'Insufficient wallet balance' });

    // Deduct amount immediately
    user.wallet -= amount;
    await user.save();

    const newReq = new WithdrawRequest({
      user: req.userId,
      amount,
      fee,
      accountNumber,
      accountName,
      bankName
    });

    await newReq.save();
    res.json({ message: 'Withdraw request submitted', fee, finalAmount });

  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------- ADMIN -------------------
// Get all withdraw requests
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const requests = await WithdrawRequest.find().populate('user');
    res.json(requests);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve withdraw
router.post('/admin/:id/approve', adminAuth, async (req, res) => {
  try {
    const reqItem = await WithdrawRequest.findById(req.params.id).populate('user');
    if(!reqItem) return res.status(404).json({ message:'Request not found' });

    if(reqItem.status !== 'pending') return res.status(400).json({ message:'Action already taken' });

    reqItem.status = 'approved';
    await reqItem.save();

    // Optionally: notify user via email/push

    res.json({ message:'Withdraw approved' });

  } catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Reject withdraw
router.post('/admin/:id/reject', adminAuth, async (req, res) => {
  try {
    const reqItem = await WithdrawRequest.findById(req.params.id).populate('user');
    if(!reqItem) return res.status(404).json({ message:'Request not found' });

    if(reqItem.status !== 'pending') return res.status(400).json({ message:'Action already taken' });

    reqItem.status = 'rejected';
    await reqItem.save();

    // Return money to user's wallet
    const user = await User.findById(reqItem.user._id);
    user.wallet += reqItem.amount;
    await user.save();

    res.json({ message:'Withdraw rejected, amount returned to wallet' });

  } catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});
// --// ✅ Get user withdraw history
router.get('/history', auth, async (req, res) => {
  try {
    const requests = await WithdrawRequest.find({ user: req.userId })
      .sort({ createdAt: -1 }) // latest first
      .select('amount fee accountNumber accountName bankName status createdAt'); // optional: send only needed fields

    res.json(requests);
  } catch (err) {
    console.error('Withdraw history error:', err);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

module.exports = router;

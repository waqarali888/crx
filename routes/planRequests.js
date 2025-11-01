const express = require('express');
const router = express.Router();
const multer = require('multer');
const PlanRequest = require('../models/planRequest');
const User = require('../models/User'); // ✅ Add this line
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');
const fs = require('fs');
const path = require('path');

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/proofs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ------------------- USER UPLOAD -------------------
router.post('/upload', auth, upload.single('proof'), async (req, res) => {
  try {
    const { planId, accountNumber } = req.body;
    if (!req.file)
      return res.status(400).json({ message: 'No file uploaded' });

    const newRequest = new PlanRequest({
      user: req.userId,
      plan: planId,
      accountNumber,
      proof: req.file.filename
    });

    await newRequest.save();
    res.json({ message: 'Request submitted successfully' });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
});

// ------------------- ADMIN GET PENDING -------------------
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const requests = await PlanRequest.find({ status: 'pending' }).populate('user');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------- ADMIN APPROVE -------------------
router.post('/admin/:id/approve', adminAuth, async (req, res) => {
  try {
    const request = await PlanRequest.findById(req.params.id).populate('user');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // ✅ Set the active plan for the user
    request.user.activePlan = request.plan;
    await request.user.save();

    // ✅ Referral logic — only when this is first approval for this user
    const referredBy = request.user.referredBy;
    if (referredBy) {
      const referrer = await User.findById(referredBy);

      if (referrer && !referrer.referrals.includes(request.user._id)) {
        // Add referred user ID to referrals list
        referrer.referrals.push(request.user._id);

        // Increase referral count
        referrer.referralCount += 1;

      
        await referrer.save();
      }
    }

    // ✅ Update request status
    request.status = 'approved';
    await request.save();

    res.json({ message: 'Plan request approved & referral updated (if any)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------- ADMIN REJECT -------------------
router.post('/admin/:id/reject', adminAuth, async (req, res) => {
  try {
    const request = await PlanRequest.findById(req.params.id);
    if (!request)
      return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Plan request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

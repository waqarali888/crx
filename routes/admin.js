  const express = require('express');
  const router = express.Router();
  const jwt = require('jsonwebtoken');
  const adminAuth = require('../middleware/adminAuth');
  const rateLimit = require('express-rate-limit');
  const User = require('../models/User');

  // Login rate limiter - 5 attempts per 5 minutes
  const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    message: 'Too many login attempts. Please try again after 5 minutes.'
  });

  // Admin login
  router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Provide email and password' });

    // Check email
    if (email !== process.env.ADMIN_EMAIL)
      return res.status(401).json({ message: 'Invalid admin email or password' });

    // Plain password check (no hash)
    if (password !== process.env.ADMIN_PASSWORD)
      return res.status(401).json({ message: 'Invalid admin email or password' });

    // Generate JWT
    const token = jwt.sign({ admin: true, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Admin logged in', token });
  });

  // Admin dashboard
  router.get('/dashboard', adminAuth, async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalReferrals = await User.aggregate([
        { $group: { _id: null, total: { $sum: "$referralCount" } } }
      ]);

      res.json({
        totalUsers,
        totalReferrals: totalReferrals[0] ? totalReferrals[0].total : 0
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;

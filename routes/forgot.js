const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. Get security question
router.post('/get-question', async(req,res)=>{
  const { email } = req.body;
  if(!email) return res.status(400).json({ message:'Provide email' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if(!user) return res.status(404).json({ message:'User not found' });

  res.json({ securityQuestion: user.securityQuestion });
});

// 2. Verify answer
router.post('/verify-answer', async(req,res)=>{
  const { email, answer } = req.body;
  if(!email || !answer) return res.status(400).json({ message:'Provide email and answer' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if(!user) return res.status(404).json({ message:'User not found' });

  const match = await bcrypt.compare(answer, user.securityAnswerHash);
  if(!match) return res.status(400).json({ message:'Incorrect answer' });

  res.json({ message:'Answer verified' });
});

// 3. Reset password
router.post('/reset', async(req,res)=>{
  const { email, newPassword } = req.body;
  if(!email || !newPassword) return res.status(400).json({ message:'Provide email and new password' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if(!user) return res.status(404).json({ message:'User not found' });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message:'Password updated successfully' });
});

module.exports = router;

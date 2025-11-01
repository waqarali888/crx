const User = require('../models/User');
const Plan = require('../models/Plan');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const generateUniqueReferral = require('../utils/generateReferral');
const generateToken = require('../utils/generateToken'); // ✅ new import

// ---------------- REGISTER ----------------
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      name, username, email, phone, password,
      confirmPassword, securityQuestion, securityAnswer, referralCode
    } = req.body;

    const existing = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });
    if (existing)
      return res.status(400).json({ message: 'Email/Username/Phone already used' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const securityAnswerHash = await bcrypt.hash(securityAnswer, salt);

    const code = await generateUniqueReferral();

    const newUser = new User({
      name,
      username: username || null,
      email,
      phone: phone || null,
      password: passwordHash,
      securityQuestion,
      securityAnswerHash,
      referralCode: code
    });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim() });
      if (referrer) newUser.referredBy = referrer._id;
    }

    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        referralCount: newUser.referralCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ message: 'Provide identifier and password' });

    // Normal user find
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier },
        { phone: identifier }
      ]
    });

    // Agar user nahi mila, purane email/username check karo
    if (!user) {
      const oldUsed = await User.findOne({
        $or: [
          { previousEmails: identifier.toLowerCase() },
          { previousUsernames: identifier }
        ]
      });
      if (oldUsed) {
        return res.status(403).json({
          message: 'This email/username is no longer valid. Please use your updated credentials.'
        });
      }
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ✅ Check karo kya purana password use ho raha hai
    for (const oldPass of user.previousPasswords) {
      const matchOld = await bcrypt.compare(password, oldPass);
      if (matchOld) {
        return res.status(403).json({
          message: 'This password is no longer valid. Please use your updated password.'
        });
      }
    }

    // ✅ Abhi ka current password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referralCount: user.referralCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- DASHBOARD ----------------
const dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('activePlan')
      .select('-password -securityAnswerHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activePlan = user.activePlan ? {
      id: user.activePlan._id,
      name: user.activePlan.name,
      totalInvestment: user.activePlan.totalInvestment,
      dailyAds: user.activePlan.dailyAds,
      dailyProfit: user.activePlan.dailyProfit,
      totalProfit: user.activePlan.totalProfit,
      durationDays: user.activePlan.durationDays
    } : null;

    res.json({
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      wallet: user.wallet || 0,
      activePlan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, username } = req.body;
    let versionChanged = false;

    if (name) user.name = name;

    // Email update
    if (email && email !== user.email) {
      if (!user.previousEmails.includes(user.email)) {
        user.previousEmails.push(user.email);
      }
      user.email = email;
      user.tokenVersion += 1;
      versionChanged = true;
    }

    // Username update
    if (username && username !== user.username) {
      if (!user.previousUsernames.includes(user.username)) {
        user.previousUsernames.push(user.username);
      }
      user.username = username;
      user.tokenVersion += 1;
      versionChanged = true;
    }

    await user.save();

    let response = { message: 'Profile updated successfully', user };
    if (versionChanged) {
      const newToken = generateToken(user);
      response.newToken = newToken;
    }

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Old password incorrect' });

    // ✅ Purana password store kar le future block ke liye
    if (!user.previousPasswords.includes(user.password)) {
      user.previousPasswords.push(user.password);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.tokenVersion += 1;
    await user.save();

    const newToken = generateToken(user);

    res.json({ message: 'Password changed successfully', newToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { register, login, dashboard, updateProfile, changePassword };

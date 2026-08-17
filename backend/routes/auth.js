const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator';

const USER_USERNAME = process.env.USER_USERNAME || 'max';
const USER_PASSWORD = process.env.USER_PASSWORD || 'max';
const USER_NAME = process.env.USER_NAME || 'User';

console.log('Default credentials initialized:', { 
  ADMIN_USERNAME, 
  ADMIN_PASSWORD, 
  USER_USERNAME, 
  USER_PASSWORD 
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, username, phone, password, location, farmDetails, role } = req.body;

    // Check if user exists by username or phone
    if (username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }
    }
    
    if (phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Phone number already exists' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (only allow 'user' role in registration, admin must be created manually)
    const userRole = role === 'admin' ? 'user' : (role || 'user');

    const user = new User({
      name,
      username: username ? username.toLowerCase() : undefined,
      phone: phone || undefined,
      password: hashedPassword,
      role: userRole,
      location,
      farmDetails
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Check for default admin login (no DB connection)
    const trimmedUsername = username ? username.trim().toLowerCase() : '';
    const trimmedPassword = password ? password.trim() : '';
    
    console.log('Login attempt:', { trimmedUsername, trimmedPassword, ADMIN_USERNAME, ADMIN_PASSWORD, USER_USERNAME, USER_PASSWORD });
    
    if (trimmedUsername === ADMIN_USERNAME && trimmedPassword === ADMIN_PASSWORD) {
      console.log('Admin login matched');
      const token = jwt.sign({ id: 'ADMIN', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        success: true,
        token,
        user: {
          id: 'ADMIN',
          name: ADMIN_NAME,
          username: ADMIN_USERNAME,
          role: 'admin'
        }
      });
    }

    // Check for default user login (no DB connection)
    if (trimmedUsername === USER_USERNAME && trimmedPassword === USER_PASSWORD) {
      console.log('User login matched');
      const token = jwt.sign({ id: 'USER', role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
      return res.json({
        success: true,
        token,
        user: {
          id: 'USER',
          name: USER_NAME,
          username: USER_USERNAME,
          role: 'user'
        }
      });
    }
    
    console.log('Default credentials check failed, checking database...');

    let user;
    if (username) {
      user = await User.findOne({ username: trimmedUsername });
    } else if (phone) {
      user = await User.findOne({ phone });
    } else {
      return res.status(400).json({ success: false, message: 'Username or phone is required' });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        role: user.role,
        location: user.location,
        farmDetails: user.farmDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// List users (admin only)
router.get('/users', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { role, q, page = 1, size = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { username: regex }, { phone: regex }];
    }
    const records = await User.find(filter)
      .select('name username phone role')
      .skip((Number(page) - 1) * Number(size))
      .limit(Number(size));
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

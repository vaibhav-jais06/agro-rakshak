const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator';

const USER_USERNAME = process.env.USER_USERNAME || 'max';
const USER_NAME = process.env.USER_NAME || 'User';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded && decoded.role === 'admin' && decoded.id === 'ADMIN') {
      req.user = { _id: 'ADMIN', id: 'ADMIN', name: ADMIN_NAME, username: ADMIN_USERNAME, role: 'admin' };
      return next();
    }

    if (decoded && decoded.role === 'user' && decoded.id === 'USER') {
      req.user = { _id: 'USER', id: 'USER', name: USER_NAME, username: USER_USERNAME, role: 'user' };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;

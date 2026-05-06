const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (header && header.startsWith('Bearer ')) {
      const token = header.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      const user = await User.findById(decoded.userId).select('-password');
      if (user) req.user = user;
    }
  } catch (err) {
    // Optional auth - continue without user
  }
  next();
};

module.exports = { auth, optionalAuth };

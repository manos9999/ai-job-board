const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'skills', 'experience', 'bio', 'location', 'company'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    Object.assign(req.user, updates);
    await req.user.save();

    res.json(req.user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

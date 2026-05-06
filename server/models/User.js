const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'employer'], default: 'jobseeker' },
  skills: [{ type: String }],
  experience: { type: String, default: '' },
  bio: { type: String, default: '' },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: { type: Date, default: Date.now },
  coverLetter: { type: String, default: '' }
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
    default: 'Full-time'
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  skills: [{ type: String, required: true }],
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [applicantSchema],
  createdAt: { type: Date, default: Date.now }
});

jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);

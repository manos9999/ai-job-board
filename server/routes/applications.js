const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Job = require('../models/Job');
const { computeMatchScore } = require('../utils/matching');

async function getUserApplications(req, res) {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can view applications' });
    }

    const jobs = await Job.find({ 'applicants.user': req.user._id })
      .populate('employer', 'name company');

    const applications = jobs.map(job => {
      const application = job.applicants.find(a => a.user.toString() === req.user._id.toString());
      const { score, matchedSkills, missingSkills } = computeMatchScore(req.user.skills, job.skills);
      return {
        _id: application._id,
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          salary: job.salary,
          skills: job.skills
        },
        status: application.status,
        appliedAt: application.appliedAt,
        createdAt: application.appliedAt,
        coverLetter: application.coverLetter,
        matchScore: score,
        matchedSkills,
        missingSkills
      };
    });

    applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    res.json(applications);
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/applications/my
router.get('/my', auth, getUserApplications);

// GET /api/applications
router.get('/', auth, getUserApplications);

// PUT /api/applications/:id - update application status (for employers)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can update application status' });
    }

    const { status } = req.body;
    if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the job containing this application
    const job = await Job.findOne({
      employer: req.user._id,
      'applicants._id': req.params.id
    });

    if (!job) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const applicant = job.applicants.id(req.params.id);
    applicant.status = status;
    await job.save();

    res.json({ message: 'Status updated', status });
  } catch (err) {
    console.error('Update application error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

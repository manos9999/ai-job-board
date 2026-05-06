const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Job = require('../models/Job');
const { computeMatchScore } = require('../utils/matching');

// GET /api/analytics
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'employer') {
      const jobs = await Job.find({ employer: req.user._id });
      const totalJobs = jobs.length;
      let totalApplicants = 0;
      const statusBreakdown = { pending: 0, reviewed: 0, accepted: 0, rejected: 0 };

      for (const job of jobs) {
        totalApplicants += job.applicants.length;
        for (const app of job.applicants) {
          statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
        }
      }

      res.json({
        role: 'employer',
        totalJobs,
        totalApplicants,
        statusBreakdown,
        avgApplicantsPerJob: totalJobs > 0 ? Math.round(totalApplicants / totalJobs * 10) / 10 : 0
      });
    } else {
      const jobs = await Job.find({ 'applicants.user': req.user._id });
      const totalApplications = jobs.length;
      const statusBreakdown = { pending: 0, reviewed: 0, accepted: 0, rejected: 0 };
      let totalMatchScore = 0;

      for (const job of jobs) {
        const app = job.applicants.find(a => a.user.toString() === req.user._id.toString());
        if (app) {
          statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
        }
        const { score } = computeMatchScore(req.user.skills, job.skills);
        totalMatchScore += score;
      }

      res.json({
        role: 'jobseeker',
        totalApplications,
        statusBreakdown,
        avgMatchScore: totalApplications > 0 ? Math.round(totalMatchScore / totalApplications) : 0
      });
    }
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

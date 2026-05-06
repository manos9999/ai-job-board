const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const { computeMatchScore } = require('../utils/matching');
const { fetchJSearchJobs } = require('../utils/jsearch');

// GET /api/jobs/my - employer's own jobs
router.get('/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can view their jobs' });
    }
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    const jobsWithCounts = jobs.map(j => {
      const obj = j.toObject();
      obj.applicantCount = j.applicants.length;
      obj.salaryMin = j.salary?.min;
      obj.salaryMax = j.salary?.max;
      return obj;
    });
    res.json(jobsWithCounts);
  } catch (err) {
    console.error('Get my jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs - list jobs with filters (MongoDB + JSearch API)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, location, type, minSalary, maxSalary } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (minSalary) filter['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) filter['salary.max'] = { $lte: Number(maxSalary) };

    const [dbJobs, externalJobs] = await Promise.all([
      Job.find(filter).populate('employer', 'name company').sort({ createdAt: -1 }),
      search ? fetchJSearchJobs(search) : Promise.resolve([]),
    ]);

    let mongoJobs = dbJobs.map(j => {
      const obj = j.toObject();
      obj.salaryMin = obj.salary?.min;
      obj.salaryMax = obj.salary?.max;
      obj.source = 'local';
      return obj;
    });

    let filteredExternal = externalJobs;
    if (location) {
      filteredExternal = filteredExternal.filter(j =>
        j.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (type) {
      filteredExternal = filteredExternal.filter(j => j.type === type);
    }

    let allJobs = [...mongoJobs, ...filteredExternal];

    if (req.user && req.user.role === 'jobseeker' && req.user.skills.length > 0) {
      allJobs = allJobs.map(job => {
        const { score, matchedSkills, missingSkills } = computeMatchScore(req.user.skills, job.skills || []);
        return { ...job, matchScore: score, matchedSkills, missingSkills };
      });
    }

    res.json(allJobs);
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name company email');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const jobObj = job.toObject();
    jobObj.salaryMin = jobObj.salary?.min;
    jobObj.salaryMax = jobObj.salary?.max;

    if (req.user && req.user.role === 'jobseeker') {
      if (req.user.skills.length > 0) {
        const { score, matchedSkills, missingSkills } = computeMatchScore(req.user.skills, job.skills);
        jobObj.matchScore = score;
        jobObj.matchedSkills = matchedSkills;
        jobObj.missingSkills = missingSkills;
      }
      jobObj.hasApplied = job.applicants.some(a => a.user.toString() === req.user._id.toString());
    }

    // Remove applicant details unless employer owns the job
    if (!req.user || req.user.role !== 'employer' || job.employer._id.toString() !== req.user._id.toString()) {
      jobObj.applicants = undefined;
    }

    res.json(jobObj);
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs - create job (employer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can post jobs' });
    }

    const { title, location, type, salary, salaryMin, salaryMax, description, requirements, skills } = req.body;

    const jobSalary = salary || { min: salaryMin || 0, max: salaryMax || 0 };

    const job = new Job({
      title,
      company: req.user.company || req.user.name,
      location,
      type: type || 'Full-time',
      salary: jobSalary,
      description,
      requirements: requirements || [],
      skills: skills || [],
      employer: req.user._id
    });

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs/:id/apply
router.post('/:id/apply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can apply' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = job.applicants.some(a => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    job.applicants.push({
      user: req.user._id,
      coverLetter: req.body.coverLetter || ''
    });

    await job.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id/candidates - employer view candidates
router.get('/:id/candidates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can view candidates' });
    }

    const job = await Job.findById(req.params.id).populate('applicants.user', 'name email skills experience location');

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const candidates = job.applicants.map(app => {
      const appObj = app.toObject();
      if (app.user && app.user.skills) {
        const { score, matchedSkills, missingSkills } = computeMatchScore(app.user.skills, job.skills);
        appObj.matchScore = score;
        appObj.matchedSkills = matchedSkills;
        appObj.missingSkills = missingSkills;
      } else {
        appObj.matchScore = 0;
        appObj.matchedSkills = [];
        appObj.missingSkills = job.skills;
      }
      return appObj;
    });

    candidates.sort((a, b) => b.matchScore - a.matchScore);
    res.json(candidates);
  } catch (err) {
    console.error('Get candidates error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/jobs/:id/candidates/:userId/status
router.put('/:id/candidates/:userId/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can update status' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applicant = job.applicants.find(a => a.user.toString() === req.params.userId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = req.body.status;
    await job.save();

    res.json({ message: 'Status updated', status: req.body.status });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs/:id/cover-letter
router.post('/:id/cover-letter', auth, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can generate cover letters' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const user = req.user;

    // Try OpenAI if key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Write a professional cover letter for a job application.
Applicant: ${user.name}
Skills: ${user.skills.join(', ')}
Experience: ${user.experience || 'Not specified'}
Job Title: ${job.title}
Company: ${job.company}
Job Requirements: ${job.requirements.join(', ')}
Required Skills: ${job.skills.join(', ')}

Write a concise, professional cover letter (3-4 paragraphs).`
          }],
          max_tokens: 600
        });

        return res.json({ coverLetter: completion.choices[0].message.content, source: 'ai' });
      } catch (aiErr) {
        console.error('OpenAI error, falling back to template:', aiErr.message);
      }
    }

    // Template fallback
    const matchedSkills = user.skills.filter(s =>
      job.skills.some(js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase()))
    );

    const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background and expertise in ${user.skills.slice(0, 3).join(', ')}${user.skills.length > 3 ? ' and more' : ''}, I am confident in my ability to make a meaningful contribution to your team.

${user.experience ? `In my professional experience, ${user.experience.slice(0, 300)}${user.experience.length > 300 ? '...' : ''}` : 'Throughout my career, I have developed a strong foundation in the technologies and methodologies required for this role.'}

${matchedSkills.length > 0 ? `I am particularly excited about this opportunity because my skills in ${matchedSkills.join(', ')} directly align with your requirements. ` : ''}I am eager to bring my expertise to ${job.company} and contribute to your team's success. The role's focus on ${job.skills.slice(0, 2).join(' and ')} aligns perfectly with my career goals and passion.

I would welcome the opportunity to discuss how my skills and experience can benefit your team. Thank you for considering my application, and I look forward to hearing from you.

Sincerely,
${user.name}`;

    res.json({ coverLetter, source: 'template' });
  } catch (err) {
    console.error('Cover letter error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

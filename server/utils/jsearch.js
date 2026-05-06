const https = require('https');

const JSEARCH_HOST = 'jsearch.p.rapidapi.com';

function mapEmploymentType(type) {
  if (!type) return 'Full-time';
  const map = {
    'FULLTIME': 'Full-time',
    'PARTTIME': 'Part-time',
    'CONTRACTOR': 'Contract',
    'INTERN': 'Internship',
  };
  return map[type] || 'Full-time';
}

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'Java', 'TypeScript', 'React', 'Angular', 'Vue',
  'Node.js', 'Next.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'SQL',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS',
  'Tailwind', 'GraphQL', 'REST', 'C++', 'C#', '.NET', 'Ruby', 'Go', 'Rust',
  'Swift', 'Kotlin', 'PHP', 'Django', 'Flask', 'Spring', 'TensorFlow',
  'PyTorch', 'Machine Learning', 'AI', 'NLP', 'Redis', 'Linux', 'CI/CD',
  'Terraform', 'Agile', 'Scrum', 'React Native', 'Redux', 'Sass', 'Jest',
  'Cypress', 'Webpack', 'Figma', 'NoSQL', 'Firebase', 'Elasticsearch',
  'Kafka', 'RabbitMQ', 'Jenkins', 'Ansible', 'Prometheus', 'Grafana',
];

function extractSkills(job) {
  if (job.job_required_skills && job.job_required_skills.length > 0) {
    return job.job_required_skills;
  }
  const found = new Set();
  let text = job.job_description || '';
  if (job.job_highlights) {
    if (job.job_highlights.Qualifications) text += ' ' + job.job_highlights.Qualifications.join(' ');
    if (job.job_highlights.Responsibilities) text += ' ' + job.job_highlights.Responsibilities.join(' ');
  }
  const lower = text.toLowerCase();
  for (const skill of COMMON_SKILLS) {
    if (lower.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }
  return Array.from(found);
}

function transformJob(job) {
  const location = [job.job_city, job.job_state].filter(Boolean).join(', ') || 'Remote';
  return {
    _id: `jsearch_${job.job_id}`,
    title: job.job_title || 'Untitled',
    company: job.employer_name || 'Unknown Company',
    location,
    type: job.job_is_remote ? 'Remote' : mapEmploymentType(job.job_employment_type),
    salary: {
      min: job.job_min_salary || 0,
      max: job.job_max_salary || 0,
    },
    salaryMin: job.job_min_salary || 0,
    salaryMax: job.job_max_salary || 0,
    description: job.job_description || '',
    requirements: (job.job_highlights && job.job_highlights.Qualifications) || [],
    skills: extractSkills(job),
    applyLink: job.job_apply_link || '',
    employerLogo: job.employer_logo || null,
    source: 'jsearch',
    postedAt: job.job_posted_at_datetime_utc || new Date().toISOString(),
    createdAt: job.job_posted_at_datetime_utc || new Date().toISOString(),
  };
}

function fetchJSearchJobs(query) {
  return new Promise((resolve) => {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey || apiKey === 'optional') {
      return resolve([]);
    }

    const params = new URLSearchParams({
      query: query || 'software developer',
      num_pages: '1',
      country: 'us',
    });

    const options = {
      hostname: JSEARCH_HOST,
      path: `/search?${params.toString()}`,
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': JSEARCH_HOST,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const jobs = (parsed.data || []).map(transformJob);
          resolve(jobs);
        } catch {
          console.error('JSearch parse error');
          resolve([]);
        }
      });
    });

    req.on('error', (err) => {
      console.error('JSearch fetch error:', err.message);
      resolve([]);
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve([]);
    });

    req.end();
  });
}

module.exports = { fetchJSearchJobs, transformJob };

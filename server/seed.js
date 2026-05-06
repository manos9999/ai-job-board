const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-job-board';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Job.deleteMany({});
  console.log('Cleared existing data');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create employers
  const employers = await User.insertMany([
    {
      name: 'Sarah Chen',
      email: 'sarah@techcorp.com',
      password: hashedPassword,
      role: 'employer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA'
    },
    {
      name: 'James Rodriguez',
      email: 'james@innovatelabs.com',
      password: hashedPassword,
      role: 'employer',
      company: 'InnovateLabs',
      location: 'New York, NY'
    }
  ]);

  // Create job seekers
  const jobseekers = await User.insertMany([
    {
      name: 'Manohar Sharma',
      email: 'manohar@email.com',
      password: hashedPassword,
      role: 'jobseeker',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'TypeScript', 'CSS', 'HTML'],
      experience: '3 years of full-stack development experience building web applications with React and Node.js. Led a team of 3 developers on an e-commerce platform.',
      bio: 'Passionate full-stack developer with a focus on modern web technologies.',
      location: 'Austin, TX'
    },
    {
      name: 'Priya Patel',
      email: 'priya@email.com',
      password: hashedPassword,
      role: 'jobseeker',
      skills: ['Python', 'TensorFlow', 'Machine Learning', 'Data Analysis', 'SQL', 'Pandas', 'scikit-learn', 'NLP'],
      experience: '4 years in data science and machine learning. Built recommendation systems and NLP pipelines for Fortune 500 clients.',
      bio: 'Data scientist specializing in NLP and deep learning.',
      location: 'Seattle, WA'
    },
    {
      name: 'Alex Kim',
      email: 'alex@email.com',
      password: hashedPassword,
      role: 'jobseeker',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Python', 'Go'],
      experience: '5 years of DevOps and cloud engineering. Managed infrastructure for high-traffic SaaS platforms with 99.99% uptime.',
      bio: 'Cloud architect passionate about automation and reliability.',
      location: 'Denver, CO'
    }
  ]);

  // Create 25 sample jobs
  const jobs = await Job.insertMany([
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 130000, max: 170000 },
      description: 'We are looking for a Senior Frontend Developer to lead our web application development. You will work with our design team to implement responsive, high-performance user interfaces using React and modern web technologies.',
      requirements: ['5+ years frontend experience', 'Strong React proficiency', 'Experience with state management', 'Knowledge of web performance optimization'],
      skills: ['React', 'TypeScript', 'CSS', 'Redux', 'GraphQL', 'Jest'],
      employer: employers[0]._id
    },
    {
      title: 'Backend Engineer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 140000, max: 180000 },
      description: 'Join our backend team to build scalable APIs and microservices. You will design and implement server-side logic, database schemas, and integration with third-party services.',
      requirements: ['4+ years backend development', 'Experience with microservices', 'Strong database knowledge', 'API design experience'],
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'REST API'],
      employer: employers[0]._id
    },
    {
      title: 'Full Stack Developer',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 120000, max: 160000 },
      description: 'We need a versatile Full Stack Developer to work across our entire web platform. From React frontends to Node.js backends, you will own features end-to-end.',
      requirements: ['3+ years full-stack experience', 'Proficiency in JavaScript/TypeScript', 'Database design experience', 'Agile development experience'],
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript', 'HTML', 'CSS'],
      employer: employers[1]._id
    },
    {
      title: 'Data Scientist',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 150000, max: 200000 },
      description: 'Drive data-informed decision making by building ML models, conducting statistical analysis, and creating data pipelines. Work closely with product and engineering teams.',
      requirements: ['Masters or PhD in quantitative field', '3+ years industry experience', 'Published research is a plus', 'Strong communication skills'],
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'Pandas', 'Data Visualization'],
      employer: employers[0]._id
    },
    {
      title: 'ML Engineer',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 160000, max: 210000 },
      description: 'Build and deploy machine learning models at scale. Design ML pipelines, optimize model performance, and collaborate with data scientists to productionize research.',
      requirements: ['4+ years ML engineering', 'Experience deploying models to production', 'Strong software engineering skills', 'MLOps experience'],
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Docker', 'Kubernetes', 'MLflow', 'AWS'],
      employer: employers[1]._id
    },
    {
      title: 'DevOps Engineer',
      company: 'TechCorp Industries',
      location: 'Remote',
      type: 'Remote',
      salary: { min: 130000, max: 170000 },
      description: 'Manage and improve our cloud infrastructure, CI/CD pipelines, and deployment processes. Ensure high availability and security across all environments.',
      requirements: ['4+ years DevOps experience', 'Cloud certifications preferred', 'Infrastructure as code experience', 'On-call rotation participation'],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux', 'Monitoring'],
      employer: employers[0]._id
    },
    {
      title: 'Mobile Developer (React Native)',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 120000, max: 155000 },
      description: 'Build cross-platform mobile applications using React Native. Work on our flagship mobile app used by millions of users worldwide.',
      requirements: ['3+ years mobile development', 'React Native expertise', 'App Store deployment experience', 'Performance optimization skills'],
      skills: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Redux'],
      employer: employers[1]._id
    },
    {
      title: 'UI/UX Designer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 110000, max: 150000 },
      description: 'Design intuitive user experiences for our web and mobile products. Create wireframes, prototypes, and high-fidelity designs. Conduct user research and usability testing.',
      requirements: ['4+ years UI/UX design', 'Strong portfolio', 'User research experience', 'Design system experience'],
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'CSS', 'Design Systems'],
      employer: employers[0]._id
    },
    {
      title: 'Cloud Architect',
      company: 'InnovateLabs',
      location: 'Remote',
      type: 'Remote',
      salary: { min: 170000, max: 220000 },
      description: 'Design and implement cloud architecture for enterprise-scale applications. Lead cloud migration initiatives and establish best practices for cloud-native development.',
      requirements: ['7+ years cloud experience', 'Architecture certifications', 'Multi-cloud experience', 'Security best practices knowledge'],
      skills: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Microservices', 'Security', 'Networking'],
      employer: employers[1]._id
    },
    {
      title: 'Security Engineer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 150000, max: 195000 },
      description: 'Protect our systems and data by implementing security measures, conducting penetration testing, and responding to security incidents. Build security into our SDLC.',
      requirements: ['5+ years security experience', 'Security certifications (CISSP, CEH)', 'Incident response experience', 'Secure coding knowledge'],
      skills: ['Security', 'Penetration Testing', 'SIEM', 'Python', 'Networking', 'Cloud Security'],
      employer: employers[0]._id
    },
    {
      title: 'Junior Frontend Developer',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 75000, max: 95000 },
      description: 'Great opportunity for a junior developer to grow their frontend skills. You will work alongside senior developers building features for our web platform.',
      requirements: ['1+ years experience or bootcamp graduate', 'Basic React knowledge', 'HTML/CSS proficiency', 'Eagerness to learn'],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
      employer: employers[1]._id
    },
    {
      title: 'Data Engineer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 140000, max: 180000 },
      description: 'Build and maintain data pipelines that power our analytics and ML platforms. Design data models, optimize ETL processes, and ensure data quality.',
      requirements: ['3+ years data engineering', 'ETL pipeline experience', 'Big data tools experience', 'SQL expertise'],
      skills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'AWS', 'Data Modeling', 'ETL'],
      employer: employers[0]._id
    },
    {
      title: 'Product Manager - AI',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 140000, max: 185000 },
      description: 'Lead product strategy for our AI-powered features. Work with engineering, design, and data science teams to deliver innovative products to market.',
      requirements: ['5+ years product management', 'AI/ML product experience', 'Technical background preferred', 'Strong analytical skills'],
      skills: ['Product Management', 'AI/ML', 'Analytics', 'Agile', 'SQL', 'User Research'],
      employer: employers[1]._id
    },
    {
      title: 'QA Automation Engineer',
      company: 'TechCorp Industries',
      location: 'Remote',
      type: 'Remote',
      salary: { min: 100000, max: 135000 },
      description: 'Design and implement automated testing strategies for our web applications. Build test frameworks, write automated tests, and improve our CI/CD quality gates.',
      requirements: ['3+ years QA automation', 'Test framework experience', 'CI/CD integration experience', 'API testing experience'],
      skills: ['Selenium', 'Jest', 'Cypress', 'JavaScript', 'CI/CD', 'API Testing', 'Python'],
      employer: employers[0]._id
    },
    {
      title: 'Blockchain Developer',
      company: 'InnovateLabs',
      location: 'Remote',
      type: 'Contract',
      salary: { min: 150000, max: 200000 },
      description: 'Develop smart contracts and decentralized applications on Ethereum and other blockchains. Build secure, audited smart contracts for our DeFi platform.',
      requirements: ['3+ years blockchain development', 'Smart contract auditing experience', 'DeFi protocol knowledge', 'Security-first mindset'],
      skills: ['Solidity', 'Ethereum', 'Web3.js', 'Smart Contracts', 'JavaScript', 'Security'],
      employer: employers[1]._id
    },
    {
      title: 'iOS Developer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 130000, max: 170000 },
      description: 'Build native iOS applications with Swift. Work on our consumer-facing app and internal tools, focusing on performance and delightful user experiences.',
      requirements: ['4+ years iOS development', 'Swift expertise', 'App Store experience', 'Core Data knowledge'],
      skills: ['Swift', 'iOS', 'UIKit', 'SwiftUI', 'Core Data', 'Xcode'],
      employer: employers[0]._id
    },
    {
      title: 'Technical Writer',
      company: 'InnovateLabs',
      location: 'Remote',
      type: 'Part-time',
      salary: { min: 60000, max: 85000 },
      description: 'Create clear, comprehensive technical documentation for our developer platform. Write API docs, tutorials, and guides that help developers succeed.',
      requirements: ['2+ years technical writing', 'Developer documentation experience', 'API documentation expertise', 'Strong English skills'],
      skills: ['Technical Writing', 'API Documentation', 'Markdown', 'Git', 'Developer Tools'],
      employer: employers[1]._id
    },
    {
      title: 'NLP Research Engineer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 160000, max: 210000 },
      description: 'Research and develop state-of-the-art NLP models. Work on text understanding, generation, and information extraction for our AI products.',
      requirements: ['PhD in NLP/ML or equivalent experience', 'Published NLP research', 'Transformer model experience', 'Strong Python skills'],
      skills: ['NLP', 'Python', 'TensorFlow', 'PyTorch', 'Transformers', 'Machine Learning', 'Deep Learning'],
      employer: employers[0]._id
    },
    {
      title: 'Site Reliability Engineer',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 145000, max: 185000 },
      description: 'Ensure the reliability and performance of our production systems. Build monitoring, alerting, and automated remediation. Drive SLO/SLI culture.',
      requirements: ['4+ years SRE/DevOps', 'On-call experience', 'Incident management experience', 'Automation mindset'],
      skills: ['Kubernetes', 'AWS', 'Prometheus', 'Go', 'Python', 'Terraform', 'Linux'],
      employer: employers[1]._id
    },
    {
      title: 'Frontend Intern',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Internship',
      salary: { min: 40000, max: 55000 },
      description: 'Summer internship for students interested in frontend development. You will learn React, work on real features, and receive mentorship from senior engineers.',
      requirements: ['Currently enrolled in CS program', 'Basic JavaScript knowledge', 'Portfolio or projects', 'Enthusiastic learner'],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
      employer: employers[0]._id
    },
    {
      title: 'Go Backend Developer',
      company: 'InnovateLabs',
      location: 'Remote',
      type: 'Remote',
      salary: { min: 140000, max: 180000 },
      description: 'Build high-performance backend services in Go. Design and implement APIs, work with distributed systems, and optimize for scale.',
      requirements: ['3+ years Go experience', 'Distributed systems knowledge', 'API design experience', 'Performance optimization'],
      skills: ['Go', 'gRPC', 'PostgreSQL', 'Redis', 'Docker', 'Microservices'],
      employer: employers[1]._id
    },
    {
      title: 'Computer Vision Engineer',
      company: 'TechCorp Industries',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: { min: 155000, max: 200000 },
      description: 'Develop computer vision algorithms for object detection, image segmentation, and visual search. Deploy models to production at scale.',
      requirements: ['3+ years CV experience', 'Deep learning expertise', 'Model optimization experience', 'Production ML experience'],
      skills: ['Python', 'PyTorch', 'OpenCV', 'Computer Vision', 'Deep Learning', 'CUDA'],
      employer: employers[0]._id
    },
    {
      title: 'Platform Engineer',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 135000, max: 175000 },
      description: 'Build and maintain our internal developer platform. Create tools, workflows, and infrastructure that accelerate engineering productivity.',
      requirements: ['4+ years platform/infra experience', 'CI/CD expertise', 'Developer tooling experience', 'Strong coding skills'],
      skills: ['Kubernetes', 'Docker', 'CI/CD', 'Python', 'Go', 'AWS', 'Terraform'],
      employer: employers[1]._id
    },
    {
      title: 'React Native Developer',
      company: 'TechCorp Industries',
      location: 'Remote',
      type: 'Contract',
      salary: { min: 110000, max: 145000 },
      description: 'Contract role to build new features for our React Native mobile app. 6-month engagement with potential to convert to full-time.',
      requirements: ['2+ years React Native', 'Cross-platform experience', 'REST API integration', 'App Store deployment'],
      skills: ['React Native', 'JavaScript', 'TypeScript', 'React', 'Mobile Development'],
      employer: employers[0]._id
    },
    {
      title: 'Database Administrator',
      company: 'InnovateLabs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: { min: 120000, max: 155000 },
      description: 'Manage and optimize our database infrastructure including PostgreSQL and MongoDB clusters. Ensure data integrity, performance, and disaster recovery.',
      requirements: ['5+ years DBA experience', 'PostgreSQL expertise', 'Replication and sharding experience', 'Backup/recovery planning'],
      skills: ['PostgreSQL', 'MongoDB', 'SQL', 'Database Optimization', 'Linux', 'Backup/Recovery'],
      employer: employers[1]._id
    }
  ]);

  // Create some applications
  const job3 = await Job.findById(jobs[2]._id); // Full Stack Developer
  job3.applicants.push(
    { user: jobseekers[0]._id, status: 'reviewed', coverLetter: 'I am excited to apply for this Full Stack Developer role...' },
    { user: jobseekers[1]._id, status: 'pending' }
  );
  await job3.save();

  const job5 = await Job.findById(jobs[4]._id); // ML Engineer
  job5.applicants.push(
    { user: jobseekers[1]._id, status: 'accepted', coverLetter: 'With my background in ML and data science...' }
  );
  await job5.save();

  const job6 = await Job.findById(jobs[5]._id); // DevOps Engineer
  job6.applicants.push(
    { user: jobseekers[2]._id, status: 'pending', coverLetter: 'I bring 5 years of DevOps expertise...' }
  );
  await job6.save();

  const job0 = await Job.findById(jobs[0]._id); // Senior Frontend Developer
  job0.applicants.push(
    { user: jobseekers[0]._id, status: 'pending' }
  );
  await job0.save();

  console.log('\n--- Seed Complete ---');
  console.log('\nEmployer accounts:');
  console.log('  sarah@techcorp.com / password123 (TechCorp Industries)');
  console.log('  james@innovatelabs.com / password123 (InnovateLabs)');
  console.log('\nJob seeker accounts:');
  console.log('  manohar@email.com / password123 (Full Stack - JS/React/Node)');
  console.log('  priya@email.com / password123 (Data Science - Python/ML/NLP)');
  console.log('  alex@email.com / password123 (DevOps - AWS/Docker/K8s)');
  console.log(`\nCreated ${jobs.length} jobs`);
  console.log('Created sample applications\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

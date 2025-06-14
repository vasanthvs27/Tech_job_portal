import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// API endpoint for job search
app.post('/api/jobs', (req, res) => {
  const { keyword, location, sources, filters } = req.body;
  
  // Generate mock job data based on search criteria
  const jobs = generateMockJobs(keyword, location, sources, filters);
  
  res.json({ jobs });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Function to generate mock job data
function generateMockJobs(keyword = '', location = '', sources = ['indeed', 'glassdoor'], filters = {}) {
  // Sample job data for demonstration
  let sampleJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$100,000 - $130,000',
      jobType: 'Full-time',
      datePosted: '2 days ago',
      description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using React, implementing responsive designs, and collaborating with backend developers.',
      requirements: [
        'Proficient in JavaScript, HTML, CSS',
        '3+ years of experience with React',
        'Experience with state management libraries',
        'Understanding of responsive design principles'
      ],
      source: 'indeed',
      url: '#'
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'DataSystems Inc.',
      location: 'Remote',
      salary: '$120,000 - $150,000',
      jobType: 'Full-time',
      datePosted: '1 day ago',
      description: 'Join our engineering team to build scalable backend services. You will design and implement APIs, optimize database queries, and ensure high performance of our systems.',
      requirements: [
        'Strong experience with Node.js or Python',
        'Knowledge of SQL and NoSQL databases',
        'Experience with cloud services (AWS, GCP)',
        'Understanding of microservices architecture'
      ],
      source: 'glassdoor',
      url: '#'
    },
    {
      id: 3,
      title: 'Full Stack Developer',
      company: 'WebSolutions',
      location: 'New York, NY',
      salary: '$110,000 - $140,000',
      jobType: 'Contract',
      datePosted: '3 days ago',
      description: 'We are seeking a Full Stack Developer to join our team. You will work on both frontend and backend aspects of our applications, implementing new features and maintaining existing ones.',
      requirements: [
        'Experience with JavaScript frameworks (React, Angular, or Vue)',
        'Backend experience with Node.js, Python, or Java',
        'Database design and management',
        'Experience with RESTful APIs'
      ],
      source: 'indeed',
      url: '#'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Seattle, WA',
      salary: '$130,000 - $160,000',
      jobType: 'Full-time',
      datePosted: 'Just now',
      description: 'As a DevOps Engineer, you will be responsible for maintaining our cloud infrastructure, implementing CI/CD pipelines, and ensuring the reliability and scalability of our systems.',
      requirements: [
        'Experience with AWS, Azure, or GCP',
        'Knowledge of containerization (Docker, Kubernetes)',
        'Experience with CI/CD tools (Jenkins, GitLab CI)',
        'Infrastructure as Code (Terraform, CloudFormation)'
      ],
      source: 'glassdoor',
      url: '#'
    },
    {
      id: 5,
      title: 'UI/UX Designer',
      company: 'CreativeMinds',
      location: 'Austin, TX',
      salary: '$90,000 - $120,000',
      jobType: 'Full-time',
      datePosted: '1 week ago',
      description: 'We are looking for a talented UI/UX Designer to create amazing user experiences. You will collaborate with product managers and engineers to design intuitive interfaces for our web and mobile applications.',
      requirements: [
        'Portfolio demonstrating UI/UX projects',
        'Proficiency in design tools (Figma, Sketch)',
        'Understanding of user-centered design principles',
        'Experience with design systems'
      ],
      source: 'indeed',
      url: '#'
    },
    {
      id: 6,
      title: 'Data Scientist',
      company: 'AnalyticsPro',
      location: 'Chicago, IL',
      salary: '$115,000 - $145,000',
      jobType: 'Full-time',
      datePosted: '3 days ago',
      description: 'Join our data science team to analyze complex datasets and build predictive models. You will work on machine learning algorithms and collaborate with cross-functional teams to drive data-informed decisions.',
      requirements: [
        'Strong background in statistics and mathematics',
        'Experience with Python and data science libraries',
        'Knowledge of machine learning algorithms',
        'Experience with big data technologies'
      ],
      source: 'glassdoor',
      url: '#'
    },
    {
      id: 7,
      title: 'Product Manager',
      company: 'InnovateTech',
      location: 'Boston, MA',
      salary: '$125,000 - $155,000',
      jobType: 'Full-time',
      datePosted: '5 days ago',
      description: 'We are seeking an experienced Product Manager to lead the development of our software products. You will define product vision, gather requirements, and work closely with engineering and design teams.',
      requirements: [
        '3+ years of product management experience',
        'Strong analytical and problem-solving skills',
        'Excellent communication and stakeholder management',
        'Technical background preferred'
      ],
      source: 'indeed',
      url: '#'
    },
    {
      id: 8,
      title: 'QA Engineer',
      company: 'QualitySoft',
      location: 'Denver, CO',
      salary: '$85,000 - $110,000',
      jobType: 'Full-time',
      datePosted: '2 days ago',
      description: 'As a QA Engineer, you will be responsible for ensuring the quality of our software products. You will design and execute test plans, identify bugs, and collaborate with developers to resolve issues.',
      requirements: [
        'Experience with manual and automated testing',
        'Knowledge of testing methodologies',
        'Familiarity with test management tools',
        'Strong attention to detail'
      ],
      source: 'glassdoor',
      url: '#'
    },
    {
      id: 9,
      title: 'Mobile Developer (iOS)',
      company: 'AppWorks',
      location: 'Los Angeles, CA',
      salary: '$110,000 - $140,000',
      jobType: 'Full-time',
      datePosted: '1 week ago',
      description: 'We are looking for an iOS Developer to join our mobile team. You will be responsible for developing and maintaining iOS applications, implementing new features, and ensuring app performance.',
      requirements: [
        'Proficiency in Swift and iOS SDK',
        'Experience with iOS frameworks and APIs',
        'Understanding of mobile app architecture',
        'Knowledge of App Store submission process'
      ],
      source: 'indeed',
      url: '#'
    },
    {
      id: 10,
      title: 'Technical Project Manager',
      company: 'ProjectPro',
      location: 'Remote',
      salary: '$100,000 - $130,000',
      jobType: 'Contract',
      datePosted: '4 days ago',
      description: 'As a Technical Project Manager, you will oversee the planning and execution of software development projects. You will coordinate team activities, manage timelines, and ensure project success.',
      requirements: [
        'PMP certification preferred',
        'Experience managing software development projects',
        'Strong leadership and communication skills',
        'Technical background in software development'
      ],
      source: 'glassdoor',
      url: '#'
    }
  ];
  
  // Filter sample jobs based on search criteria if provided
  if (keyword || location || (sources && sources.length > 0)) {
    // Filter by keyword
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      sampleJobs = sampleJobs.filter(job => 
        job.title.toLowerCase().includes(keywordLower) || 
        job.company.toLowerCase().includes(keywordLower) || 
        job.description.toLowerCase().includes(keywordLower)
      );
    }
    
    // Filter by location
    if (location) {
      const locationLower = location.toLowerCase();
      sampleJobs = sampleJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    // Filter by sources
    if (sources && sources.length > 0) {
      sampleJobs = sampleJobs.filter(job => 
        sources.includes(job.source)
      );
    }
  }
  
  // Apply additional filters
  if (filters) {
    // Filter by date posted
    if (filters.datePosted && filters.datePosted !== 'any') {
      sampleJobs = sampleJobs.filter(job => {
        if (filters.datePosted === 'day') {
          return job.datePosted.includes('Just now') || job.datePosted.includes('1 day');
        } else if (filters.datePosted === 'week') {
          return job.datePosted.includes('Just now') || 
                 job.datePosted.includes('day') || 
                 (job.datePosted.includes('week') && parseInt(job.datePosted) === 1);
        } else if (filters.datePosted === 'month') {
          return !job.datePosted.includes('month') || parseInt(job.datePosted) <= 1;
        }
        return true;
      });
    }
    
    // Filter by job type
    if (filters.jobTypes && filters.jobTypes.length > 0) {
      sampleJobs = sampleJobs.filter(job => {
        const jobTypeLower = job.jobType.toLowerCase();
        return filters.jobTypes.some(type => jobTypeLower.includes(type.toLowerCase()));
      });
    }
  }
  
  return sampleJobs;
}
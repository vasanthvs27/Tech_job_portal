// DOM Elements
const searchForm = document.getElementById('search-form');
const keywordInput = document.getElementById('keyword');
const locationInput = document.getElementById('location');
const indeedCheckbox = document.getElementById('indeed');
const glassdoorCheckbox = document.getElementById('glassdoor');
const loadingIndicator = document.getElementById('loading');
const resultsCount = document.getElementById('results-count');
const jobList = document.getElementById('job-list');
const pagination = document.getElementById('pagination');
const sortBy = document.getElementById('sort-by');
const applyFilters = document.getElementById('apply-filters');
const modal = document.getElementById('job-detail-modal');
const closeModal = document.querySelector('.close');
const jobDetailContent = document.getElementById('job-detail-content');

// State
let currentJobs = [];
let currentPage = 1;
const jobsPerPage = 10;
let currentFilters = {
  datePosted: 'any',
  jobTypes: [],
  experienceLevels: []
};

// Event Listeners
searchForm.addEventListener('submit', handleSearch);
sortBy.addEventListener('change', handleSort);
applyFilters.addEventListener('click', applyFilterOptions);
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Initialize with sample data for demonstration
document.addEventListener('DOMContentLoaded', () => {
  // Simulate a search with sample data
  setTimeout(() => {
    fetchSampleJobs();
  }, 1000);
});

// Functions
async function handleSearch(e) {
  e.preventDefault();
  
  const keyword = keywordInput.value.trim();
  const location = locationInput.value.trim();
  const sources = [];
  
  if (indeedCheckbox.checked) sources.push('indeed');
  if (glassdoorCheckbox.checked) sources.push('glassdoor');
  
  if (keyword === '' && location === '') {
    alert('Please enter a keyword or location');
    return;
  }
  
  if (sources.length === 0) {
    alert('Please select at least one job source');
    return;
  }
  
  showLoading();
  
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        keyword,
        location,
        sources,
        filters: currentFilters
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }
    
    const data = await response.json();
    currentJobs = data.jobs;
    
    if (currentJobs.length === 0) {
      // No jobs found, show empty state
      displayJobs([]);
    } else {
      displayJobs(currentJobs);
    }
  } catch (error) {
    console.log('Error fetching jobs:', error.message);
    // For demonstration, use sample data on error
    fetchSampleJobs(keyword, location, sources);
  } finally {
    hideLoading();
  }
}

function fetchSampleJobs(keyword = '', location = '', sources = ['indeed', 'glassdoor']) {
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
  
  currentJobs = sampleJobs;
  displayJobs(currentJobs);
}

function displayJobs(jobs) {
  resultsCount.textContent = jobs.length;
  
  // Calculate pagination
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentPageJobs = jobs.slice(startIndex, endIndex);
  
  // Clear job list
  jobList.innerHTML = '';
  
  if (jobs.length === 0) {
    jobList.innerHTML = '<div class="no-results">No jobs found. Try adjusting your search criteria.</div>';
    pagination.innerHTML = '';
    return;
  }
  
  // Create job cards
  currentPageJobs.forEach(job => {
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';
    jobCard.dataset.id = job.id;
    
    jobCard.innerHTML = `
      <div class="job-card-header">
        <div>
          <h3 class="job-title">${job.title}</h3>
          <p class="company-name">${job.company}</p>
          <p class="job-location">${job.location}</p>
        </div>
        <span class="job-source ${job.source}">${job.source.charAt(0).toUpperCase() + job.source.slice(1)}</span>
      </div>
      <div class="job-details">
        <span class="job-detail">${job.jobType}</span>
        <span class="job-detail">${job.salary}</span>
        <span class="job-detail">${job.datePosted}</span>
      </div>
      <p class="job-description">${job.description}</p>
    `;
    
    jobCard.addEventListener('click', () => showJobDetails(job));
    
    jobList.appendChild(jobCard);
  });
  
  // Create pagination
  createPagination(totalPages);
}

function createPagination(totalPages) {
  pagination.innerHTML = '';
  
  if (totalPages <= 1) return;
  
  // Previous button
  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', () => {
      currentPage--;
      displayJobs(currentJobs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(prevButton);
  }
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.classList.add('active');
    }
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayJobs(currentJobs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(pageButton);
  }
  
  // Next button
  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
      currentPage++;
      displayJobs(currentJobs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(nextButton);
  }
}

function handleSort() {
  const sortValue = sortBy.value;
  
  if (sortValue === 'date') {
    currentJobs.sort((a, b) => {
      // Convert date strings to comparable values (simple approach for demo)
      const aDate = a.datePosted.includes('Just now') ? 0 : 
                   a.datePosted.includes('day') ? parseInt(a.datePosted) : 
                   a.datePosted.includes('week') ? parseInt(a.datePosted) * 7 : 30;
      
      const bDate = b.datePosted.includes('Just now') ? 0 : 
                   b.datePosted.includes('day') ? parseInt(b.datePosted) : 
                   b.datePosted.includes('week') ? parseInt(b.datePosted) * 7 : 30;
      
      return aDate - bDate;
    });
  } else if (sortValue === 'salary') {
    currentJobs.sort((a, b) => {
      // Extract min salary for sorting (simple approach for demo)
      const aMin = parseInt(a.salary.replace(/[^0-9]/g, '')) / 1000;
      const bMin = parseInt(b.salary.replace(/[^0-9]/g, '')) / 1000;
      
      return bMin - aMin;
    });
  } else {
    // Default to relevance (original order for demo)
    currentJobs.sort((a, b) => a.id - b.id);
  }
  
  currentPage = 1;
  displayJobs(currentJobs);
}

function applyFilterOptions() {
  // Get selected date filter
  const dateRadios = document.getElementsByName('date');
  for (const radio of dateRadios) {
    if (radio.checked) {
      currentFilters.datePosted = radio.value;
      break;
    }
  }
  
  // Get selected job types
  currentFilters.jobTypes = [];
  const jobTypeCheckboxes = document.querySelectorAll('.filter-group:nth-child(2) input[type="checkbox"]');
  jobTypeCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      currentFilters.jobTypes.push(checkbox.value);
    }
  });
  
  // Get selected experience levels
  currentFilters.experienceLevels = [];
  const expLevelCheckboxes = document.querySelectorAll('.filter-group:nth-child(3) input[type="checkbox"]');
  expLevelCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      currentFilters.experienceLevels.push(checkbox.value);
    }
  });
  
  // Filter jobs based on selected filters
  let filteredJobs = [...currentJobs];
  
  // Filter by date posted
  if (currentFilters.datePosted !== 'any') {
    filteredJobs = filteredJobs.filter(job => {
      if (currentFilters.datePosted === 'day') {
        return job.datePosted.includes('Just now') || job.datePosted.includes('1 day');
      } else if (currentFilters.datePosted === 'week') {
        return job.datePosted.includes('Just now') || 
               job.datePosted.includes('day') || 
               (job.datePosted.includes('week') && parseInt(job.datePosted) === 1);
      } else if (currentFilters.datePosted === 'month') {
        return !job.datePosted.includes('month') || parseInt(job.datePosted) <= 1;
      }
      return true;
    });
  }
  
  // Filter by job type
  if (currentFilters.jobTypes.length > 0) {
    filteredJobs = filteredJobs.filter(job => {
      const jobTypeLower = job.jobType.toLowerCase();
      return currentFilters.jobTypes.some(type => jobTypeLower.includes(type.toLowerCase()));
    });
  }
  
  // For demo purposes, we don't have experience level in our sample data
  // In a real application, you would filter by experience level here
  
  currentPage = 1;
  displayJobs(filteredJobs);
}

function showJobDetails(job) {
  jobDetailContent.innerHTML = `
    <div class="job-detail-header">
      <h2 class="job-detail-title">${job.title}</h2>
      <h3 class="job-detail-company">${job.company}</h3>
      <p class="job-detail-location">${job.location}</p>
      <div class="job-detail-meta">
        <div class="job-detail-meta-item">
          <span>Job Type:</span>
          <strong>${job.jobType}</strong>
        </div>
        <div class="job-detail-meta-item">
          <span>Salary:</span>
          <strong>${job.salary}</strong>
        </div>
        <div class="job-detail-meta-item">
          <span>Posted:</span>
          <strong>${job.datePosted}</strong>
        </div>
        <div class="job-detail-meta-item">
          <span>Source:</span>
          <strong>${job.source.charAt(0).toUpperCase() + job.source.slice(1)}</strong>
        </div>
      </div>
    </div>
    
    <div class="job-detail-description">
      <h3>Job Description</h3>
      <p>${job.description}</p>
      
      <h3>Requirements</h3>
      <ul>
        ${job.requirements.map(req => `<li>${req}</li>`).join('')}
      </ul>
    </div>
    
    <div class="job-detail-actions">
      <button class="apply-button">Apply Now</button>
      <button class="save-button">Save Job</button>
    </div>
  `;
  
  modal.style.display = 'block';
  
  // Add event listeners for buttons
  const applyButton = jobDetailContent.querySelector('.apply-button');
  const saveButton = jobDetailContent.querySelector('.save-button');
  
  applyButton.addEventListener('click', () => {
    // In a real application, this would redirect to the job application page
    window.open(job.url, '_blank');
  });
  
  saveButton.addEventListener('click', () => {
    // In a real application, this would save the job to the user's saved jobs
    saveButton.textContent = 'Saved';
    saveButton.disabled = true;
  });
}

function showLoading() {
  loadingIndicator.style.display = 'flex';
  jobList.style.display = 'none';
  pagination.style.display = 'none';
}

function hideLoading() {
  loadingIndicator.style.display = 'none';
  jobList.style.display = 'flex';
  pagination.style.display = 'flex';
}
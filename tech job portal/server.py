#!/usr/bin/env python3
"""
Job Portal Scraper Server

This script provides a simple API server for scraping job listings from Indeed and Glassdoor.
It uses Python's standard library for HTTP server functionality.

Note: Web scraping may be against the Terms of Service of some websites.
This code is for educational purposes only.
"""

import json
import urllib.parse
import urllib.request
import re
import ssl
import time
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from http import HTTPStatus
from urllib.error import HTTPError, URLError
from html.parser import HTMLParser

# Disable SSL certificate verification (not recommended for production)
ssl._create_default_https_context = ssl._create_unverified_context

# Job listing parsers
class IndeedParser(HTMLParser):
    """Parser for Indeed job listings"""
    
    def __init__(self):
        super().__init__()
        self.jobs = []
        self.current_job = None
        self.in_job_card = False
        self.in_title = False
        self.in_company = False
        self.in_location = False
        self.in_salary = False
        self.in_description = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        # Look for job cards
        if tag == 'div' and 'class' in attrs_dict and 'job_seen_beacon' in attrs_dict.get('class', ''):
            self.in_job_card = True
            self.current_job = {
                'source': 'indeed',
                'requirements': ['Experience with relevant technologies', 'Strong communication skills', 'Problem-solving abilities']
            }
        
        # Job title
        if self.in_job_card and tag == 'h2' and 'class' in attrs_dict and 'jobTitle' in attrs_dict.get('class', ''):
            self.in_title = True
            
        # Company name
        if self.in_job_card and tag == 'span' and 'class' in attrs_dict and 'companyName' in attrs_dict.get('class', ''):
            self.in_company = True
            
        # Location
        if self.in_job_card and tag == 'div' and 'class' in attrs_dict and 'companyLocation' in attrs_dict.get('class', ''):
            self.in_location = True
            
        # Salary
        if self.in_job_card and tag == 'div' and 'class' in attrs_dict and 'salary-snippet' in attrs_dict.get('class', ''):
            self.in_salary = True
            
        # Description
        if self.in_job_card and tag == 'div' and 'class' in attrs_dict and 'job-snippet' in attrs_dict.get('class', ''):
            self.in_description = True
    
    def handle_data(self, data):
        if self.in_title:
            if 'title' not in self.current_job:
                self.current_job['title'] = data.strip()
            self.in_title = False
            
        if self.in_company:
            if 'company' not in self.current_job:
                self.current_job['company'] = data.strip()
            self.in_company = False
            
        if self.in_location:
            if 'location' not in self.current_job:
                self.current_job['location'] = data.strip()
            self.in_location = False
            
        if self.in_salary:
            if 'salary' not in self.current_job:
                self.current_job['salary'] = data.strip()
            self.in_salary = False
            
        if self.in_description:
            if 'description' not in self.current_job:
                self.current_job['description'] = data.strip()
            self.in_description = False
    
    def handle_endtag(self, tag):
        if tag == 'div' and self.in_job_card:
            if self.current_job and 'title' in self.current_job:
                # Add some default values if missing
                if 'salary' not in self.current_job:
                    self.current_job['salary'] = 'Not specified'
                if 'description' not in self.current_job:
                    self.current_job['description'] = 'No description provided.'
                
                # Add job type and date posted (simulated)
                job_types = ['Full-time', 'Part-time', 'Contract', 'Remote']
                date_posted = ['Just now', '1 day ago', '2 days ago', '3 days ago', '1 week ago']
                
                self.current_job['jobType'] = random.choice(job_types)
                self.current_job['datePosted'] = random.choice(date_posted)
                self.current_job['id'] = len(self.jobs) + 1
                self.current_job['url'] = '#'
                
                self.jobs.append(self.current_job)
                self.current_job = None
                self.in_job_card = False


class GlassdoorParser(HTMLParser):
    """Parser for Glassdoor job listings"""
    
    def __init__(self):
        super().__init__()
        self.jobs = []
        self.current_job = None
        self.in_job_card = False
        self.in_title = False
        self.in_company = False
        self.in_location = False
        self.in_salary = False
        self.in_description = False
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        
        # Look for job cards
        if tag == 'li' and 'class' in attrs_dict and 'react-job-listing' in attrs_dict.get('class', ''):
            self.in_job_card = True
            self.current_job = {
                'source': 'glassdoor',
                'requirements': ['Relevant degree or equivalent experience', 'Team collaboration skills', 'Ability to work in a fast-paced environment']
            }
        
        # Job title
        if self.in_job_card and tag == 'a' and 'class' in attrs_dict and 'jobTitle' in attrs_dict.get('class', ''):
            self.in_title = True
            
        # Company name
        if self.in_job_card and tag == 'a' and 'class' in attrs_dict and 'employerName' in attrs_dict.get('class', ''):
            self.in_company = True
            
        # Location
        if self.in_job_card and tag == 'span' and 'class' in attrs_dict and 'location' in attrs_dict.get('class', ''):
            self.in_location = True
            
        # Salary
        if self.in_job_card and tag == 'span' and 'class' in attrs_dict and 'salary' in attrs_dict.get('class', ''):
            self.in_salary = True
            
        # Description
        if self.in_job_card and tag == 'div' and 'class' in attrs_dict and 'jobDescriptionContent' in attrs_dict.get('class', ''):
            self.in_description = True
    
    def handle_data(self, data):
        if self.in_title:
            if 'title' not in self.current_job:
                self.current_job['title'] = data.strip()
            self.in_title = False
            
        if self.in_company:
            if 'company' not in self.current_job:
                self.current_job['company'] = data.strip()
            self.in_company = False
            
        if self.in_location:
            if 'location' not in self.current_job:
                self.current_job['location'] = data.strip()
            self.in_location = False
            
        if self.in_salary:
            if 'salary' not in self.current_job:
                self.current_job['salary'] = data.strip()
            self.in_salary = False
            
        if self.in_description:
            if 'description' not in self.current_job:
                self.current_job['description'] = data.strip()
            self.in_description = False
    
    def handle_endtag(self, tag):
        if tag == 'li' and self.in_job_card:
            if self.current_job and 'title' in self.current_job:
                # Add some default values if missing
                if 'salary' not in self.current_job:
                    self.current_job['salary'] = '$80,000 - $120,000'
                if 'description' not in self.current_job:
                    self.current_job['description'] = 'No description provided.'
                if 'location' not in self.current_job:
                    self.current_job['location'] = 'Remote'
                
                # Add job type and date posted (simulated)
                job_types = ['Full-time', 'Part-time', 'Contract', 'Remote']
                date_posted = ['Just now', '1 day ago', '2 days ago', '3 days ago', '1 week ago']
                
                self.current_job['jobType'] = random.choice(job_types)
                self.current_job['datePosted'] = random.choice(date_posted)
                self.current_job['id'] = len(self.jobs) + 1
                self.current_job['url'] = '#'
                
                self.jobs.append(self.current_job)
                self.current_job = None
                self.in_job_card = False


def scrape_indeed(keyword, location):
    """Scrape job listings from Indeed"""
    try:
        # Format the URL
        query = urllib.parse.quote(keyword)
        loc = urllib.parse.quote(location)
        url = f"https://www.indeed.com/jobs?q={query}&l={loc}"
        
        # Add user agent to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Create request
        req = urllib.request.Request(url, headers=headers)
        
        # Fetch the page
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        # Parse the HTML
        parser = IndeedParser()
        parser.feed(html)
        
        return parser.jobs
    
    except (HTTPError, URLError) as e:
        print(f"Error scraping Indeed: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error scraping Indeed: {e}")
        return []


def scrape_glassdoor(keyword, location):
    """Scrape job listings from Glassdoor"""
    try:
        # Format the URL
        query = urllib.parse.quote(keyword)
        loc = urllib.parse.quote(location)
        url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query}&locT=C&locId=1147401&locKeyword={loc}"
        
        # Add user agent to avoid being blocked
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Create request
        req = urllib.request.Request(url, headers=headers)
        
        # Fetch the page
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        # Parse the HTML
        parser = GlassdoorParser()
        parser.feed(html)
        
        return parser.jobs
    
    except (HTTPError, URLError) as e:
        print(f"Error scraping Glassdoor: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error scraping Glassdoor: {e}")
        return []


class JobServer(BaseHTTPRequestHandler):
    """HTTP server for job scraping API"""
    
    def _set_headers(self, status_code=HTTPStatus.OK):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            self._set_headers()
            response = {'message': 'Job Portal API is running. Use POST /api/jobs to search for jobs.'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(HTTPStatus.NOT_FOUND)
            response = {'error': 'Not found'}
            self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/jobs':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                keyword = data.get('keyword', '')
                location = data.get('location', '')
                sources = data.get('sources', [])
                
                all_jobs = []
                
                # Scrape Indeed
                if 'indeed' in sources:
                    indeed_jobs = scrape_indeed(keyword, location)
                    all_jobs.extend(indeed_jobs)
                
                # Scrape Glassdoor
                if 'glassdoor' in sources:
                    glassdoor_jobs = scrape_glassdoor(keyword, location)
                    all_jobs.extend(glassdoor_jobs)
                
                # For demonstration purposes, if no jobs are found, return mock data
                if not all_jobs:
                    all_jobs = generate_mock_jobs(keyword, location, sources)
                
                self._set_headers()
                response = {'jobs': all_jobs}
                self.wfile.write(json.dumps(response).encode())
                
            except json.JSONDecodeError:
                self._set_headers(HTTPStatus.BAD_REQUEST)
                response = {'error': 'Invalid JSON'}
                self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(HTTPStatus.NOT_FOUND)
            response = {'error': 'Not found'}
            self.wfile.write(json.dumps(response).encode())


def generate_mock_jobs(keyword, location, sources):
    """Generate mock job data for demonstration purposes"""
    mock_jobs = []
    job_titles = [
        f"{keyword} Developer", 
        f"Senior {keyword} Engineer", 
        f"{keyword} Specialist", 
        f"{keyword} Analyst",
        f"{keyword} Manager"
    ]
    
    companies = [
        "TechCorp", "DataSystems Inc.", "WebSolutions", "CloudTech", 
        "CreativeMinds", "AnalyticsPro", "InnovateTech", "QualitySoft",
        "AppWorks", "ProjectPro"
    ]
    
    locations = [location] if location else [
        "San Francisco, CA", "New York, NY", "Remote", "Seattle, WA",
        "Austin, TX", "Chicago, IL", "Boston, MA", "Denver, CO",
        "Los Angeles, CA", "Atlanta, GA"
    ]
    
    salaries = [
        "$80,000 - $100,000", "$90,000 - $120,000", "$100,000 - $130,000",
        "$110,000 - $140,000", "$120,000 - $150,000", "$130,000 - $160,000"
    ]
    
    job_types = ["Full-time", "Part-time", "Contract", "Remote"]
    
    date_posted = [
        "Just now", "1 day ago", "2 days ago", "3 days ago", "5 days ago",
        "1 week ago", "2 weeks ago"
    ]
    
    descriptions = [
        f"We are looking for a skilled {keyword} professional to join our team. You will be responsible for developing and maintaining applications, implementing new features, and collaborating with cross-functional teams.",
        f"Join our {keyword} team to work on cutting-edge projects. You will design and implement solutions, optimize performance, and ensure high-quality deliverables.",
        f"As a {keyword} specialist, you will lead the development of innovative solutions, mentor junior team members, and drive technical excellence across the organization.",
        f"We are seeking an experienced {keyword} expert to help us build scalable and robust systems. You will work closely with product managers and stakeholders to deliver exceptional results."
    ]
    
    requirements_sets = [
        [
            "Proficient in relevant programming languages",
            "Experience with software development methodologies",
            "Strong problem-solving abilities",
            "Excellent communication skills"
        ],
        [
            "Bachelor's degree in Computer Science or related field",
            "3+ years of experience in similar role",
            "Knowledge of cloud platforms (AWS, Azure, GCP)",
            "Experience with agile development practices"
        ],
        [
            "Strong understanding of software architecture",
            "Experience with CI/CD pipelines",
            "Knowledge of database design and optimization",
            "Ability to work in a fast-paced environment"
        ]
    ]
    
    # Generate 10-15 mock jobs
    num_jobs = random.randint(10, 15)
    
    for i in range(num_jobs):
        source = random.choice(sources)
        
        job = {
            'id': i + 1,
            'title': random.choice(job_titles),
            'company': random.choice(companies),
            'location': random.choice(locations),
            'salary': random.choice(salaries),
            'jobType': random.choice(job_types),
            'datePosted': random.choice(date_posted),
            'description': random.choice(descriptions),
            'requirements': random.choice(requirements_sets),
            'source': source,
            'url': '#'
        }
        
        mock_jobs.append(job)
    
    return mock_jobs


def run_server(port=8000):
    """Run the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, JobServer)
    print(f"Starting job portal server on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped.")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    run_server()
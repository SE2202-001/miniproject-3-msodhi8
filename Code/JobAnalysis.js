document.addEventListener('DOMContentLoaded', function() {
    let jobs = [];
    let filteredJobs = [];
    let levels = new Set();
    let types = new Set();
    let skills = new Set();

    const fileInput = document.getElementById('file-input');
    const jobList = document.getElementById('job-list');
    const levelFilter = document.getElementById('level-filter');
    const typeFilter = document.getElementById('type-filter');
    const skillFilter = document.getElementById('skill-filter');
    const sortSelect = document.getElementById('sort-select');
    const errorMessage = document.getElementById('error-message');
    const contentSection = document.getElementById('content');

    const jobDetails = document.getElementById('job-details');
    const jobTitle = document.getElementById('job-title');
    const jobPosted = document.getElementById('job-posted');
    const jobType = document.getElementById('job-type');
    const jobLevel = document.getElementById('job-level');
    const jobSkill = document.getElementById('job-skill');
    const jobDetailText = document.getElementById('job-detail-text');
    const jobEstimatedTime = document.getElementById('job-estimated-time');
    const jobPageLink = document.getElementById('job-page-link');

    class Job {
        constructor(data) {
            this.jobNo = data["Job No"] || '';
            this.title = data["Title"] || '';
            this.jobPageLink = data["Job Page Link"] || '#';
            this.posted = data["Posted"] || '';
            this.type = data["Type"] || '';
            this.level = data["Level"] || '';
            this.estimatedTime = data["Estimated Time"] || '';
            this.skill = data["Skill"] || '';
            this.detail = data["Detail"] || '';
            this.postedTimeValue = this.parsePostedTime(this.posted);
        }

        parsePostedTime(postedStr) {
            const now = new Date();
            const regex = /(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i;
            const match = regex.exec(postedStr);
            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2].toLowerCase();
                switch (unit) {
                    case 'minute':
                        return new Date(now - value * 60 * 1000);
                    case 'hour':
                        return new Date(now - value * 60 * 60 * 1000);
                    case 'day':
                        return new Date(now - value * 24 * 60 * 60 * 1000);
                    case 'week':
                        return new Date(now - value * 7 * 24 * 60 * 60 * 1000);
                    case 'month':
                        return new Date(now - value * 30 * 24 * 60 * 60 * 1000);
                    case 'year':
                        return new Date(now - value * 365 * 24 * 60 * 60 * 1000);
                    default:
                        return now;
                }
            } else if (postedStr.toLowerCase().includes('just now')) {
                return now;
            } else {
                return now; 
            }
        }
    }

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            errorMessage.textContent = '';
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!Array.isArray(data)) {
                        throw new Error('Invalid data format: Expected an array of job listings.');
                    }
                    jobs = data.map(jobData => new Job(jobData));
                    populateFilters();
                    applyFiltersAndSorting();
                    contentSection.style.display = 'block';
                } catch (error) {
                    errorMessage.textContent = 'Error loading data: ' + error.message;
                }
            };
            reader.onerror = function() {
                errorMessage.textContent = 'Error reading file';
            };
            reader.readAsText(file);
        } else {
            errorMessage.textContent = 'No file selected';
        }
    });

    function populateFilters() {
        levels.clear();
        types.clear();
        skills.clear();
        jobs.forEach(job => {
            if (job.level) levels.add(job.level);
            if (job.type) types.add(job.type);
            if (job.skill) skills.add(job.skill);
        });

        populateFilterOptions(levelFilter, levels);
        populateFilterOptions(typeFilter, types);
        populateFilterOptions(skillFilter, skills);
    }

    function populateFilterOptions(selectElement, optionsSet) {
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        optionsSet.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            selectElement.appendChild(option);
        });
    }

    levelFilter.addEventListener('change', applyFiltersAndSorting);
    typeFilter.addEventListener('change', applyFiltersAndSorting);
    skillFilter.addEventListener('change', applyFiltersAndSorting);
    sortSelect.addEventListener('change', applyFiltersAndSorting);

    function applyFiltersAndSorting() {
        const levelValue = levelFilter.value;
        const typeValue = typeFilter.value;
        const skillValue = skillFilter.value;
        const sortValue = sortSelect.value;

        filteredJobs = jobs.filter(job => {
            return (levelValue === '' || job.level === levelValue) &&
                   (typeValue === '' || job.type === typeValue) &&
                   (skillValue === '' || job.skill === skillValue);
        });

        if (sortValue === 'titleAZ') {
            filteredJobs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortValue === 'titleZA') {
            filteredJobs.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortValue === 'postedTimeNewest') {
            filteredJobs.sort((a, b) => b.postedTimeValue - a.postedTimeValue);
        } else if (sortValue === 'postedTimeOldest') {
            filteredJobs.sort((a, b) => a.postedTimeValue - b.postedTimeValue);
        }

        displayJobList();
    }

    function displayJobList() {
        jobList.innerHTML = '';
        filteredJobs.forEach((job) => {
            const li = document.createElement('li');
            li.textContent = job.title;
            li.addEventListener('click', () => showJobDetails(job));
            jobList.appendChild(li);
        });
    }

    function showJobDetails(job) {
        jobTitle.textContent = job.title;
        jobPosted.textContent = job.posted;
        jobType.textContent = job.type;
        jobLevel.textContent = job.level;
        jobSkill.textContent = job.skill;
        jobDetailText.textContent = job.detail;
        jobEstimatedTime.textContent = job.estimatedTime;
        jobPageLink.href = job.jobPageLink;
        jobDetails.style.display = 'block';
        jobDetails.scrollIntoView({ behavior: 'smooth' });
    }
});
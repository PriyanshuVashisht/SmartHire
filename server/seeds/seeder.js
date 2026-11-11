require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Company = require('../models/Company');
const RecruiterProfile = require('../models/RecruiterProfile');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { calculateCandidateJobMatch } = require('../services/recommendationEngine');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing old collections...');
    await Promise.all([
      User.deleteMany(),
      Company.deleteMany(),
      RecruiterProfile.deleteMany(),
      CandidateProfile.deleteMany(),
      Job.deleteMany(),
      Application.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seeder] Creating Administrator...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@smarthire.dev',
      password: 'Password123!',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    console.log('[Seeder] Creating Companies...');
    const google = await Company.create({
      name: 'Google India',
      website: 'https://google.com',
      industry: 'Technology & Cloud',
      size: '1000+',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      description: 'Global technology leader specializing in search engine, cloud computing, and hardware.',
      location: 'Bengaluru, Karnataka',
      headquarters: 'Mountain View, California',
      foundedYear: 1998,
      verified: true,
    });

    const stripe = await Company.create({
      name: 'Stripe',
      website: 'https://stripe.com',
      industry: 'FinTech',
      size: '1000+',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
      description: 'Financial infrastructure for the internet. Millions of companies use Stripe to accept payments.',
      location: 'Bengaluru, Remote',
      headquarters: 'San Francisco, CA',
      foundedYear: 2010,
      verified: true,
    });

    const nextGenAI = await Company.create({
      name: 'NextGen AI Labs',
      website: 'https://nextgenai.io',
      industry: 'Artificial Intelligence',
      size: '51-200',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      description: 'Pioneering frontier generative AI models and intelligent enterprise solutions.',
      location: 'Bengaluru, Karnataka',
      headquarters: 'Bengaluru, India',
      foundedYear: 2022,
      verified: true,
    });

    console.log('[Seeder] Creating Recruiters...');
    const recruiter1User = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@smarthire.dev',
      password: 'Password123!',
      role: 'recruiter',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    });
    await RecruiterProfile.create({
      user: recruiter1User._id,
      company: google._id,
      designation: 'Senior Technical Talent Partner',
      department: 'Cloud & AI Engineering',
      phone: '+91 98765 43210',
      verified: true,
    });
    google.recruiters.push(recruiter1User._id);
    await google.save();

    const recruiter2User = await User.create({
      name: 'David Chen',
      email: 'recruiter2@smarthire.dev',
      password: 'Password123!',
      role: 'recruiter',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    });
    await RecruiterProfile.create({
      user: recruiter2User._id,
      company: stripe._id,
      designation: 'Lead Engineering Recruiter',
      department: 'Platform Infrastructure',
      phone: '+91 98111 22334',
      verified: true,
    });
    stripe.recruiters.push(recruiter2User._id);
    await stripe.save();

    console.log('[Seeder] Creating Candidates...');
    // Candidate 1: Rahul Sharma (MERN Full Stack, ideal match for MERN job)
    const rahulUser = await User.create({
      name: 'Rahul Sharma',
      email: 'candidate@smarthire.dev',
      password: 'Password123!',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    });
    const rahulProfile = await CandidateProfile.create({
      user: rahulUser._id,
      headline: 'Full Stack MERN Developer | React, Node.js, Express & MongoDB Specialist',
      bio: 'Enthusiastic full-stack engineer with 2 years of experience crafting scalable web applications, REST APIs, and responsive frontends using the modern JavaScript ecosystem.',
      phone: '+91 91234 56789',
      location: 'Bengaluru, India',
      totalExperienceYears: 2.0,
      jobPreferences: {
        roles: ['Full Stack Developer', 'MERN Stack Developer', 'Software Engineer', 'Frontend Engineer'],
        types: ['full-time', 'internship'],
        preferredLocations: ['Bengaluru', 'Remote'],
        remoteOnly: false,
        expectedSalary: { min: 800000, max: 1500000, currency: 'INR' },
      },
      skills: [
        { name: 'JavaScript', level: 'expert', category: 'Language' },
        { name: 'TypeScript', level: 'intermediate', category: 'Language' },
        { name: 'React', level: 'expert', category: 'Frontend' },
        { name: 'Node.js', level: 'expert', category: 'Backend' },
        { name: 'Express', level: 'expert', category: 'Backend' },
        { name: 'MongoDB', level: 'expert', category: 'Database' },
        { name: 'Tailwind CSS', level: 'advanced', category: 'Frontend' },
        { name: 'Git', level: 'advanced', category: 'Tools' },
        { name: 'Docker', level: 'intermediate', category: 'DevOps' },
        { name: 'REST API', level: 'expert', category: 'Architecture' },
      ],
      education: [
        {
          institution: 'National Institute of Technology (NIT)',
          degree: 'B.Tech',
          fieldOfStudy: 'Information Technology',
          startYear: 2020,
          endYear: 2024,
          grade: '8.8 CGPA',
        },
      ],
      experience: [
        {
          title: 'Software Development Engineer I',
          company: 'InnoTech Solutions',
          location: 'Bengaluru',
          startDate: new Date('2024-06-01'),
          isCurrent: true,
          description: 'Architected microservices using Node.js & Express; optimized React dashboard rendering performance by 40%.',
        },
        {
          title: 'Full Stack Intern',
          company: 'DevCraft Labs',
          location: 'Remote',
          startDate: new Date('2023-05-01'),
          endDate: new Date('2023-11-30'),
          isCurrent: false,
          description: 'Implemented authentication systems with JWT and developed RESTful API endpoints in Express and MongoDB.',
        },
      ],
      projects: [
        {
          title: 'SmartHire Recruitment Portal',
          description: 'MERN stack job recommendation engine featuring rule-based candidate-job matching and resume parsing.',
          technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
          link: 'https://smarthire.dev',
          github: 'https://github.com/smarthire/platform',
        },
      ],
    });

    // Candidate 2: Priya Patel (Frontend Specialist)
    const priyaUser = await User.create({
      name: 'Priya Patel',
      email: 'priya@smarthire.dev',
      password: 'Password123!',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    });
    const priyaProfile = await CandidateProfile.create({
      user: priyaUser._id,
      headline: 'Frontend Engineer | React, Next.js & UI/UX Perfectionist',
      bio: 'Crafting pixel-perfect, accessible, and high-performance user interfaces with React, Next.js, and modern CSS.',
      phone: '+91 99887 76655',
      location: 'Mumbai, India',
      totalExperienceYears: 1.5,
      jobPreferences: {
        roles: ['Frontend Developer', 'UI Engineer', 'React Developer'],
        types: ['full-time'],
        preferredLocations: ['Mumbai', 'Remote'],
        remoteOnly: true,
        expectedSalary: { min: 1000000, max: 1800000, currency: 'INR' },
      },
      skills: [
        { name: 'React', level: 'expert', category: 'Frontend' },
        { name: 'TypeScript', level: 'advanced', category: 'Language' },
        { name: 'Tailwind CSS', level: 'expert', category: 'Frontend' },
        { name: 'Next.js', level: 'advanced', category: 'Frontend' },
        { name: 'Redux', level: 'advanced', category: 'Frontend' },
        { name: 'HTML5', level: 'expert', category: 'Frontend' },
        { name: 'CSS3', level: 'expert', category: 'Frontend' },
      ],
      education: [
        {
          institution: 'Mumbai University',
          degree: 'B.E.',
          fieldOfStudy: 'Computer Engineering',
          startYear: 2020,
          endYear: 2024,
          grade: '9.1 CGPA',
        },
      ],
      experience: [
        {
          title: 'Frontend Developer',
          company: 'SaaSify Studio',
          location: 'Remote',
          startDate: new Date('2024-01-01'),
          isCurrent: true,
          description: 'Built customer-facing SaaS dashboards with Next.js, Tailwind, and Recharts.',
        },
      ],
      projects: [],
    });

    // Candidate 3: Sneha Verma (AI/ML Intern)
    const snehaUser = await User.create({
      name: 'Sneha Verma',
      email: 'sneha@smarthire.dev',
      password: 'Password123!',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    });
    const snehaProfile = await CandidateProfile.create({
      user: snehaUser._id,
      headline: 'AI/ML Researcher & Aspiring Data Scientist',
      bio: 'Passionate about deep learning, LLMs, and computer vision. Strong mathematical foundation and Python expertise.',
      phone: '+91 97766 55443',
      location: 'Bengaluru, India',
      totalExperienceYears: 0.5,
      jobPreferences: {
        roles: ['AI Intern', 'Machine Learning Engineer', 'Data Science Intern'],
        types: ['internship', 'full-time'],
        preferredLocations: ['Bengaluru', 'Remote'],
        remoteOnly: false,
        expectedSalary: { min: 400000, max: 800000, currency: 'INR' },
      },
      skills: [
        { name: 'Python', level: 'expert', category: 'Language' },
        { name: 'Machine Learning', level: 'advanced', category: 'AI/ML' },
        { name: 'PyTorch', level: 'intermediate', category: 'AI/ML' },
        { name: 'Pandas', level: 'advanced', category: 'Data Science' },
        { name: 'NumPy', level: 'advanced', category: 'Data Science' },
        { name: 'Scikit-learn', level: 'advanced', category: 'AI/ML' },
      ],
      education: [
        {
          institution: 'Indian Institute of Science (IISc)',
          degree: 'M.Tech',
          fieldOfStudy: 'Artificial Intelligence',
          startYear: 2023,
          endYear: 2025,
          grade: '9.4 CGPA',
        },
      ],
      experience: [],
      projects: [],
    });

    console.log('[Seeder] Creating Job Postings...');
    const job1 = await Job.create({
      title: 'Full Stack MERN Developer',
      company: google._id,
      recruiter: recruiter1User._id,
      department: 'Google Cloud Tools',
      description: 'We are seeking an energetic Full Stack Developer with strong MERN expertise to build internal developer productivity tools and high-scale dashboard applications.',
      responsibilities: [
        'Design and implement scalable REST APIs in Node.js and Express',
        'Build intuitive, reactive frontend interfaces with React and Tailwind CSS',
        'Model efficient data schemas and indexes in MongoDB',
        'Participate in code reviews, automated unit testing, and agile sprints',
      ],
      requirements: [
        'Proficiency in JavaScript, TypeScript, React, and Node.js',
        'Hands-on experience with MongoDB and Express',
        'Good understanding of RESTful architecture, Git, and Docker',
        'Strong problem-solving and algorithmic skills',
      ],
      jobType: 'full-time',
      location: 'Bengaluru, Karnataka',
      isRemote: false,
      salary: { min: 1400000, max: 2200000, currency: 'INR', isDisclosed: true },
      experienceLevel: 'entry',
      requiredSkills: [
        { name: 'React', weight: 2 },
        { name: 'Node.js', weight: 2 },
        { name: 'Express', weight: 1 },
        { name: 'MongoDB', weight: 1 },
        { name: 'JavaScript', weight: 1 },
      ],
      optionalSkills: ['TypeScript', 'Docker', 'Tailwind CSS'],
      minEducation: 'Bachelors',
      minExperienceYears: 1,
      status: 'active',
      viewsCount: 142,
    });

    const job2 = await Job.create({
      title: 'Senior Frontend Engineer (React / Next.js)',
      company: stripe._id,
      recruiter: recruiter2User._id,
      department: 'Billing & Checkout UI',
      description: 'Join the Stripe team building world-class checkout experiences and merchant dashboards viewed by hundreds of millions of users worldwide.',
      responsibilities: [
        'Lead frontend architecture across core checkout workflows',
        'Build reusable component systems with React, TypeScript, and Tailwind CSS',
        'Drive web performance optimization and accessibility (WCAG AA)',
      ],
      requirements: [
        'Expert proficiency in React, TypeScript, and modern CSS/Tailwind',
        'Experience with state management and front-end build tools',
        'Passion for delighting users with polished UI/UX',
      ],
      jobType: 'full-time',
      location: 'Remote, India',
      isRemote: true,
      salary: { min: 1800000, max: 2800000, currency: 'INR', isDisclosed: true },
      experienceLevel: 'mid',
      requiredSkills: [
        { name: 'React', weight: 2 },
        { name: 'TypeScript', weight: 2 },
        { name: 'Tailwind CSS', weight: 1 },
        { name: 'Redux', weight: 1 },
      ],
      optionalSkills: ['Next.js', 'Vite', 'GraphQL'],
      minEducation: 'Bachelors',
      minExperienceYears: 2,
      status: 'active',
      viewsCount: 98,
    });

    const job3 = await Job.create({
      title: 'AI/ML Research Intern',
      company: nextGenAI._id,
      recruiter: recruiter1User._id,
      department: 'Foundation Models',
      description: 'Exciting 6-month research internship at NextGen AI Labs. Work alongside research scientists on fine-tuning state-of-the-art multimodal AI models.',
      responsibilities: [
        'Prepare, clean, and curate large-scale training datasets',
        'Implement model evaluation harnesses in PyTorch and Python',
        'Benchmark inference speed and memory footprint',
      ],
      requirements: [
        'Pursuing or completed B.Tech / M.Tech in CS / AI / Data Science',
        'Strong Python programming and PyTorch / TensorFlow background',
        'Familiarity with data manipulation libraries (Pandas, NumPy)',
      ],
      jobType: 'internship',
      location: 'Bengaluru, Karnataka',
      isRemote: false,
      salary: { min: 45000, max: 65000, currency: 'INR', isDisclosed: true },
      experienceLevel: 'intern',
      requiredSkills: [
        { name: 'Python', weight: 2 },
        { name: 'Machine Learning', weight: 2 },
        { name: 'PyTorch', weight: 1 },
        { name: 'Pandas', weight: 1 },
      ],
      optionalSkills: ['NumPy', 'Scikit-learn', 'NLP'],
      minEducation: 'Bachelors',
      minExperienceYears: 0,
      status: 'active',
      viewsCount: 215,
    });

    const job4 = await Job.create({
      title: 'Cloud DevOps & Infrastructure Engineer',
      company: google._id,
      recruiter: recruiter1User._id,
      department: 'Site Reliability Engineering',
      description: 'Manage and scale multi-region Kubernetes clusters, CI/CD automated deployment pipelines, and cloud monitoring telemetry.',
      responsibilities: [
        'Automate containerized infrastructure using Docker and Kubernetes',
        'Configure CI/CD pipelines via GitHub Actions and Jenkins',
        'Monitor SLOs/SLAs and implement automated self-healing scripts',
      ],
      requirements: [
        'Demonstrated experience with AWS / GCP cloud environments',
        'Expertise in Linux, Docker, and Kubernetes',
        'Familiarity with infrastructure as code (Terraform)',
      ],
      jobType: 'full-time',
      location: 'Hyderabad, Telangana',
      isRemote: false,
      salary: { min: 1600000, max: 2600000, currency: 'INR', isDisclosed: true },
      experienceLevel: 'mid',
      requiredSkills: [
        { name: 'Docker', weight: 2 },
        { name: 'Kubernetes', weight: 2 },
        { name: 'AWS', weight: 2 },
        { name: 'CI/CD', weight: 1 },
        { name: 'Linux', weight: 1 },
      ],
      optionalSkills: ['Terraform', 'Python'],
      minEducation: 'Bachelors',
      minExperienceYears: 2,
      status: 'active',
      viewsCount: 76,
    });

    console.log('[Seeder] Creating Realistic Applications with Match Scores...');

    // Rahul Sharma applies to Google Full Stack (High Match!)
    const matchRahulJob1 = calculateCandidateJobMatch(rahulProfile, job1);
    await Application.create({
      job: job1._id,
      candidate: rahulUser._id,
      coverNote: 'Excited to apply! I have 2 years of production experience in MERN stack, having built REST APIs and scalable React apps.',
      status: 'shortlisted',
      matchScore: matchRahulJob1,
      recruiterNotes: 'Exceptional skill match across MERN stack. Strong portfolio project. Shortlisted for technical round.',
      statusHistory: [
        {
          status: 'applied',
          changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          changedBy: rahulUser._id,
          note: 'Application submitted.',
        },
        {
          status: 'under_review',
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          changedBy: recruiter1User._id,
          note: 'Profile reviewed by hiring manager.',
        },
        {
          status: 'shortlisted',
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          changedBy: recruiter1User._id,
          note: 'Candidate shortlisted for technical interview round.',
        },
      ],
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });
    job1.applicantsCount += 1;
    await job1.save();

    // Priya Patel applies to Stripe Frontend (High Match!)
    const matchPriyaJob2 = calculateCandidateJobMatch(priyaProfile, job2);
    await Application.create({
      job: job2._id,
      candidate: priyaUser._id,
      coverNote: 'Hello David! I love Stripe\'s UI craftsmanship. I have built several Next.js & Tailwind applications.',
      status: 'interviewing',
      matchScore: matchPriyaJob2,
      recruiterNotes: 'Impressive UI skills and exact match with React + Tailwind + TypeScript. Phone screen passed.',
      statusHistory: [
        {
          status: 'applied',
          changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          changedBy: priyaUser._id,
          note: 'Applied through SmartHire.',
        },
        {
          status: 'shortlisted',
          changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          changedBy: recruiter2User._id,
          note: 'Passed initial screening.',
        },
        {
          status: 'interviewing',
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          changedBy: recruiter2User._id,
          note: 'Scheduled for virtual onsite interview.',
        },
      ],
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });
    job2.applicantsCount += 1;
    await job2.save();

    // Sneha Verma applies to NextGen AI Intern (High Match!)
    const matchSnehaJob3 = calculateCandidateJobMatch(snehaProfile, job3);
    await Application.create({
      job: job3._id,
      candidate: snehaUser._id,
      coverNote: 'Currently doing my M.Tech at IISc in Artificial Intelligence. Would love to contribute to foundation model research!',
      status: 'under_review',
      matchScore: matchSnehaJob3,
      recruiterNotes: 'Top-tier IISc student with strong PyTorch background.',
      statusHistory: [
        {
          status: 'applied',
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          changedBy: snehaUser._id,
          note: 'Application submitted.',
        },
        {
          status: 'under_review',
          changedAt: new Date(),
          changedBy: recruiter1User._id,
          note: 'Under review by AI research team lead.',
        },
      ],
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });
    job3.applicantsCount += 1;
    await job3.save();

    console.log('[Seeder] Creating Realistic Notifications...');
    await Notification.create({
      recipient: rahulUser._id,
      sender: recruiter1User._id,
      title: 'Application Shortlisted! 🎉',
      message: 'Congratulations! Your application for Full Stack MERN Developer at Google India has been shortlisted.',
      type: 'application_status',
      link: '/candidate/applications',
    });

    await Notification.create({
      recipient: priyaUser._id,
      sender: recruiter2User._id,
      title: 'Interview Invitation 📅',
      message: 'You have been invited for a technical interview round for Senior Frontend Engineer at Stripe.',
      type: 'application_status',
      link: '/candidate/applications',
    });

    await Notification.create({
      recipient: recruiter1User._id,
      sender: snehaUser._id,
      title: 'New High-Match Applicant',
      message: 'Sneha Verma applied for AI/ML Research Intern with a 92% match score.',
      type: 'new_application',
      link: `/recruiter/jobs/${job3._id}/applicants`,
    });

    console.log('==================================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Demo Credentials for Immediate Testing:');
    console.log('1. Administrator:');
    console.log('   Email:    admin@smarthire.dev');
    console.log('   Password: Password123!');
    console.log('2. Recruiter (Google India):');
    console.log('   Email:    recruiter@smarthire.dev');
    console.log('   Password: Password123!');
    console.log('3. Recruiter (Stripe):');
    console.log('   Email:    recruiter2@smarthire.dev');
    console.log('   Password: Password123!');
    console.log('4. Candidate (MERN Developer):');
    console.log('   Email:    candidate@smarthire.dev');
    console.log('   Password: Password123!');
    console.log('5. Candidate (Frontend Specialist):');
    console.log('   Email:    priya@smarthire.dev');
    console.log('   Password: Password123!');
    console.log('==================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Fatal error during seeding:', err);
    process.exit(1);
  }
};

seedData();

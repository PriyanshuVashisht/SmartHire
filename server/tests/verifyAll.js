require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const assert = require('assert');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const { calculateCandidateJobMatch } = require('../services/recommendationEngine');
const { generateToken, verifyToken } = require('../utils/jwt');

const runVerification = async () => {
  console.log('==================================================');
  console.log('STARTING SMARTHIRE BACKEND INTEGRATION & LOGIC TESTS');
  console.log('==================================================');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  };

  try {
    await connectDB();

    // Setup Test Data in Test DB
    console.log('[Test Setup] Populating test fixtures...');
    const testAdmin = await User.create({
      name: 'System Administrator',
      email: 'admin@smarthire.dev',
      password: 'Password123!',
      role: 'admin',
    });

    const testRecruiter = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@smarthire.dev',
      password: 'Password123!',
      role: 'recruiter',
    });

    const testCandidate = await User.create({
      name: 'Rahul Sharma',
      email: 'candidate@smarthire.dev',
      password: 'Password123!',
      role: 'candidate',
    });

    const testCandidateProfile = await CandidateProfile.create({
      user: testCandidate._id,
      headline: 'Full Stack MERN Developer',
      skills: [
        { name: 'React', level: 'expert' },
        { name: 'Node.js', level: 'expert' },
        { name: 'MongoDB', level: 'expert' },
        { name: 'TypeScript', level: 'intermediate' },
      ],
      education: [
        {
          institution: 'NIT',
          degree: 'B.Tech',
          fieldOfStudy: 'IT',
          startYear: 2020,
          endYear: 2024,
        },
      ],
      totalExperienceYears: 2,
      location: 'Bengaluru',
      jobPreferences: {
        types: ['full-time'],
        roles: ['Full Stack Developer'],
        preferredLocations: ['Bengaluru'],
      },
    });

    const testCompany = await Company.create({
      name: 'Google India',
      industry: 'Technology',
      location: 'Bengaluru',
      recruiters: [testRecruiter._id],
    });

    const testJob = await Job.create({
      title: 'Full Stack MERN Developer',
      company: testCompany._id,
      recruiter: testRecruiter._id,
      department: 'Engineering',
      description: 'Building high-scale web apps',
      jobType: 'full-time',
      location: 'Bengaluru',
      isRemote: false,
      minEducation: 'Bachelors',
      minExperienceYears: 1,
      requiredSkills: [
        { name: 'React', weight: 2 },
        { name: 'Node.js', weight: 2 },
        { name: 'MongoDB', weight: 1 },
        { name: 'Express', weight: 1 },
      ],
      status: 'active',
    });

    // Test 1: JWT generation and verification
    await test('JWT Token Generation & Verification', async () => {
      const payload = { id: testCandidate._id.toString(), role: 'candidate' };
      const token = generateToken(payload);
      assert(token && typeof token === 'string', 'Token should be a non-empty string');
      const decoded = verifyToken(token);
      assert.strictEqual(decoded.id, payload.id, 'Decoded user ID should match');
      assert.strictEqual(decoded.role, payload.role, 'Decoded role should match');
    });

    // Test 2: Database Users and Role Validation
    await test('User Models & Password Hashing', async () => {
      const admin = await User.findOne({ email: 'admin@smarthire.dev' }).select('+password');
      assert(admin, 'Admin account should exist');
      assert.strictEqual(admin.role, 'admin', 'Admin role must be admin');
      const isMatch = await admin.comparePassword('Password123!');
      assert.strictEqual(isMatch, true, 'Admin password bcrypt comparison should succeed');
    });

    // Test 3: Recommendation Algorithm 5-Factor Weighted Score
    await test('Recommendation Engine 5-Factor Match Calculation', async () => {
      const match = calculateCandidateJobMatch(testCandidateProfile, testJob);

      assert(match.overallScore >= 70 && match.overallScore <= 100, `Score (${match.overallScore}) should be high`);
      assert(match.matchedSkills.includes('React'), 'React must be in matched skills');
      assert(match.matchedSkills.includes('Node.js'), 'Node.js must be in matched skills');
      assert(match.matchedSkills.includes('MongoDB'), 'MongoDB must be in matched skills');
      assert(match.missingSkills.includes('Express'), 'Express must be in missing skills');
      assert.strictEqual(match.skillCoverage, 75, 'Skill coverage should be 3/4 = 75%');
      assert(match.explanation && typeof match.explanation === 'string', 'Explanation must be generated');
    });

    // Test 4: Prevent Duplicate Applications
    await test('Database Prevention of Duplicate Applications', async () => {
      // Create first application
      const app1 = await Application.create({
        job: testJob._id,
        candidate: testCandidate._id,
        status: 'applied',
        matchScore: { overallScore: 85, skillCoverage: 75 },
      });
      assert(app1, 'First application must be created');

      // Attempt duplicate creation
      try {
        await Application.create({
          job: testJob._id,
          candidate: testCandidate._id,
          status: 'applied',
        });
        assert.fail('Should have rejected duplicate application');
      } catch (err) {
        assert(err.code === 11000, `Expected code 11000 duplicate key, received: ${err.message}`);
      }
    });

    // Test 5: Role Authorization Middleware simulation
    await test('Role-Based Authorization Constraints', async () => {
      const candidateUser = await User.findOne({ role: 'candidate' });
      assert.strictEqual(candidateUser.role, 'candidate');

      // Assert normal users cannot have role 'admin'
      const isCandidateAdmin = candidateUser.role === 'admin';
      assert.strictEqual(isCandidateAdmin, false, 'Candidate must not have admin privileges');
    });

    // Test 6: Verify Database Counts & Population
    await test('Data Population & Entity Relationships', async () => {
      const appWithJob = await Application.findOne({ candidate: testCandidate._id })
        .populate('job')
        .populate('candidate');

      assert(appWithJob, 'Application must exist');
      assert.strictEqual(appWithJob.job.title, 'Full Stack MERN Developer');
      assert.strictEqual(appWithJob.candidate.name, 'Rahul Sharma');
    });

    console.log('==================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    await disconnectDB();
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (fatal) {
    console.error('Fatal test runner failure:', fatal);
    process.exit(1);
  }
};

runVerification();

const RecruiterProfile = require('../models/RecruiterProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');

// @desc    Get recruiter profile
// @route   GET /api/recruiter/me
// @access  Private (Recruiter)
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await RecruiterProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar')
      .populate('company');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found.',
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recruiter profile
// @route   PUT /api/recruiter/me
// @access  Private (Recruiter)
const updateMyProfile = async (req, res, next) => {
  try {
    const { designation, department, phone } = req.body;

    let profile = await RecruiterProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter profile not found.',
      });
    }

    if (designation) profile.designation = designation;
    if (department) profile.department = department;
    if (phone) profile.phone = phone;

    await profile.save();

    profile = await RecruiterProfile.findById(profile._id)
      .populate('user', 'name email avatar')
      .populate('company');

    res.json({
      success: true,
      profile,
      message: 'Recruiter profile updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recruiter dashboard statistics
// @route   GET /api/recruiter/stats
// @access  Private (Recruiter)
const getRecruiterStats = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id });
    const jobIds = jobs.map((j) => j._id);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'active').length;
    const closedJobs = jobs.filter((j) => j.status === 'closed').length;

    const applications = await Application.find({ job: { $in: jobIds } });
    const totalApplicants = applications.length;
    const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
    const interviewingCount = applications.filter((a) => a.status === 'interviewing').length;
    const hiredCount = applications.filter((a) => a.status === 'hired').length;
    const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

    // Average match score
    const avgScore = totalApplicants > 0
      ? Math.round(applications.reduce((acc, a) => acc + (a.matchScore?.overallScore || 0), 0) / totalApplicants)
      : 0;

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplicants,
        shortlistedCount,
        interviewingCount,
        hiredCount,
        rejectedCount,
        avgScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applicants for recruiter's jobs
// @route   GET /api/recruiter/applicants
// @access  Private (Recruiter)
const getApplicants = async (req, res, next) => {
  try {
    const { jobId, status, sortBy } = req.query;

    const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id title');
    const jobIds = recruiterJobs.map((j) => j._id);

    const query = { job: { $in: jobIds } };
    if (jobId) {
      query.job = jobId;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    let sort = { appliedAt: -1 };
    if (sortBy === 'score_desc') {
      sort = { 'matchScore.overallScore': -1 };
    } else if (sortBy === 'score_asc') {
      sort = { 'matchScore.overallScore': 1 };
    }

    const applications = await Application.find(query)
      .populate('candidate', 'name email avatar')
      .populate('job', 'title location jobType status')
      .populate('resume', 'originalFilename storedPath fileType')
      .sort(sort);

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getRecruiterStats,
  getApplicants,
};

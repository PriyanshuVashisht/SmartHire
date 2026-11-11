const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const {
  calculateCandidateJobMatch,
  rankJobsForCandidate,
  rankCandidatesForJob,
} = require('../services/recommendationEngine');

// @desc    Get intelligent personalized job recommendations for candidate
// @route   GET /api/recommendations/jobs
// @access  Private (Candidate)
const getCandidateRecommendations = async (req, res, next) => {
  try {
    const candidateProfile = await CandidateProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar')
      .populate('resume');

    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found. Please complete your profile first.',
      });
    }

    const { minScore = 0, limit = 20 } = req.query;

    // Fetch all active jobs
    const activeJobs = await Job.find({ status: 'active' })
      .populate('company', 'name logo location industry verified size')
      .populate('recruiter', 'name email');

    // Get candidate's existing applications to flag applied jobs
    const applications = await Application.find({ candidate: req.user._id }).select('job status');
    const appliedJobMap = new Map();
    applications.forEach((app) => {
      appliedJobMap.set(app.job.toString(), app.status);
    });

    // Run recommendation engine
    const rankedResults = rankJobsForCandidate(candidateProfile, activeJobs);

    // Format output with application status
    const recommendations = rankedResults
      .filter((r) => r.match.overallScore >= Number(minScore))
      .slice(0, Number(limit))
      .map((item) => ({
        ...item,
        isApplied: appliedJobMap.has(item.job._id.toString()),
        applicationStatus: appliedJobMap.get(item.job._id.toString()) || null,
      }));

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
      weightsUsed: {
        skills: '50%',
        education: '15%',
        experience: '15%',
        preferences: '10%',
        location: '10%',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get match score for a specific job against candidate profile
// @route   GET /api/recommendations/jobs/:jobId/match
// @access  Private (Candidate)
const getSingleJobMatch = async (req, res, next) => {
  try {
    const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });
    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found.',
      });
    }

    const job = await Job.findById(req.params.jobId).populate('company', 'name logo location');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    const match = calculateCandidateJobMatch(candidateProfile, job);

    res.json({
      success: true,
      jobId: job._id,
      match,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Rank applicants for a specific job
// @route   GET /api/recommendations/jobs/:jobId/applicants
// @access  Private (Recruiter / Admin)
const getRankedApplicantsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Ownership check
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applicant rankings for this job.',
      });
    }

    const applications = await Application.find({ job: job._id })
      .populate('candidate', 'name email avatar')
      .populate('resume')
      .sort({ 'matchScore.overallScore': -1 });

    res.json({
      success: true,
      count: applications.length,
      rankedApplications: applications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCandidateRecommendations,
  getSingleJobMatch,
  getRankedApplicantsForJob,
};

const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const Resume = require('../models/Resume');
const Notification = require('../models/Notification');
const { calculateCandidateJobMatch } = require('../services/recommendationEngine');

// @desc    Apply for a job listing
// @route   POST /api/applications
// @access  Private (Candidate)
const applyJob = async (req, res, next) => {
  try {
    const { jobId, coverNote } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Job ID.',
      });
    }

    const job = await Job.findById(jobId).populate('recruiter');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job listing is closed or no longer accepting applications.',
      });
    }

    // Check duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      candidate: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this position.',
      });
    }

    // Fetch candidate profile & latest resume
    const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });
    const latestResume = await Resume.findOne({ candidate: req.user._id }).sort({ uploadedAt: -1 });

    // Calculate match score
    const match = calculateCandidateJobMatch(candidateProfile, job);

    // Create Application
    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      resume: latestResume ? latestResume._id : null,
      coverNote: coverNote || '',
      status: 'applied',
      matchScore: match,
      statusHistory: [
        {
          status: 'applied',
          changedAt: new Date(),
          changedBy: req.user._id,
          note: 'Application submitted by candidate.',
        },
      ],
    });

    // Increment applicantsCount on job
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    await job.save();

    // Create Notification for the recruiter
    if (job.recruiter) {
      await Notification.create({
        recipient: job.recruiter._id || job.recruiter,
        sender: req.user._id,
        title: 'New Applicant Received',
        message: `${req.user.name} applied for "${job.title}" with a ${match.overallScore}% match score.`,
        type: 'new_application',
        link: `/recruiter/jobs/${job._id}/applicants`,
      });
    }

    // Populate for response
    const populated = await Application.findById(application._id)
      .populate('job', 'title location jobType company')
      .populate('resume', 'originalFilename fileType');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate's applied jobs
// @route   GET /api/applications/me
// @access  Private (Candidate)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        select: 'title location jobType status salary company department',
        populate: {
          path: 'company',
          select: 'name logo location',
        },
      })
      .populate('resume', 'originalFilename fileType')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get applications for a specific job (Recruiter view)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter / Admin)
const getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You did not post this job listing.',
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email avatar')
      .populate('resume')
      .sort({ 'matchScore.overallScore': -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (shortlist, reject, interview, etc.)
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter / Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['applied', 'under_review', 'shortlisted', 'interviewing', 'rejected', 'hired'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('candidate');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Ownership check
    if (
      application.job.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the recruiter for this position.',
      });
    }

    application.status = status;
    if (note) application.recruiterNotes = note;

    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: note || `Status updated to ${status.replace('_', ' ')}`,
    });

    await application.save();

    // Create Notification for Candidate
    const statusLabels = {
      under_review: 'Under Review',
      shortlisted: 'Shortlisted! 🎉',
      interviewing: 'Invited for Interview 📅',
      rejected: 'Application Not Selected',
      hired: 'Offer Extended / Hired! 🚀',
    };

    const label = statusLabels[status] || status;
    await Notification.create({
      recipient: application.candidate._id,
      sender: req.user._id,
      title: `Application Status Updated: ${label}`,
      message: `Your application for "${application.job.title}" has been updated to ${label}.`,
      type: 'application_status',
      link: '/candidate/applications',
    });

    res.json({
      success: true,
      message: `Application marked as ${status}.`,
      application,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};

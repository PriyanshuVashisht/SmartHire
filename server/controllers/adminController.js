const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Report = require('../models/Report');

// @desc    Get real administrative platform metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });

    const totalApplications = await Application.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Status breakdown
    const shortlistedCount = await Application.countDocuments({ status: 'shortlisted' });
    const interviewingCount = await Application.countDocuments({ status: 'interviewing' });
    const hiredCount = await Application.countDocuments({ status: 'hired' });
    const rejectedCount = await Application.countDocuments({ status: 'rejected' });
    const appliedCount = await Application.countDocuments({ status: 'applied' });

    // Recent activity
    const recentApplications = await Application.find()
      .populate('candidate', 'name email avatar')
      .populate('job', 'title company')
      .sort({ appliedAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalAdmins,
        totalJobs,
        activeJobs,
        closedJobs,
        totalApplications,
        totalCompanies,
        pendingReports,
        applicationBreakdown: {
          applied: appliedCount,
          shortlisted: shortlistedCount,
          interviewing: interviewingCount,
          hired: hiredCount,
          rejected: rejectedCount,
        },
      },
      recentApplications,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with search and filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const currentPage = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);
    const skip = (currentPage - 1) * pageLimit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Suspend or activate user account
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend administrator accounts.',
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      success: true,
      message: `User account has been ${user.isSuspended ? 'suspended' : 'activated'}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Moderate job listing
// @route   PATCH /api/admin/jobs/:id/moderate
// @access  Private (Admin)
const moderateJob = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    job.status = status || 'closed';
    await job.save();

    res.json({
      success: true,
      message: `Job status updated to ${job.status}.`,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all content reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate('targetJob', 'title company')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve content report
// @route   PATCH /api/admin/reports/:id/resolve
// @access  Private (Admin)
const resolveReport = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    report.status = status || 'action_taken';
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: 'Report resolved successfully.',
      report,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  moderateJob,
  getReports,
  resolveReport,
};

const Job = require('../models/Job');
const RecruiterProfile = require('../models/RecruiterProfile');

// @desc    Get all active jobs with search, filtering and pagination
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res, next) => {
  try {
    const {
      search,
      jobType,
      experienceLevel,
      location,
      remoteOnly,
      skills,
      minSalary,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { status: 'active' };

    // Search query for title, description, or department
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { 'requiredSkills.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (jobType && jobType !== 'all') {
      query.jobType = jobType;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (remoteOnly === 'true' || remoteOnly === true) {
      query.isRemote = true;
    }

    if (minSalary) {
      query['salary.min'] = { $gte: Number(minSalary) };
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      query['requiredSkills.name'] = { $in: skillsArray.map((s) => new RegExp(`^${s}$`, 'i')) };
    }

    const currentPage = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);
    const skip = (currentPage - 1) * pageLimit;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('company', 'name logo location industry verified size')
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / pageLimit),
      currentPage,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo location industry website description size foundedYear verified')
      .populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.',
      });
    }

    // Increment views asynchronously
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

    res.json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const recruiterProfile = await RecruiterProfile.findOne({ user: req.user._id });
    if (!recruiterProfile || !recruiterProfile.company) {
      return res.status(400).json({
        success: false,
        message: 'Recruiter must be associated with a company to post jobs.',
      });
    }

    const {
      title,
      department,
      description,
      responsibilities,
      requirements,
      jobType,
      location,
      isRemote,
      salary,
      experienceLevel,
      requiredSkills,
      optionalSkills,
      minEducation,
      minExperienceYears,
      expiresAt,
    } = req.body;

    // Format skills if sent as array of strings
    const formattedSkills = (requiredSkills || []).map((s) => {
      if (typeof s === 'string') {
        return { name: s.trim(), weight: 1 };
      }
      return { name: s.name.trim(), weight: s.weight || 1 };
    });

    const job = await Job.create({
      title,
      company: recruiterProfile.company,
      recruiter: req.user._id,
      department: department || 'Engineering',
      description,
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      jobType: jobType || 'full-time',
      location,
      isRemote: Boolean(isRemote),
      salary: salary || { min: 0, max: 0, currency: 'INR', isDisclosed: true },
      experienceLevel: experienceLevel || 'entry',
      requiredSkills: formattedSkills,
      optionalSkills: optionalSkills || [],
      minEducation: minEducation || 'Bachelors',
      minExperienceYears: Number(minExperienceYears) || 0,
      expiresAt: expiresAt || null,
      status: 'active',
    });

    const populatedJob = await Job.findById(job._id).populate('company', 'name logo location industry');

    res.status(201).json({
      success: true,
      job: populatedJob,
      message: 'Job listing posted successfully!',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job listing
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter / Admin)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Ownership check: must be owner or admin
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this job listing.',
      });
    }

    const updatableFields = [
      'title', 'department', 'description', 'responsibilities', 'requirements',
      'jobType', 'location', 'isRemote', 'salary', 'experienceLevel',
      'requiredSkills', 'optionalSkills', 'minEducation', 'minExperienceYears',
      'status', 'expiresAt'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'requiredSkills') {
          job.requiredSkills = req.body.requiredSkills.map((s) =>
            typeof s === 'string' ? { name: s.trim(), weight: 1 } : { name: s.name.trim(), weight: s.weight || 1 }
          );
        } else {
          job[field] = req.body[field];
        }
      }
    });

    await job.save();

    const updated = await Job.findById(job._id).populate('company', 'name logo location industry');

    res.json({
      success: true,
      job: updated,
      message: 'Job listing updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or close job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter / Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this job.',
      });
    }

    // Soft close or delete
    job.status = 'closed';
    await job.save();

    res.json({
      success: true,
      message: 'Job listing closed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get jobs posted by current recruiter
// @route   GET /api/jobs/recruiter/my
// @access  Private (Recruiter)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .populate('company', 'name logo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
};

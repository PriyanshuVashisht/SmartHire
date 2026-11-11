const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');

// @desc    Get candidate profile for logged-in user
// @route   GET /api/candidates/me
// @access  Private (Candidate)
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await CandidateProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar')
      .populate('resume');

    if (!profile) {
      profile = await CandidateProfile.create({
        user: req.user._id,
        skills: [],
        education: [],
        experience: [],
        projects: [],
      });
      profile = await profile.populate('user', 'name email avatar');
    }

    res.json({
      success: true,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update candidate profile
// @route   PUT /api/candidates/me
// @access  Private (Candidate)
const updateMyProfile = async (req, res, next) => {
  try {
    const {
      headline,
      bio,
      phone,
      location,
      jobPreferences,
      education,
      experience,
      skills,
      projects,
      name,
    } = req.body;

    // Optionally update user's full name
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name: name.trim() });
    }

    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    if (headline !== undefined) profile.headline = headline;
    if (bio !== undefined) profile.bio = bio;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (jobPreferences !== undefined) profile.jobPreferences = jobPreferences;
    if (education !== undefined) profile.education = education;
    if (experience !== undefined) profile.experience = experience;
    if (skills !== undefined) profile.skills = skills;
    if (projects !== undefined) profile.projects = projects;

    // Recalculate experience years
    profile.totalExperienceYears = profile.calculateExperienceYears();

    await profile.save();

    profile = await CandidateProfile.findById(profile._id)
      .populate('user', 'name email avatar')
      .populate('resume');

    res.json({
      success: true,
      profile,
      message: 'Profile updated successfully!',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate public profile by id (for recruiters viewing applicant)
// @route   GET /api/candidates/:id
// @access  Private (Recruiter / Admin)
const getCandidateById = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ user: req.params.id })
      .populate('user', 'name email avatar')
      .populate('resume');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found.',
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

module.exports = {
  getMyProfile,
  updateMyProfile,
  getCandidateById,
};

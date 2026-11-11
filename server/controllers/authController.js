const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Company = require('../models/Company');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName, companyIndustry, companyLocation } = req.body;

    // Security: Never allow normal registration as administrator
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be registered publicly.',
      });
    }

    const assignedRole = role === 'recruiter' ? 'recruiter' : 'candidate';

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    // Create role-specific profile
    if (assignedRole === 'candidate') {
      await CandidateProfile.create({
        user: user._id,
        skills: [],
        education: [],
        experience: [],
        projects: [],
      });
    } else if (assignedRole === 'recruiter') {
      // Find or create company
      let company;
      if (companyName) {
        company = await Company.findOne({ name: companyName.trim() });
        if (!company) {
          company = await Company.create({
            name: companyName.trim(),
            industry: companyIndustry || 'Technology',
            location: companyLocation || 'Remote',
            recruiters: [user._id],
          });
        } else {
          if (!company.recruiters.includes(user._id)) {
            company.recruiters.push(user._id);
            await company.save();
          }
        }
      } else {
        // Default placeholder company
        company = await Company.create({
          name: `${user.name}'s Organization`,
          industry: 'Technology',
          location: 'Remote',
          recruiters: [user._id],
        });
      }

      await RecruiterProfile.create({
        user: user._id,
        company: company._id,
        designation: req.body.designation || 'Talent Acquisition Specialist',
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      message: 'Registration successful!',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      message: 'Logged in successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profileData = null;

    if (user.role === 'candidate') {
      profileData = await CandidateProfile.findOne({ user: user._id }).populate('resume');
    } else if (user.role === 'recruiter') {
      profileData = await RecruiterProfile.findOne({ user: user._id }).populate('company');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      profile: profileData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });
    res.json({
      success: true,
      token,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
};

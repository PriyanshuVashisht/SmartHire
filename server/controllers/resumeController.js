const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const { parseResumeFile } = require('../services/resumeParser');

// @desc    Upload and parse resume (PDF/DOCX)
// @route   POST /api/resumes/upload
// @access  Private (Candidate)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a valid resume file (PDF or DOCX).',
      });
    }

    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const filePath = req.file.path;

    // Parse file for text, skills, and data
    const parseResult = await parseResumeFile(filePath, ext);

    // Save Resume document
    const resume = await Resume.create({
      candidate: req.user._id,
      originalFilename: req.file.originalname,
      storedPath: req.file.filename,
      fileType: ext === 'docx' || ext === 'doc' ? 'docx' : 'pdf',
      fileSize: req.file.size,
      extractedText: parseResult.extractedText,
      extractedSkills: parseResult.extractedSkills,
      parsedData: parseResult.parsedData,
    });

    // Update candidate profile
    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    profile.resume = resume._id;

    // Automatically add extracted skills that candidate doesn't already have
    const existingSkillNames = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    parseResult.extractedSkills.forEach((skillName) => {
      if (!existingSkillNames.has(skillName.toLowerCase())) {
        profile.skills.push({
          name: skillName,
          level: 'intermediate',
          category: 'Technical',
        });
        existingSkillNames.add(skillName.toLowerCase());
      }
    });

    // If candidate has no experience years, set estimated experience from resume
    if (profile.totalExperienceYears === 0 && parseResult.parsedData.experienceYears > 0) {
      profile.totalExperienceYears = parseResult.parsedData.experienceYears;
    }

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully!',
      resume: {
        id: resume._id,
        filename: resume.originalFilename,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        extractedSkills: resume.extractedSkills,
        parsedData: resume.parsedData,
        uploadedAt: resume.uploadedAt,
      },
      updatedSkillsCount: profile.skills.length,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get candidate's current resume
// @route   GET /api/resumes/me
// @access  Private (Candidate)
const getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ candidate: req.user._id }).sort({ uploadedAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume uploaded yet.',
      });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download / view authorized resume
// @route   GET /api/resumes/:id/download
// @access  Private (Candidate / Authorized Recruiter / Admin)
const downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found.',
      });
    }

    // Authorization check:
    // 1. Candidate themselves
    // 2. Administrator
    // 3. Recruiter who has an application from this candidate
    let isAuthorized = false;
    if (req.user.role === 'admin') {
      isAuthorized = true;
    } else if (resume.candidate.toString() === req.user._id.toString()) {
      isAuthorized = true;
    } else if (req.user.role === 'recruiter') {
      const application = await Application.findOne({
        candidate: resume.candidate,
        resume: resume._id,
      }).populate('job');

      if (application && application.job && application.job.recruiter.toString() === req.user._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view or download this candidate resume.',
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'resumes', resume.storedPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file on disk could not be located.',
      });
    }

    res.download(filePath, resume.originalFilename);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadResume,
  getMyResume,
  downloadResume,
};

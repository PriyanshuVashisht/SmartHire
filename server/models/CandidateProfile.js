const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    jobPreferences: {
      roles: [{ type: String, trim: true }],
      types: [
        {
          type: String,
          enum: ['full-time', 'part-time', 'internship', 'contract'],
        },
      ],
      preferredLocations: [{ type: String, trim: true }],
      remoteOnly: {
        type: Boolean,
        default: false,
      },
      expectedSalary: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
      },
    },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, default: '' },
        startYear: { type: Number },
        endYear: { type: Number },
        grade: { type: String, default: '' },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, default: '' },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false },
        description: { type: String, default: '' },
      },
    ],
    totalExperienceYears: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        name: { type: String, required: true, trim: true },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate',
        },
        category: { type: String, default: 'Technical' },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        technologies: [{ type: String, trim: true }],
        link: { type: String, default: '' },
        github: { type: String, default: '' },
      },
    ],
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to compute total years of experience
candidateProfileSchema.methods.calculateExperienceYears = function () {
  if (!this.experience || this.experience.length === 0) return 0;
  let totalMonths = 0;
  this.experience.forEach((exp) => {
    const start = exp.startDate ? new Date(exp.startDate) : null;
    const end = exp.isCurrent ? new Date() : exp.endDate ? new Date(exp.endDate) : null;
    if (start && end && end > start) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  });
  return parseFloat((totalMonths / 12).toFixed(1));
};

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);

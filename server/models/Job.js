const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide job title'],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    description: {
      type: String,
      required: [true, 'Please provide job description'],
    },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      default: 'full-time',
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      isDisclosed: { type: Boolean, default: true },
    },
    experienceLevel: {
      type: String,
      enum: ['intern', 'entry', 'mid', 'senior', 'lead'],
      default: 'entry',
    },
    requiredSkills: [
      {
        name: { type: String, required: true, trim: true },
        weight: { type: Number, default: 1 },
      },
    ],
    optionalSkills: [{ type: String, trim: true }],
    minEducation: {
      type: String,
      default: 'Bachelors',
    },
    minExperienceYears: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: 'text', description: 'text', location: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);

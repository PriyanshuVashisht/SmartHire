const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    coverNote: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'shortlisted', 'interviewing', 'rejected', 'hired'],
      default: 'applied',
    },
    matchScore: {
      overallScore: { type: Number, default: 0 },
      skillCoverage: { type: Number, default: 0 },
      matchedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      educationMatch: { type: Number, default: 0 },
      experienceMatch: { type: Number, default: 0 },
      locationMatch: { type: Number, default: 0 },
      explanation: { type: String, default: '' },
    },
    recruiterNotes: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String, default: '' },
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, 'matchScore.overallScore': -1 });

module.exports = mongoose.model('Application', applicationSchema);

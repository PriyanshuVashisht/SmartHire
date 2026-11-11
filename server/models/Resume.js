const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    storedPath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'doc'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    extractedSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    parsedData: {
      education: [{ type: String }],
      experienceYears: { type: Number, default: 0 },
      contactInfo: {
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ candidate: 1, uploadedAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);

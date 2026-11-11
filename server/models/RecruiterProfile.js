const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    designation: {
      type: String,
      required: [true, 'Please provide designation'],
      trim: true,
      default: 'Recruiter',
    },
    department: {
      type: String,
      trim: true,
      default: 'Talent Acquisition',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);

const express = require('express');
const router = express.Router();
const {
  getCandidateRecommendations,
  getSingleJobMatch,
  getRankedApplicantsForJob,
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/jobs', protect, authorize('candidate'), getCandidateRecommendations);
router.get('/jobs/:jobId/match', protect, authorize('candidate'), getSingleJobMatch);
router.get('/jobs/:jobId/applicants', protect, authorize('recruiter', 'admin'), getRankedApplicantsForJob);

module.exports = router;

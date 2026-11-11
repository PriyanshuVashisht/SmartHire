const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getRecruiterStats,
  getApplicants,
} = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('recruiter', 'admin'));

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.get('/stats', getRecruiterStats);
router.get('/applicants', getApplicants);

module.exports = router;

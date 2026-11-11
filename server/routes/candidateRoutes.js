const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getCandidateById } = require('../controllers/candidateController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me', protect, authorize('candidate'), getMyProfile);
router.put('/me', protect, authorize('candidate'), updateMyProfile);
router.get('/:id', protect, authorize('recruiter', 'admin'), getCandidateById);

module.exports = router;

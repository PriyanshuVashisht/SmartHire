const express = require('express');
const router = express.Router();
const { uploadResume, getMyResume, downloadResume } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume: uploadMiddleware } = require('../middleware/upload');

router.post('/upload', protect, authorize('candidate'), uploadMiddleware.single('resume'), uploadResume);
router.get('/me', protect, authorize('candidate'), getMyResume);
router.get('/:id/download', protect, downloadResume);

module.exports = router;

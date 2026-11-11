const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  moderateJob,
  getReports,
  resolveReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/jobs/:id/moderate', moderateJob);
router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

module.exports = router;

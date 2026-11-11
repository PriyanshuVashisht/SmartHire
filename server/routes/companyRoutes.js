const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  updateMyCompany,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/me', protect, authorize('recruiter', 'admin'), updateMyCompany);

module.exports = router;

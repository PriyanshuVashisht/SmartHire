const Company = require('../models/Company');
const RecruiterProfile = require('../models/RecruiterProfile');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    res.json({
      success: true,
      company,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update company profile
// @route   PUT /api/companies/me
// @access  Private (Recruiter)
const updateMyCompany = async (req, res, next) => {
  try {
    const recruiterProfile = await RecruiterProfile.findOne({ user: req.user._id });
    if (!recruiterProfile || !recruiterProfile.company) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter is not associated with a company.',
      });
    }

    const { name, website, industry, size, logo, description, location, headquarters, foundedYear } = req.body;

    const company = await Company.findById(recruiterProfile.company);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
    }

    if (name) company.name = name;
    if (website !== undefined) company.website = website;
    if (industry) company.industry = industry;
    if (size) company.size = size;
    if (logo !== undefined) company.logo = logo;
    if (description !== undefined) company.description = description;
    if (location) company.location = location;
    if (headquarters !== undefined) company.headquarters = headquarters;
    if (foundedYear !== undefined) company.foundedYear = foundedYear;

    await company.save();

    res.json({
      success: true,
      company,
      message: 'Company details updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  updateMyCompany,
};

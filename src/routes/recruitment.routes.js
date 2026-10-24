const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

const {
  getRecruitmentStats,
  getJobOpenings,
  getJobOpeningById,
  createJobOpening,
  updateJobOpening,
  toggleJobStatus,
  deleteJobOpening,
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStage,
  deleteApplication,
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
  getTaxonomies,
  createTaxonomy,
  updateTaxonomy,
  toggleTaxonomyActive,
  deleteTaxonomy,
  seedRecruitmentData,
  clearAllRecruitmentData,
} = require('../controllers/recruitment.controller');

// Require authentication for all recruitment endpoints
router.use(verifyToken);

const canManageRecruitment = checkRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE', 'SUPER_ADMIN', 'COMPANY_ADMIN');

// --- Telemetry, Seeding & Wiping ---
router.get('/stats', getRecruitmentStats);
router.post('/seed', canManageRecruitment, seedRecruitmentData);
router.delete('/clear-all', canManageRecruitment, clearAllRecruitmentData);

// --- Job Openings ---
router.get('/jobs', getJobOpenings);
router.get('/jobs/:id', getJobOpeningById);
router.post('/jobs', canManageRecruitment, createJobOpening);
router.put('/jobs/:id', canManageRecruitment, updateJobOpening);
router.patch('/jobs/:id/status', canManageRecruitment, toggleJobStatus);
router.delete('/jobs/:id', canManageRecruitment, deleteJobOpening);

// --- Candidate Applications & Pipeline ---
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications', canManageRecruitment, createApplication);
router.put('/applications/:id', canManageRecruitment, updateApplication);
router.patch('/applications/:id/stage', canManageRecruitment, updateApplicationStage);
router.delete('/applications/:id', canManageRecruitment, deleteApplication);

// --- Interviews ---
router.get('/interviews', getInterviews);
router.post('/interviews', canManageRecruitment, createInterview);
router.put('/interviews/:id', canManageRecruitment, updateInterview);
router.delete('/interviews/:id', canManageRecruitment, deleteInterview);

// --- Master Data / Settings Taxonomies ---
router.get('/taxonomies', getTaxonomies);
router.post('/taxonomies', canManageRecruitment, createTaxonomy);
router.put('/taxonomies/:id', canManageRecruitment, updateTaxonomy);
router.patch('/taxonomies/:id/toggle', canManageRecruitment, toggleTaxonomyActive);
router.delete('/taxonomies/:id', canManageRecruitment, deleteTaxonomy);

module.exports = router;

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

// --- Telemetry, Seeding & Wiping ---
router.get('/stats', getRecruitmentStats);
router.post('/seed', checkRole('ADMIN', 'HR_MANAGER'), seedRecruitmentData);
router.delete('/clear-all', checkRole('ADMIN', 'HR_MANAGER'), clearAllRecruitmentData);

// --- Job Openings ---
router.get('/jobs', getJobOpenings);
router.get('/jobs/:id', getJobOpeningById);
router.post('/jobs', checkRole('ADMIN', 'HR_MANAGER'), createJobOpening);
router.put('/jobs/:id', checkRole('ADMIN', 'HR_MANAGER'), updateJobOpening);
router.patch('/jobs/:id/status', checkRole('ADMIN', 'HR_MANAGER'), toggleJobStatus);
router.delete('/jobs/:id', checkRole('ADMIN', 'HR_MANAGER'), deleteJobOpening);

// --- Candidate Applications & Pipeline ---
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationById);
router.post('/applications', checkRole('ADMIN', 'HR_MANAGER'), createApplication);
router.put('/applications/:id', checkRole('ADMIN', 'HR_MANAGER'), updateApplication);
router.patch('/applications/:id/stage', checkRole('ADMIN', 'HR_MANAGER'), updateApplicationStage);
router.delete('/applications/:id', checkRole('ADMIN', 'HR_MANAGER'), deleteApplication);

// --- Interviews ---
router.get('/interviews', getInterviews);
router.post('/interviews', checkRole('ADMIN', 'HR_MANAGER'), createInterview);
router.put('/interviews/:id', checkRole('ADMIN', 'HR_MANAGER'), updateInterview);
router.delete('/interviews/:id', checkRole('ADMIN', 'HR_MANAGER'), deleteInterview);

// --- Master Data / Settings Taxonomies ---
router.get('/taxonomies', getTaxonomies);
router.post('/taxonomies', checkRole('ADMIN', 'HR_MANAGER'), createTaxonomy);
router.put('/taxonomies/:id', checkRole('ADMIN', 'HR_MANAGER'), updateTaxonomy);
router.patch('/taxonomies/:id/toggle', checkRole('ADMIN', 'HR_MANAGER'), toggleTaxonomyActive);
router.delete('/taxonomies/:id', checkRole('ADMIN', 'HR_MANAGER'), deleteTaxonomy);

module.exports = router;

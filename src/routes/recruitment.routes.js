const express = require('express');
const router = express.Router();
const { verifyToken, blockDemo } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const { validateRequest } = require('../middlewares/validator.middleware');
const { param } = require('express-validator');
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
  getApplicationResume,
  createApplication,
  updateApplication,
  updateApplicationStage,
  deleteApplication,
  syncGmailScreening,
  getAiScreeningStatus,
  getScreenedOutApplications,
  aiOverrideApplication,
  aiRescanApplication,
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

const canManageRecruitment = checkRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE', 'SUPER_ADMIN');

// --- Telemetry, Seeding & Wiping ---
router.get('/stats', cacheService.middleware({ ttlSeconds: 60, tags: ['recruitment', 'recruitment-stats'] }), getRecruitmentStats);
router.post('/seed', blockDemo, canManageRecruitment, seedRecruitmentData);
router.delete('/clear-all', blockDemo, canManageRecruitment, clearAllRecruitmentData);

// --- Job Openings ---
router.get('/jobs', cacheService.middleware({ ttlSeconds: 60, tags: ['recruitment', 'recruitment-jobs'] }), getJobOpenings);
router.get('/jobs/:id', getJobOpeningById);
router.post('/jobs', blockDemo, canManageRecruitment, createJobOpening);
router.put('/jobs/:id', blockDemo, canManageRecruitment, updateJobOpening);
router.patch('/jobs/:id/status', blockDemo, canManageRecruitment, toggleJobStatus);
router.delete('/jobs/:id', blockDemo, canManageRecruitment, deleteJobOpening);

// --- Candidate Applications & Pipeline ---
router.get('/applications', cacheService.middleware({ ttlSeconds: 30, tags: ['recruitment', 'recruitment-apps'] }), getApplications);
router.get('/applications/:id', getApplicationById);
const canViewResumes = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN');
router.get('/applications/:id/resume', canViewResumes, getApplicationResume);
router.post('/applications', blockDemo, canManageRecruitment, createApplication);
router.put('/applications/:id', blockDemo, canManageRecruitment, updateApplication);
router.patch('/applications/:id/stage', blockDemo, canManageRecruitment, updateApplicationStage);
router.delete('/applications/:id', blockDemo, canManageRecruitment, deleteApplication);

// --- AI ATS Auto-Screening & Gmail Sync ---
router.post('/ai-screening/sync', blockDemo, canManageRecruitment, syncGmailScreening);
router.get('/ai-screening/status', canManageRecruitment, getAiScreeningStatus);
router.get('/ai-screening/screened-out', canManageRecruitment, cacheService.middleware({ ttlSeconds: 30, tags: ['recruitment', 'recruitment-screened-out'] }), getScreenedOutApplications);
router.post(
  '/applications/:id/ai-override',
  blockDemo,
  canManageRecruitment,
  param('id').notEmpty().withMessage('Valid application ID is required'),
  validateRequest,
  aiOverrideApplication
);
router.post(
  '/applications/:id/rescan',
  blockDemo,
  canManageRecruitment,
  param('id').notEmpty().withMessage('Valid application ID is required'),
  validateRequest,
  aiRescanApplication
);

// --- Interviews ---
router.get('/interviews', cacheService.middleware({ ttlSeconds: 30, tags: ['recruitment', 'recruitment-interviews'] }), getInterviews);
router.post('/interviews', blockDemo, canManageRecruitment, createInterview);
router.put('/interviews/:id', blockDemo, canManageRecruitment, updateInterview);
router.delete('/interviews/:id', blockDemo, canManageRecruitment, deleteInterview);

// --- Master Data / Settings Taxonomies ---
router.get('/taxonomies', getTaxonomies);
router.post('/taxonomies', blockDemo, canManageRecruitment, createTaxonomy);
router.put('/taxonomies/:id', blockDemo, canManageRecruitment, updateTaxonomy);
router.patch('/taxonomies/:id/toggle', blockDemo, canManageRecruitment, toggleTaxonomyActive);
router.delete('/taxonomies/:id', blockDemo, canManageRecruitment, deleteTaxonomy);

module.exports = router;

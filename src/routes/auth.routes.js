const express = require('express');
const router = express.Router();
const { registerTenant, login, getMe } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public Auth Routes
router.post('/register-tenant', registerTenant);
router.post('/login', login);

// Authenticated User Route
router.get('/me', verifyToken, getMe);

module.exports = router;

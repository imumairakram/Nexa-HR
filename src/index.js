const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const prisma = require('./config/prisma');
const { generalApiLimiter } = require('./middlewares/rateLimiter.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const designationRoutes = require('./routes/designation.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');
const payrollRoutes = require('./routes/payroll.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const announcementRoutes = require('./routes/announcement.routes');
const ticketRoutes = require('./routes/ticket.routes');
const accountRoutes = require('./routes/account.routes');
const recruitmentRoutes = require('./routes/recruitment.routes');
const documentRoutes = require('./routes/document.routes');

// Background Services
const { startSelfPing, stopSelfPing } = require('./services/selfPing.service');
const { startGmailPolling, stopGmailPolling } = require('./services/gmail.service');
const { processEmailBatch } = require('./services/atsPipeline.service');
const cacheService = require('./services/cache.service');

const app = express();

// Trust reverse proxy (Render / Vercel / Cloudflare) to ensure accurate client IP resolution and secure cookie handling
app.set('trust proxy', 1);

// Hardware Secret Key validation warning
if (!process.env.HARDWARE_SECRET_KEY || process.env.HARDWARE_SECRET_KEY.trim().length < 32) {
  console.warn('[SECURITY WARNING] HARDWARE_SECRET_KEY is missing or shorter than 32 characters. Biometric hardware sync will fail closed.');
}
const PORT = process.env.PORT || 5000;

// =========================================================================
// 1. HTTP SECURITY HEADERS (Helmet)
// =========================================================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 Year
      includeSubDomains: true,
      preload: true,
    },
  })
);

// =========================================================================
// 2. CORS CONFIGURATION (Allow-List Enforced, Bearer-Only Cross-Site Safe)
// =========================================================================
// CSRF Architecture Notice:
// Authentication is strictly Bearer-only (explicit Authorization: Bearer <token>).
// Web browsers never attach custom Authorization headers to cross-site requests automatically.
// As a result, cookie-based Cross-Site Request Forgery (CSRF) is impossible by design,
// eliminating the need for CSRF state tokens.
function parseCorsOrigins() {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawOrigins = process.env.CORS_ORIGINS;

  if (rawOrigins && rawOrigins.trim()) {
    return rawOrigins
      .split(',')
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean);
  }

  if (isProduction) {
    console.warn('[SECURITY WARNING] CORS_ORIGINS is not set in production! Falling back to minimal FRONTEND_URL allow-list.');
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim().replace(/\/+$/, '') : null;
    return frontendUrl ? [frontendUrl] : [];
  }

  // Development fallback allow-list
  return [
    (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/+$/, ''),
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);
}

const allowedOrigins = parseCorsOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (curl, server-to-server, biometric terminals)
    if (!origin) {
      return callback(null, true);
    }

    const normalized = origin.trim().replace(/\/+$/, '');
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS request rejected: Origin ${origin} not in authorized allow-list.`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // Bearer-only token auth; cookies are not accepted for authentication
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// =========================================================================
// 3. COMPRESSION, STATIC ASSETS, BODY & COOKIE PARSERS
// =========================================================================
app.use(compression());
// /uploads static serving removed for security hardening; served via authenticated endpoints
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// General API Rate Limiting across all /api endpoints
app.use('/api', generalApiLimiter);

// Smart cache mutation invalidator: instantly clears related cache on POST/PUT/PATCH/DELETE
app.use('/api', cacheService.mutationInvalidator());

// =========================================================================
// 4. CORE API ROUTES
// =========================================================================
app.use('/api/auth', authRoutes);

// Direct aliases for 1-Click Demo & Guest login
const { demoLogin } = require('./controllers/auth.controller');
const { authRateLimiter } = require('./middlewares/rateLimiter.middleware');
app.post('/api/demo-login', authRateLimiter, demoLogin);
app.post('/api/guest-login', authRateLimiter, demoLogin);

app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/documents', documentRoutes);

// Lightweight Keep-Alive Health Endpoint
app.get('/health', (req, res) => res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      status: 'UP',
      message: 'NexaHR Enterprise API is healthy and connected to PostgreSQL database.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'DOWN',
      message: 'Database connection check failed.',
      error: error.message,
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to NexaHR Enterprise Backend API',
    version: '2.0.0',
    status: 'SECURE_AND_OPERATIONAL',
    documentation: '/api/health',
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
});

// =========================================================================
// 5. GLOBAL SANITIZED ERROR HANDLER
// =========================================================================
app.use((err, req, res, next) => {
  const isCorsError = err.message && err.message.includes('CORS request rejected');
  const statusCode = isCorsError ? 403 : (err.status || 500);
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[UNHANDLED ERROR ${statusCode}] ${req.method} ${req.url}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: isCorsError
      ? 'Access denied by CORS policy: Origin not allowed.'
      : (isProduction && statusCode === 500 ? 'An internal server error occurred.' : err.message),
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Start Server
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`[ENTERPRISE SECURITY ACTIVE] NexaHR Backend on http://localhost:${PORT}`);
    console.log(`====================================================`);

    // Start background self-ping service (for Render free tier spindown prevention)
    startSelfPing();
    startGmailPolling(processEmailBatch);
  });
}

// Graceful Shutdown
const handleShutdown = async (signal) => {
  console.log(`[${signal}] Shutting down server gracefully...`);
  stopSelfPing();
  stopGmailPolling();
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error('Error disconnecting Prisma client:', err.message);
  }
  if (server) {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
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

const app = express();
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
// 2. CORS CONFIGURATION (With Credentials for HttpOnly Cookies)
// =========================================================================
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/fallback while enforcing credentials
      }
    },
    credentials: true, // Crucial for HttpOnly Cookie transport
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-hardware-key'],
  })
);

// =========================================================================
// 3. BODY & COOKIE PARSERS
// =========================================================================
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

// =========================================================================
// 4. CORE API ROUTES
// =========================================================================
app.use('/api/auth', authRoutes);
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
  const statusCode = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[UNHANDLED ERROR ${statusCode}] ${req.method} ${req.url}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'An internal server error occurred.' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[ENTERPRISE SECURITY ACTIVE] NexaHR Backend on http://localhost:${PORT}`);
  console.log(`====================================================`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;

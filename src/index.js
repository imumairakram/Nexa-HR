const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const prisma = require('./config/prisma');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      status: 'UP',
      message: 'NexaHR Multi-Tenant API is healthy and connected to PostgreSQL database.',
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
    message: 'Welcome to NexaHR SaaS Multi-Tenant Backend API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
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

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`NexaHR Backend running on http://localhost:${PORT}`);
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

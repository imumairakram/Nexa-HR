# 🚀 NexaHR — Engineering Implementation & Architecture Roadmap

**Project Name:** NexaHR Enterprise Human Resource Management System (HRMS)  
**Version:** `2.0.0 Enterprise`  
**Execution Horizon:** Full Enterprise Rollout & Production Hardening  

---

## 1. Implementation Roadmap & Milestones

```
+-------------------------------------------------------------------------------+
| PHASE 1: Core Foundation & Database Architecture (PostgreSQL + Prisma)        |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 2: Enterprise Authentication, RBAC & OTP Security Engine                |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 3: Personnel Information Management (PIM) & Media Pipeline              |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 4: Biometric Attendance Engine & Time-Tracking Workflows                |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 5: Leave Management Subsystem & Policy Calculation Engine               |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 6: Automated Gross-to-Net Payroll & Payslip Generation                  |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 7: Recruitment Pipeline (ATS) & Job Desk Management                     |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 8: Employee Self-Service (ESS) Portal & Responsive Layouts              |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 9: Communications, Notification Center & Regional Localization          |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| PHASE 10: End-to-End Testing, Security Hardening & Production Deployment      |
+-------------------------------------------------------------------------------+
```

---

## 2. Phase-by-Phase Technical Breakdown

### Phase 1: Core Foundation & Database Infrastructure
- **Deliverables:**
  - Setup Node.js Express backend with modular folder structure (`config`, `controllers`, `middlewares`, `routes`, `services`, `utils`).
  - Initialize PostgreSQL schema via Prisma ORM v5 (`prisma/schema.prisma`).
  - Configure database connection pooling and automatic migration pipelines.
  - Implement dynamic seeding scripts (`prisma/seed.js`, `prisma/create-initial-admins.js`).

### Phase 2: Authentication, RBAC & Security Enforcements
- **Deliverables:**
  - JWT generation and verification middleware (`auth.middleware.js`).
  - Role-Based Access Control gatekeeper (`rbac.middleware.js`) supporting `ADMIN`, `HR_MANAGER`, `EMPLOYEE`.
  - Mandatory first-login password update mechanism (`mustChangePassword`).
  - Cryptographic 6-digit OTP password recovery with brute-force protection (3-attempt limit, 10-minute expiry) via Nodemailer and Twilio.
  - Rate-limiting middleware (`rateLimiter.middleware.js`) and Helmet HTTP header hardening.

### Phase 3: Personnel Information Management (PIM) & Media Pipeline
- **Deliverables:**
  - Full Employee CRUD operations with auto-formatted employee code generator (`EMP-XXX-NNN`).
  - Department and Designation relational hierarchy management.
  - Multipart image processing with Multer memory buffer and Cloudinary streaming upload (`upload.middleware.js`, `cloudinary.js`).
  - Fail-safe fallback to high-resolution SVG avatars when cloud storage is offline.

### Phase 4: Biometric Attendance Engine & Time Tracking
- **Deliverables:**
  - Real-time check-in and check-out endpoints with IP and timestamp logging.
  - Automated status classifier (`PRESENT`, `LATE`, `HALF_DAY`, `ABSENT`).
  - Total decimal hours worked calculation factoring shift durations.
  - HR Attendance management grid with manual punch adjustment capabilities and status overrides.

### Phase 5: Leave Management & Policy Calculation Subsystem
- **Deliverables:**
  - Leave type registry with custom quotas (Annual, Sick, Casual, Maternity, Unpaid).
  - Employee leave submission modal with balance validation and date conflict prevention.
  - HR adjudication dashboard with single-click approval, rejection with mandatory reason, and status badges.
  - Real-time leave balance ledger deduction and automated unpaid day flagging for payroll.

### Phase 6: Automated Monthly Payroll Computation
- **Deliverables:**
  - Salary structure definition per employee (Basic Salary, Housing, Transport, Allowances, Deductions).
  - Batch payroll execution engine calculating gross, tax, and pro-rata unpaid leave deductions:
    $$\text{Unpaid Deduction} = \left(\frac{\text{Gross Salary}}{30}\right) \times \text{Unpaid Leave Days}$$
  - Dynamic payslip generation with audit IDs and printable/downloadable enterprise layouts.
  - Employee Self-Service payslip archive view.

### Phase 7: Recruitment Module (ATS) & Job Desk
- **Deliverables:**
  - Job requisition management by Category, Job Type, Location, Skills, and Experience.
  - Applicant pipeline tracking across Kanban/Tabular stages (*Applied*, *Screening*, *Interview*, *Offered*, *Hired*).
  - Candidate evaluation cards and interviewer feedback recording.
  - Direct conversion of hired candidates to active employee profiles in PIM.

### Phase 8: Employee Self-Service (ESS) & Responsive Layouts
- **Deliverables:**
  - Dedicated Employee Self-Service layout (`EmployeeLayout.jsx`) with responsive navigation and bottom bar for mobile.
  - Employee Dashboard featuring live shift punch timer, leave balance widgets, recent announcements, and quick actions.
  - Self-service Document Library, Company Policy Handbooks, and Helpdesk Ticket System.
  - Personal profile and credentials self-management.

### Phase 9: Communications, Notifications & Regional Settings
- **Deliverables:**
  - In-app notification bell with live counter, mark-as-read, and deep-link routing.
  - Corporate announcement board with pinned high-priority alerts and department targeting.
  - Global `RegionalSettingsContext` supporting localized Date Formats (`DD/MM/YYYY`, `MM/DD/YYYY`, `YYYY-MM-DD`), Currencies (`$`, `€`, `£`, `PKR`, `₹`, `AED`), and Timezones.
  - ThemeContext providing seamless Dark and Light theme switching with localStorage persistence.

### Phase 10: Verification, Security Audits & Deployment
- **Deliverables:**
  - Automated integration test suites:
    - `test-db.js`: Database connectivity and relational schema integrity.
    - `test-security-suite.js`: Password hashing, JWT token signature validation, and RBAC gate checks.
    - `test-recovery.js`: OTP generation, email routing, attempt throttling, and password reset.
    - `test-profile-picture-pipeline.js`: Avatar upload and stream verification.
    - `test-notification-flow.js`: Notification broadcast and in-app feed verification.
    - `test-employee-flow.js`: End-to-end onboarding and salary binding.
  - Unified startup scripts (`run.bat`, `run.sh`) for single-command launching.
  - Production build optimization via Vite with code splitting and gzipped assets.

---

## 3. Verification & Test Suite Execution Matrix

```bash
# 1. Verify Database Connectivity & Schema
node test-db.js

# 2. Verify Security, Hashing & JWT RBAC Guards
node test-security-suite.js

# 3. Verify OTP Recovery & Brute-Force Throttling
node test-recovery.js

# 4. Verify Media Ingestion & Cloud Streaming
node test-profile-picture-pipeline.js

# 5. Verify Notification Broadcast Engine
node test-notification-flow.js

# 6. Verify Full Employee Onboarding & Payroll Binding
node test-employee-flow.js

# 7. Execute Production Client Build
npm run build --prefix client
```

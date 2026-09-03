# 🏗️ NexaHR — Backend Architecture & Technical Design Document

**System Classification:** Enterprise Core Human Resource Management System (HRMS)  
**Backend Framework:** Node.js / Express.js  
**Database & ORM:** PostgreSQL / Prisma ORM v5  
**Authentication & Security:** JWT (JSON Web Tokens), Bcrypt.js, RBAC Middleware  
**File Storage & Media:** Cloudinary Media Pipeline with MemoryStream Buffer & Local Dev Fallback  
**Document Version:** 2.0.0  
**Target Audience:** System Architects, Backend Engineers, DevOps, QA Engineers, and Technical Leads  

---

## 📑 Table of Contents

1. [Executive Summary & Architectural Principles](#1-executive-summary--architectural-principles)
2. [High-Level System Topology](#2-high-level-system-topology)
3. [Layered Architecture Breakdown](#3-layered-architecture-breakdown)
4. [Request-Response Lifecycle & Middleware Pipeline](#4-request-response-lifecycle--middleware-pipeline)
5. [Authentication, Authorization & Security Architecture](#5-authentication-authorization--security-architecture)
6. [Database Schema & Data Model Topology](#6-database-schema--data-model-topology)
7. [Core Subsystems & Business Logic Execution](#7-core-subsystems--business-logic-execution)
   - [7.1 Authentication & Multi-Channel Recovery Subsystem](#71-authentication--multi-channel-recovery-subsystem)
   - [7.2 Personnel Information Management (PIM) Subsystem](#72-personnel-information-management-pim-subsystem)
   - [7.3 Biometric Attendance & Time Tracking Engine](#73-biometric-attendance--time-tracking-engine)
   - [7.4 Leave Management & Balance Engine](#74-leave-management--balance-engine)
   - [7.5 Automated Payroll & Compensation Processing](#75-automated-payroll--compensation-processing)
   - [7.6 Multi-Channel Notification & Announcement Engine](#76-multi-channel-notification--announcement-engine)
   - [7.7 Dashboard & Business Intelligence Aggregation Engine](#77-dashboard--business-intelligence-aggregation-engine)
8. [Media Storage & Cloud Streaming Pipeline](#8-media-storage--cloud-streaming-pipeline)
9. [Comprehensive REST API Routing Architecture](#9-comprehensive-rest-api-routing-architecture)
10. [Error Handling, Observability & Resilience](#10-error-handling-observability--resilience)
11. [Configuration, Migrations & Deployment Strategy](#11-configuration-migrations--deployment-strategy)

---

## 1. Executive Summary & Architectural Principles

The NexaHR Backend is engineered as a high-performance, modular, decoupled RESTful API service. It orchestrates enterprise HR workflows, employee identity lifecycles, biometric attendance calculations, leave workflows, automated payroll computations, in-app notifications, and company-wide announcements.

### Key Architectural Tenets:
* **Separation of Concerns (SoC):** Strict separation across Routes, Middleware, Controllers, Services, and Data Access (Prisma Client).
* **Stateless REST Services:** The backend holds no in-memory user sessions; authentication is managed via cryptographically signed JWT tokens.
* **Role-Based Access Control (RBAC):** Granular, route-level authorization ensuring enterprise boundary isolation across `ADMIN`, `HR_MANAGER`, and `EMPLOYEE`.
* **Zero-Disk Streaming:** Avatar and profile image uploads bypass persistent local disks via in-memory streaming directly to Cloudinary CDN storage with automated fallback.
* **Data Integrity & Consistency:** Relational modeling on PostgreSQL with foreign-key constraints, cascading deletes, unique indexes, and schema validations managed via Prisma ORM.

---

## 2. High-Level System Topology

```mermaid
graph TD
    Client[SPA Frontend / Mobile Clients] -->|HTTPS / JSON REST API| Gateway[Express.js Application Router]
    
    subgraph "Middleware Security & Processing Pipeline"
        Gateway --> CORS[CORS Middleware]
        CORS --> Parser[JSON Body Parser]
        Parser --> AuthMW[JWT Authentication Middleware]
        AuthMW --> RBACMW[RBAC Authorization Middleware]
        RBACMW --> UploadMW[Multer Memory-Storage Middleware]
    end

    subgraph "Controller Layer"
        UploadMW --> AuthCtrl[Auth Controller]
        UploadMW --> EmpCtrl[Employee Controller]
        UploadMW --> AttCtrl[Attendance Controller]
        UploadMW --> LeaveCtrl[Leave Controller]
        UploadMW --> PayCtrl[Payroll Controller]
        UploadMW --> DeptCtrl[Department/Designation Controller]
        UploadMW --> AnnCtrl[Announcement Controller]
        UploadMW --> NotifCtrl[Notification Controller]
        UploadMW --> DashCtrl[Dashboard Controller]
    end

    subgraph "Service & Domain Logic Layer"
        PayCtrl --> PayService[Payroll Engine Service]
        LeaveCtrl --> NotifService[Notification & Mailer Service]
        AnnCtrl --> NotifService
        AuthCtrl --> NotifService
        EmpCtrl --> CloudinaryService[Cloudinary Streaming Service]
    end

    subgraph "Data Access & Persistence Layer"
        AuthCtrl & EmpCtrl & AttCtrl & LeaveCtrl & PayCtrl & DeptCtrl & AnnCtrl & NotifCtrl & DashCtrl --> PrismaORM[Prisma Client v5]
        PrismaORM --> PostgresDB[(PostgreSQL Database)]
    end

    subgraph "External Cloud Infrastructure"
        CloudinaryService --> CloudinaryCDN[(Cloudinary CDN / Asset Storage)]
        NotifService --> CorporateEmail[Corporate SMTP / Dispatch Engine]
        NotifService --> WhatsAppGateway[WhatsApp Notification Gateway]
    end
```

---

## 3. Layered Architecture Breakdown

The codebase is organized into clean, predictable layers under `src/`:

```
src/
├── config/             # Third-party integrations & singleton clients (Prisma, Cloudinary)
│   ├── cloudinary.js   # Cloudinary configuration, streaming upload & deletion helpers
│   └── prisma.js       # Prisma client instantiation & connection lifecycle
├── controllers/        # HTTP request handlers, validation & response generation
│   ├── announcement.controller.js
│   ├── attendance.controller.js
│   ├── auth.controller.js
│   ├── dashboard.controller.js
│   ├── department.controller.js
│   ├── designation.controller.js
│   ├── employee.controller.js
│   ├── leave.controller.js
│   ├── notification.controller.js
│   └── payroll.controller.js
├── middlewares/        # Cross-cutting interceptors
│   ├── auth.middleware.js      # JWT token validation & req.user injection
│   ├── rbac.middleware.js      # Role-based access control enforcement
│   ├── tenant.middleware.js    # Single-tenant context validator
│   └── upload.middleware.js    # Multer memory storage & file type/size validation
├── routes/             # Express route declarations mapped to controllers & middlewares
│   ├── announcement.routes.js
│   ├── attendance.routes.js
│   ├── auth.routes.js
│   ├── dashboard.routes.js
│   ├── department.routes.js
│   ├── designation.routes.js
│   ├── employee.routes.js
│   ├── leave.routes.js
│   ├── notification.routes.js
│   └── payroll.routes.js
├── services/           # Reusable core domain business logic
│   ├── notification.service.js # Multi-channel in-app & email/WhatsApp dispatchers
│   └── payroll.service.js      # Salary calculation & unpaid leave deduction engine
├── utils/              # Cryptographic, token & helper utilities
│   ├── jwt.js          # JWT signing, verification & reset token generation
│   └── password.js     # Bcrypt hashing & verification
└── index.js            # Express app bootstrap, middleware stack, health probes & shutdown hooks
```

---

## 4. Request-Response Lifecycle & Middleware Pipeline

Every inbound HTTP request traverses an orchestrated sequence of middlewares prior to executing controller logic:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend Client
    participant Express as Express.js Server
    participant AuthMW as Auth Middleware
    participant RBAC as RBAC Middleware
    participant UploadMW as Multer Middleware
    participant Controller as Domain Controller
    participant Service as Business Service
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL

    Client->>Express: HTTP POST /api/employees (Bearer JWT + FormData)
    Express->>Express: Apply CORS & JSON Body Parsing
    Express->>AuthMW: verifyToken(req, res, next)
    AuthMW->>AuthMW: Extract & Verify Bearer JWT
    AuthMW->>Prisma: Query active User by decoded ID
    Prisma->>DB: SELECT * FROM users WHERE id = :id
    DB-->>Prisma: User Record (Active)
    AuthMW->>AuthMW: Attach req.user = { userId, email, role, fullName }
    AuthMW->>RBAC: checkRole('ADMIN', 'HR_MANAGER')
    RBAC->>RBAC: Validate req.user.role in allowed roles
    RBAC->>UploadMW: handleUploadMiddleware('avatar')
    UploadMW->>UploadMW: Buffer file in memory (Limit 5MB, MIME check)
    UploadMW->>Controller: createEmployee(req, res)
    Controller->>Service: Upload avatar stream to Cloudinary
    Service-->>Controller: Secure CDN URL
    Controller->>Prisma: prisma.user.create() with profile & salary
    Prisma->>DB: BEGIN TRANSACTION ... INSERT INTO users, employee_profiles ... COMMIT
    DB-->>Prisma: New Employee Entity
    Controller-->>Client: HTTP 201 Created (JSON Response)
```

### Middleware Specifications:

| Middleware | File | Purpose | Failure Code |
| :--- | :--- | :--- | :--- |
| **`cors()`** | Express Core | Cross-Origin Resource Sharing whitelist & headers | `403 Forbidden` |
| **`express.json()`** | Express Core | Parses `application/json` payload bodies | `400 Bad Request` |
| **`verifyToken`** | `auth.middleware.js` | Parses Authorization header, verifies JWT, checks `isActive` in DB | `401 Unauthorized` |
| **`checkRole(...roles)`** | `rbac.middleware.js` | Evaluates caller role against authorized whitelist | `403 Forbidden` |
| **`handleUploadMiddleware`** | `upload.middleware.js` | Multer memory buffer, 5MB limit, JPEG/PNG/WEBP/GIF whitelist | `400 Bad Request` |
| **Global Error Handler** | `index.js` | Traps unhandled errors and formats standard JSON response | `500 Internal Server Error` |

---

### 5.1 Token-Based Authentication & Transport Flow
NexaHR implements an enterprise-hardened JSON Web Token (JWT) architecture:
1. **Signing Algorithm:** HMAC SHA-256 (`HS256`).
2. **Payload Claims:** `{ userId, role, iat, exp }`.
3. **Session Expiration:** Strict **24-Hour lifespan** (`24h`).
4. **Transport Layer:** Transmitted via secure, `HttpOnly`, `Secure` (production), and `SameSite` cookies with fallback to `Authorization: Bearer` header for external API interoperability.
5. **Zero Backdoors:** Pure cryptographic verification; all legacy development bypass tokens have been completely eliminated.

### 5.2 Ephemeral Cryptographic Password Recovery Lifecycle
* **Cryptographic Token Generation:** Password recovery utilizes 20-byte cryptographically secure random hex tokens (`crypto.randomBytes(20).toString('hex')`).
* **SHA-256 Storage:** Only SHA-256 digests (`crypto.createHash('sha256').update(token).digest('hex')`) are persisted in the PostgreSQL database.
* **Strict Expiry & Invalidation:** Single-use tokens expire strictly after 1 hour (60 minutes). All pending tokens are automatically invalidated upon use or re-issuance.
* **Timing-Safe Responses:** Uniform responses are returned during password recovery requests to prevent user enumeration attacks.

### 5.3 Anti-IDOR (Insecure Direct Object Reference) Protection
* **Query Scoping:** Controllers enforce strict boundary scoping. When an `EMPLOYEE` queries endpoints like `/api/employees/:id` or `/api/attendance/my-logs`, queries are strictly forced to `where: { userId: req.user.userId }`, rejecting any attempt to read unauthorized peer records.

### 5.3 Role-Based Access Control (RBAC) Matrix

| Endpoint Group | `ADMIN` | `HR_MANAGER` | `EMPLOYEE` |
| :--- | :---: | :---: | :---: |
| **Admin Registration** | 🟢 (Open/Restricted) | 🔴 Forbidden | 🔴 Forbidden |
| **Employee Provisioning & Offboarding** | 🟢 Full Access | 🟢 Full Access | 🔴 Forbidden |
| **Employee Self Profile View & Update** | 🟢 Full Access | 🟢 Full Access | 🟢 Own Profile Only |
| **Biometric Attendance Check-in/Out** | 🟢 Full Access | 🟢 Full Access | 🟢 Own Record |
| **Attendance Modification / Admin Audit** | 🟢 Full Access | 🟢 Full Access | 🔴 Forbidden |
| **Leave Request Application** | 🟢 Full Access | 🟢 Full Access | 🟢 Own Leaves |
| **Leave Approval / Rejection Workflow** | 🟢 Full Access | 🟢 Full Access | 🔴 Forbidden |
| **Salary Structure Configuration** | 🟢 Full Access | 🟢 Full Access | 🔴 Forbidden |
| **Bulk & Single Payroll Generation** | 🟢 Full Access | 🟢 Full Access | 🔴 Forbidden |
| **Payslip Access** | 🟢 All Payslips | 🟢 All Payslips | 🟢 Own Payslips Only |
| **Announcement Creation / Deletion** | 🟢 Full Access | 🟢 Full Access | 🔴 Read-Only |
| **Department & Designation Config** | 🟢 Full Access | 🟢 Full Access | 🔴 Read-Only |
| **Analytics & Financial Dashboard** | 🟢 Full Metrics | 🟢 HR Metrics | 🟢 Employee Personal KPIs |

---

## 6. Database Schema & Data Model Topology

The relational model is declared in `prisma/schema.prisma` and hosted on PostgreSQL.

```mermaid
erDiagram
    User ||--o| EmployeeProfile : "has profile"
    User ||--o{ Attendance : "records"
    User ||--o{ LeaveRequest : "requests"
    User ||--o{ LeaveRequest : "approves"
    User ||--o| SalaryStructure : "assigned structure"
    User ||--o{ Payslip : "receives"
    User ||--o{ PasswordResetOtp : "generates"
    User ||--o{ Notification : "receives"

    Department ||--o{ Designation : "contains"
    Department ||--o{ EmployeeProfile : "assigned to"
    Designation ||--o{ EmployeeProfile : "held by"

    LeaveType ||--o{ LeaveRequest : "categorizes"

    RolePermission ||--|| Permission : "links"

    User {
        string id PK
        string employeeCode UK
        string email UK
        string password
        string firstName
        string lastName
        string phone
        Role role
        boolean isActive
        boolean mustChangePassword
        datetime createdAt
        datetime updatedAt
    }

    EmployeeProfile {
        string id PK
        string userId FK,UK
        string avatarUrl
        string gender
        datetime dateOfBirth
        datetime joiningDate
        string employmentType
        string shift
        string address
        string emergencyContact
        string departmentId FK
        string designationId FK
    }

    Department {
        string id PK
        string name
        string code UK
        string description
    }

    Designation {
        string id PK
        string departmentId FK
        string title UK
        string description
    }

    Attendance {
        string id PK
        string userId FK
        date date
        datetime checkInTime
        datetime checkOutTime
        AttendanceStatus status
        float totalHours
        string notes
    }

    LeaveType {
        string id PK
        string name
        string code UK
        int daysAllowed
        boolean isPaid
    }

    LeaveRequest {
        string id PK
        string userId FK
        string leaveTypeId FK
        date startDate
        date endDate
        int totalDays
        string reason
        LeaveStatus status
        string approvedById FK
        string rejectionReason
    }

    SalaryStructure {
        string id PK
        string userId FK,UK
        float basicSalary
        float housingAllowance
        float transportAllowance
        float otherAllowances
        float taxDeductions
        float otherDeductions
        datetime effectiveDate
    }

    Payslip {
        string id PK
        string userId FK
        int month
        int year
        float basicSalary
        float totalAllowances
        float taxDeductions
        int unpaidLeaveDays
        float unpaidLeaveDeduction
        float otherDeductions
        float grossSalary
        float netSalary
        PayslipStatus status
        datetime generatedAt
    }

    PasswordResetOtp {
        string id PK
        string userId FK
        string email
        string phone
        string otpHash
        string channel
        datetime expiresAt
        boolean isUsed
        int attempts
    }

    Notification {
        string id PK
        string userId FK
        string title
        string message
        string type
        string category
        string link
        boolean isRead
        datetime createdAt
    }

    Announcement {
        string id PK
        string title
        string category
        string priority
        string department
        string summary
        string content
        string author
        boolean pinned
        datetime createdAt
    }
```

### Key Schema Characteristics & Indexes:
1. **Compound Unique Indexes:**
   - `Attendance`: `@@unique([userId, date])` ensures strict 1 attendance record per employee per calendar date.
   - `Payslip`: `@@unique([userId, month, year])` prevents duplicate monthly payroll calculations.
   - `RolePermission`: `@@unique([role, permissionId])`.
2. **Referential Integrity Actions:**
   - Deleting a `User` cascades to delete their `EmployeeProfile`, `Attendance`, `SalaryStructure`, `Payslip`, and `Notification` records (`onDelete: Cascade`).
   - Foreign references to `Department` and `Designation` on `EmployeeProfile` set null on deletion (`onDelete: SetNull`).
3. **Query Optimization Indexes:**
   - `Attendance`: Index on `date` for fast date-range attendance audits.
   - `LeaveRequest`: Index on `userId` for quick employee balance checks.
   - `Payslip`: Index on `[year, month]` for payroll ledger reporting.
   - `Notification`: Index on `userId` and `createdAt`.

---

## 7. Core Subsystems & Business Logic Execution

### 7.1 Authentication & Multi-Channel Recovery Subsystem
* **Login Pipeline:** Normalizes email, verifies bcrypt password, checks account active status, checks `mustChangePassword` flag, and signs JWT.
* **Multi-Channel Forgot Password:** Allows user to select `EMAIL` or `WHATSAPP` channel. Generates 6-digit OTP, computes SHA-256 hash, stores in `PasswordResetOtp` table, and dispatches notification via `notification.service.js`.
* **OTP Verification & Password Reset:** Verifies OTP hash, tracks retry attempts, returns a single-use JWT reset token (`generateResetToken`), and updates user password with bcrypt hashing.

### 7.2 Personnel Information Management (PIM) Subsystem
* **Atomic Employee Provisioning:** Utilizes Prisma transactions or coordinated creates to generate `User`, `EmployeeProfile`, and initial `SalaryStructure`.
* **Automatic Employee Code Generation:** Generates formatted employee identifiers (e.g. `EMP-2026-001`, `EMP-ADMIN-001`).
* **Profile Picture Pipeline:** Multer receives raw buffer $\rightarrow$ streams to Cloudinary $\rightarrow$ receives secure HTTPS URL $\rightarrow$ persists `avatarUrl` to `EmployeeProfile`.

### 7.3 Biometric Attendance & Time Tracking Engine
* **Check-In Logic:** Verifies if an attendance record exists for the current date (`userId + date`). If not, records `checkInTime`. Determines status (`PRESENT`, `LATE` based on shift start time e.g., 09:15 AM threshold).
* **Check-Out & Hours Calculation:** Calculates `totalHours = (checkOutTime - checkInTime) / 3600000`. If `totalHours < 4.5`, automatically marks status as `HALF_DAY`.
* **Biometric Hardware Ingestion:** Accepts direct API ingestion from biometric time-clocks with automatic date-time normalization.

### 7.4 Leave Management & Balance Engine
* **Entitlement & Quota Computation:** Computes dynamic leave balance:
  $$\text{Remaining Days} = \text{LeaveType.daysAllowed} - \sum \text{Approved LeaveRequest.totalDays in current year}$$
* **Overlap Validation:** Queries existing leave requests for date intersections:
  $$\text{Overlap Condition: } (\text{startDate} \le \text{req.endDate}) \land (\text{endDate} \ge \text{req.startDate}) \land (\text{status} \ne \text{'REJECTED'})$$
* **Approval & Notification Workflow:** When an Admin or HR Manager approves/declines a leave request, the engine updates status, records `approvedById`, triggers an in-app notification, and dispatches an automated corporate email to the employee.

### 7.5 Automated Payroll & Compensation Processing
The payroll service (`src/services/payroll.service.js`) computes compensation with mathematical precision:

```
Gross Salary = Basic Salary + Housing Allowance + Transport Allowance + Other Allowances
Daily Rate = Basic Salary / 30
Unpaid Leave Days = Sum of totalDays for APPROVED unpaid leaves in target month
Unpaid Leave Deduction = Unpaid Leave Days * Daily Rate
Total Deductions = Tax Deductions + Other Deductions + Unpaid Leave Deduction
Net Take-Home Salary = Gross Salary - Total Deductions
```

* **Batch Payroll Generation:** Scans all active employees with defined `SalaryStructure`, computes monthly payroll, and generates batch `Payslip` records in a single transactional batch.
* **Disbursement Notification:** Sends in-app and email payslip notifications upon payroll finalization.

### 7.6 Multi-Channel Notification & Announcement Engine
* **In-App Notifications:** Instant creation and persistence in `notifications` table; unread counts and read-state management.
* **Corporate Email Dispatcher:** Pre-formatted corporate HTML-style email logs for:
  - Announcement broadcasts (company-wide or department-specific)
  - Leave submission, approval, and rejection alerts
  - Monthly payslip release alerts
  - Security OTP dispatch
* **WhatsApp Dispatch Engine:** Formatted enterprise mobile messaging with expiry warnings.

### 7.7 Dashboard & Business Intelligence Aggregation Engine
* **Executive & HR View:** Aggregates total headcount, active employees, on-leave count, today's attendance rate, department distribution, and monthly payroll liability.
* **Employee Self-Service View:** Aggregates individual attendance percentage, remaining leave balance by category, latest payslips, and unread announcements.

---

## 8. Media Storage & Cloud Streaming Pipeline

NexaHR uses a non-blocking memory streaming architecture for file uploads:

```mermaid
graph LR
    User[Client Multipart/Form-Data] -->|Stream| Multer[Multer MemoryStorage]
    Multer -->|RAM Buffer| NodeBuffer[Memory Buffer 5MB Limit]
    NodeBuffer -->|stream.Readable.pipe| CloudinaryStream[Cloudinary upload_stream]
    CloudinaryStream -->|Face Detect Auto Crop 400x400| CloudinaryCDN[Cloudinary CDN]
    CloudinaryCDN -->|Secure HTTPS URL| Controller[Employee Controller]
    Controller -->|Save URL| Postgres[(PostgreSQL)]
```

### Media Fault-Tolerance & Dev Fallback:
If Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are omitted during local development, the backend automatically falls back to an optimized base64 data URI format, ensuring zero disruption to local testing.

---

## 9. Comprehensive REST API Routing Architecture

All routes are prefixed with `/api`.

### 9.1 Authentication (`/api/auth`)
* `POST /api/auth/register-admin` — Register initial System Administrator
* `POST /api/auth/login` — Authenticate and receive JWT token
* `GET /api/auth/me` — Fetch currently authenticated user identity and role
* `POST /api/auth/change-password` — Change password for authenticated session
* `POST /api/auth/forgot-password` — Initiate OTP generation & dispatch (Email/WhatsApp)
* `POST /api/auth/verify-otp` — Verify 6-digit OTP and obtain password reset token
* `POST /api/auth/reset-password` — Set new password using reset token

### 9.2 Personnel & Employee Management (`/api/employees`)
* `GET /api/employees` — List all employees (supports search, department, role filtering)
* `POST /api/employees` — Create employee + profile + salary structure (`ADMIN`, `HR_MANAGER`)
* `GET /api/employees/:id` — Get comprehensive employee profile details
* `PUT /api/employees/:id` — Update employee demographic and job data
* `DELETE /api/employees/:id` — Offboard / delete employee record (`ADMIN`)
* `POST /api/employees/:id/avatar` — Upload and attach avatar image via Cloudinary

### 9.3 Biometric Attendance (`/api/attendance`)
* `POST /api/attendance/check-in` — Record daily check-in
* `POST /api/attendance/check-out` — Record daily check-out & compute total hours
* `GET /api/attendance/today` — Get today's attendance status for logged-in user
* `GET /api/attendance/history` — Get attendance logs for authenticated user
* `GET /api/attendance/all` — Audit attendance logs across organization (`ADMIN`, `HR_MANAGER`)
* `GET /api/attendance/summary` — Monthly attendance analytics summary

### 9.4 Leaves & Time-Off (`/api/leaves`)
* `GET /api/leaves/types` — List configured leave categories and quotas
* `POST /api/leaves/types` — Create new leave category (`ADMIN`)
* `POST /api/leaves/request` — Submit leave application
* `GET /api/leaves/my-requests` — List user's leave application history
* `GET /api/leaves/balance` — Calculate remaining leave balances for user
* `GET /api/leaves/all` — List all organization leave requests (`ADMIN`, `HR_MANAGER`)
* `PUT /api/leaves/:id/status` — Approve or Reject leave request (`ADMIN`, `HR_MANAGER`)

### 9.5 Payroll & Compensation (`/api/payroll`)
* `GET /api/payroll/structure/:userId` — Retrieve salary structure for employee
* `POST /api/payroll/structure` — Create or update salary structure (`ADMIN`, `HR_MANAGER`)
* `POST /api/payroll/generate` — Generate payslip for single employee
* `POST /api/payroll/generate-all` — Batch generate payslips for all active staff
* `GET /api/payroll/payslips` — List all generated payslips (`ADMIN`, `HR_MANAGER`)
* `GET /api/payroll/my-payslips` — List authenticated employee's payslips
* `GET /api/payroll/payslip/:id` — Retrieve full breakdown of a single payslip

### 9.6 Organization Hierarchy (`/api/departments` & `/api/designations`)
* `GET /api/departments` — List departments with designation counts & headcounts
* `POST /api/departments` — Create new department (`ADMIN`, `HR_MANAGER`)
* `PUT /api/departments/:id` — Update department details
* `DELETE /api/departments/:id` — Remove department
* `GET /api/designations` — List designations with department relationships
* `POST /api/designations` — Create new job designation
* `PUT /api/designations/:id` — Update designation
* `DELETE /api/designations/:id` — Remove designation

### 9.7 Bulletins & Announcements (`/api/announcements`)
* `GET /api/announcements` — List announcements (sorted by pinned status and date)
* `POST /api/announcements` — Publish company announcement (`ADMIN`, `HR_MANAGER`)
* `PUT /api/announcements/:id` — Update announcement
* `DELETE /api/announcements/:id` — Delete announcement (`ADMIN`, `HR_MANAGER`)

### 9.8 Notifications (`/api/notifications`)
* `GET /api/notifications` — Retrieve user's in-app notification feed
* `PUT /api/notifications/:id/read` — Mark specific notification as read
* `PUT /api/notifications/read-all` — Mark all notifications as read

### 9.9 Dashboard & Analytics (`/api/dashboard`)
* `GET /api/dashboard/stats` — Role-tailored operational KPIs and business metrics
* `GET /api/dashboard/attendance-trend` — Weekly/Monthly attendance analytics
* `GET /api/dashboard/department-distribution` — Headcount distribution across units

### 9.10 System Health (`/api/health`)
* `GET /api/health` — Probes database connectivity via `SELECT 1` and returns system uptime.

---

## 10. Error Handling, Observability & Resilience

### 10.1 Standardized API Response Schema

#### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

#### Error Response:
```json
{
  "success": false,
  "message": "Human-readable description of error.",
  "error": "Detailed error string (in development mode)"
}
```

### 10.2 Global Exception Interception
* **404 Route Interceptor:** Catches unmapped routes and returns structured JSON.
* **Global Error Middleware:** Captures runtime exceptions, logs stack traces to standard error, and returns appropriate HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`).
* **Process Signal Handling:** Traps `SIGINT` and `SIGTERM` to gracefully disconnect the Prisma client and finish in-flight HTTP connections before exiting.

---

## 11. Configuration, Migrations & Deployment Strategy

### 11.1 Environment Variables Specification (`.env`)

| Variable | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Integer | HTTP listener port | `5000` |
| `NODE_ENV` | String | Runtime environment (`development`, `production`) | `development` |
| `DATABASE_URL` | String | PostgreSQL Connection URI with pooling parameters | `postgresql://postgres:pass@localhost:5432/nexahr_db?schema=public` |
| `JWT_SECRET` | String | High-entropy secret key for signing session tokens | `your-secure-jwt-secret-key-2026` |
| `JWT_EXPIRES_IN` | String | Expiry timeframe for JWT sessions | `7d` |
| `CLOUDINARY_CLOUD_NAME`| String | Cloudinary storage account name | `nexahr-cloud` |
| `CLOUDINARY_API_KEY` | String | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET`| String | Cloudinary API Secret Key | `abcdefghijklmnopqrstuvwxyz` |

### 11.2 Database Migration & Maintenance Commands

```bash
# Generate Prisma Client after schema modification
npm run prisma:generate

# Execute incremental migration in development
npm run prisma:migrate

# Seed database with initial Admin, Departments, Leave Types & Roles
node prisma/seed.js

# Reset and clean database to pristine state
node prisma/reset-clean.js
```

### 11.3 Production Deployment Topology

```mermaid
graph TD
    UserTraffic[Incoming Internet Traffic] --> LB[Reverse Proxy / Cloud Load Balancer]
    LB -->|Port 80/443 SSL Termination| NodeApp1[NexaHR Node.js Instance 1]
    LB --> NodeApp2[NexaHR Node.js Instance 2]
    
    NodeApp1 & NodeApp2 -->|Prisma Connection Pooler| PGBouncer[PgBouncer / Managed Postgres Pool]
    PGBouncer --> PostgresMaster[(PostgreSQL Managed Database)]
    
    NodeApp1 & NodeApp2 -->|Direct Stream| Cloudinary[(Cloudinary Asset Storage)]
```

---

*Document generated and maintained by NexaHR Core Engineering Team.*

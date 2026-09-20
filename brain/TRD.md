# 🛠️ NexaHR — Technical Requirements Document (TRD)

**System Name:** NexaHR Enterprise Human Resource Management System (HRMS)  
**Classification:** Single-Company Enterprise Core HR Platform  
**Backend Framework:** Node.js / Express.js  
**Frontend Framework:** React 18 / Vite / Tailwind CSS  
**Database & ORM:** PostgreSQL / Prisma ORM v5  
**Document Status:** Approved Architecture Standard  

---

## 1. System Architecture & Topology

```
+-------------------------------------------------------------------------------+
|                                  CLIENT TIER                                  |
|  React 18 SPA (Vite) | Tailwind CSS | Lucide React | Axios API Client         |
+---------------------------------------+---------------------------------------+
                                        | (HTTPS / REST JSON / JWT Bearer)
                                        v
+-------------------------------------------------------------------------------+
|                              API GATEWAY & ROUTER                             |
|  Express.js 4.x | Helmet Security | CORS | Express-Rate-Limit | CookieParser  |
+---------------------------------------+---------------------------------------+
                                        |
      +---------------------------------+---------------------------------+
      |                                 |                                 |
      v                                 v                                 v
+-----------------------+   +-----------------------+   +-----------------------+
|  AUTH & RBAC ENGINE   |   |   CORE HR SERVICES    |   |  INTEGRATIONS LAYER   |
|  JWT Verification     |   |  Employee Controller  |   |  Cloudinary Storage   |
|  Role Permission Gate |   |  Attendance Engine    |   |  Nodemailer (SMTP)    |
|  OTP Cryptographic Svc|   |  Leave Policy Subsys  |   |  Twilio SMS Dispatch  |
|  Password Policy Guard|   |  Payroll Calculator   |   |  Biometric Ingestion  |
+-----------------------+   +-----------------------+   +-----------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                               PERSISTENCE TIER                                |
|  Prisma Client ORM v5.22 | Connection Pooling | Migration Engine             |
|  PostgreSQL Relational Database (Strict Foreign Keys, Indexes, Cascades)     |
+-------------------------------------------------------------------------------+
```

---

## 2. Technology Stack Specifications

### 2.1 Backend Runtime & Libraries
- **Runtime:** Node.js `>= 18.x` LTS
- **Web Framework:** Express.js `4.21.x`
- **ORM / Database Driver:** Prisma ORM `5.22.x` connecting to PostgreSQL
- **Security & Cryptography:**
  - `bcryptjs 2.4.3`: Salted password hashing (Cost factor 10)
  - `jsonwebtoken 9.0.2`: HMAC-SHA256 signed stateless bearer tokens
  - `crypto` (Native Node): SHA-256 OTP hashing and cryptographically secure random number generators
  - `helmet 8.3.0`: HTTP security header synthesis (HSTS, CSP, X-Frame-Options)
  - `express-rate-limit 8.7.0`: Endpoint throttling against brute-force attacks
- **Media & File Handling:**
  - `multer 2.2.0`: Multipart memory buffer ingestion
  - `cloudinary 2.11.0`: Cloud CDN media uploads via streaming buffers
- **Communications:**
  - `nodemailer 9.1.1`: SMTP transactional emails with branded HTML templates
  - `twilio 6.1.0`: SMS dispatch for multi-factor OTP password resets

### 2.2 Frontend Framework & Tooling
- **Build Tool:** Vite `8.2.x` (Fast HMR & Optimized production chunking)
- **Framework:** React `18.x` (Functional components, hooks, React Router v6)
- **Styling Architecture:** Tailwind CSS `3.4.x` with CSS Custom Variables for dark/light themes
- **Icons:** `lucide-react` for consistent, accessible visual iconography
- **State Management & Contexts:**
  - `ThemeContext`: Dynamic Dark/Light mode persistence in LocalStorage
  - `RegionalSettingsContext`: Organization-wide Date formats, Currency, and Timezone state

---

## 3. Security Architecture & RBAC

### 3.1 Authentication & Token Lifecycle
1. **Login Payload:** Accepts `{ emailOrCode, password }` with automatic format resolution (email regex vs uppercase employee code).
2. **First-Login Enforcement:** If `user.mustChangePassword === true`, returns standard JWT along with explicit `mustChangePassword` flag, routing user immediately to password upgrade modal.
3. **Session Token:** JWT issued with 24-hour expiration containing `{ userId, email, role, employeeCode }`.
4. **Header Protocol:** Verified in `auth.middleware.js` via `Authorization: Bearer <token>` or secure cookie.

### 3.2 Role-Based Access Control (RBAC) Matrix
```
Role Hierarchy: ADMIN > HR_MANAGER > EMPLOYEE
```

| Resource / Action | ADMIN | HR_MANAGER | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| **System Settings & Backups** | Full Write | Read Only | No Access |
| **Role & Permission Management** | Full Write | Read Only | No Access |
| **User Access Control & Force Reset** | Full Write | No Access | No Access |
| **Employee Creation & Salary Binding** | Full Write | Full Write | No Access |
| **Attendance Clock In/Out** | System Mock | System Mock | Own Record Only |
| **Attendance Approvals & Adjustments** | Full Write | Full Write | No Access |
| **Leave Policy Management** | Full Write | Full Write | Read Only |
| **Leave Approval / Rejection** | Full Write | Full Write | Own Leaves Only |
| **Payroll Processing & Generation** | Full Write | Full Write | Own Payslips Only |
| **Announcement Broadcasting** | Full Write | Full Write | Read Only |

### 3.3 Cryptographic OTP Password Recovery Protocol
```
User Requests Reset -> Check Role:
├── If ADMIN -> Channel strictly forced to EMAIL
└── If HR/EMPLOYEE -> Option of EMAIL or SMS (if phone provided)
        │
        v
Generate 6-digit numeric OTP (100,000 - 999,999)
Hash OTP with SHA-256 -> Store in `password_reset_otps` table
Set Expiry = now() + 10 minutes, attempts = 0
Dispatch plain OTP via Nodemailer or Twilio
        │
        v
Verification Attempt:
├── If attempts >= 3 -> Invalidate OTP (Mark isUsed = true, prevent brute force)
├── If expired -> Reject
└── If SHA256(Input) == otpHash -> Generate one-time reset authorization
        │
        v
User Submits New Password -> Hash with Bcrypt(10) -> Update User -> Invalidate OTP
```

---

## 4. Media & Cloud File Ingestion Pipeline

### 4.1 Cloudinary Stream Implementation
- Files are parsed into memory buffer via Multer (`storage = multer.memoryStorage()`, size cap 5MB, MIME filter for image formats).
- `cloudinary.uploader.upload_stream` streams buffer directly to cloud storage within the `nexahr/avatars` folder.
- Transformations applied automatically:
  - Width: 400px, Height: 400px, Crop: `fill`, Gravity: `face`
  - Format: `webp` with auto quality optimization
- **Graceful Fallback:** If Cloudinary credentials are not configured in `.env`, the controller seamlessly generates an SVG/UI-Avatars data URI fallback so onboarding is never interrupted.

---

## 5. REST API Standards & Endpoints Directory

All API responses follow the uniform JSON envelope specification:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### 5.1 Route Inventory

#### Authentication & Security (`/api/auth`)
- `POST /api/auth/login` — Authenticate user and issue JWT
- `GET /api/auth/me` — Retrieve currently authenticated user context
- `POST /api/auth/change-password` — Change password (first login or profile self-service)
- `POST /api/auth/request-reset` — Request password reset OTP
- `POST /api/auth/verify-otp` — Validate 6-digit OTP
- `POST /api/auth/reset-password-otp` — Finalize password reset with verified OTP

#### Personnel Information Management (`/api/employees`)
- `GET /api/employees` — List employees with pagination, search, and department filter
- `POST /api/employees` — Onboard new employee with user account and salary structure
- `GET /api/employees/:id` — Get full employee dossier
- `PUT /api/employees/:id` — Update profile, designation, and personal records
- `DELETE /api/employees/:id` — Soft-delete / deactivate employee
- `POST /api/employees/:id/avatar` — Upload and stream avatar to Cloudinary

#### Attendance Engine (`/api/attendance`)
- `GET /api/attendance` — Retrieve department/company attendance logs for date range
- `GET /api/attendance/my-attendance` — Retrieve logged-in employee's monthly punches
- `POST /api/attendance/check-in` — Register clock-in with timestamp
- `POST /api/attendance/check-out` — Register clock-out and compute total working hours
- `POST /api/attendance/manual` — HR manual attendance entry or override

#### Leave Management (`/api/leaves`)
- `GET /api/leaves/types` — List active leave types and allowed day quotas
- `GET /api/leaves/my-leaves` — List personal leave application history
- `POST /api/leaves/request` — Submit new leave application
- `GET /api/leaves/admin-list` — List all company leave requests (HR/Admin)
- `PUT /api/leaves/:id/status` — Approve or Reject leave with audit feedback

#### Payroll Processing (`/api/payroll`)
- `GET /api/payroll/structures` — List salary structures across departments
- `PUT /api/payroll/structures/:userId` — Configure basic salary, allowances, and deductions
- `POST /api/payroll/calculate` — Execute batch payroll computation for specific month/year
- `GET /api/payroll/payslips` — Retrieve generated payslips
- `GET /api/payroll/my-payslips` — Retrieve personal payslips (Employee Self-Service)

#### Communications & Operations (`/api/notifications`, `/api/announcements`)
- `GET /api/notifications` — Fetch user's notification stream
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read
- `GET /api/announcements` — List active corporate announcements
- `POST /api/announcements` — Publish company or department announcement

---

## 6. Database Concurrency & Data Integrity

1. **ACID Transaction Blocks:** All multi-entity modifications (e.g. creating User + EmployeeProfile + SalaryStructure simultaneously) are executed within `prisma.$transaction([...])`.
2. **Foreign Key Cascade Strategies:**
   - User deletion cascades to profiles, attendance logs, and salary structures.
   - Department deletion sets designation `departmentId = NULL` (`onDelete: SetNull`) to avoid orphaned records.
3. **Database Indexing:**
   - Single-field B-tree indexes on `users(email)`, `users(employeeCode)`, `attendances(date)`.
   - Compound indexes on `attendances(userId, date)` and `payslips(userId, month, year)` ensuring duplicate clock-ins and double payroll generation are physically prevented at the database constraint level.

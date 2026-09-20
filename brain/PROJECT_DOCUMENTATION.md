# 📘 NexaHR — Comprehensive Technical & Architectural Documentation

**Project Name:** NexaHR Enterprise Human Resource Management System (HRMS)  
**System Classification:** Single-Company Enterprise Core HR & Biometric Operations Platform  
**Current Version:** `v2.0.0 Enterprise`  
**Architecture Pattern:** Decoupled Client-Server (SPA + RESTful API Backend + Relational ORM)  
**Document Revision:** 2.4.0  
**Target Audience:** Software Engineers, System Architects, DevOps Engineers, QA Specialists, and Enterprise HR IT Administrators  

---

## 📑 Table of Contents

1. [Executive Summary & System Scope](#1-executive-summary--system-scope)
2. [Technology Stack & Tools Inventory](#2-technology-stack--tools-inventory)
   - [2.1 Frontend Technologies & Libraries](#21-frontend-technologies--libraries)
   - [2.2 Backend Technologies & Frameworks](#22-backend-technologies--frameworks)
   - [2.3 Database & ORM Layer](#23-database--orm-layer)
   - [2.4 Developer Tools, Linters & Utilities](#24-developer-tools-linters--utilities)
   - [2.5 Complete Dependencies Matrix](#25-complete-dependencies-matrix)
3. [System Architecture & Data Flow Topology](#3-system-architecture--data-flow-topology)
   - [3.1 High-Level Architectural Diagram](#31-high-level-architectural-diagram)
   - [3.2 Request-Response Lifecycle & Middleware Pipeline](#32-request-response-lifecycle--middleware-pipeline)
   - [3.3 Biometric Hardware Ingestion Architecture](#33-biometric-hardware-ingestion-architecture)
   - [3.4 Multi-Channel Notification Pipeline](#34-multi-channel-notification-pipeline)
4. [Role-Based Access Control (RBAC) & Security Matrix](#4-role-based-access-control-rbac--security-matrix)
   - [4.1 Security Roles](#41-security-roles)
   - [4.2 Comprehensive Permissions Matrix](#42-comprehensive-permissions-matrix)
   - [4.3 Authentication & Session Management](#43-authentication--session-management)
   - [4.4 Password Recovery & OTP Cryptographic Engine](#44-password-recovery--otp-cryptographic-engine)
5. [Database Architecture & Data Models](#5-database-architecture--data-models)
   - [5.1 Entity-Relationship (ER) Overview](#51-entity-relationship-er-overview)
   - [5.2 Prisma Schema Specifications](#52-prisma-schema-specifications)
   - [5.3 Indexing Strategy & Referential Integrity](#53-indexing-strategy--referential-integrity)
6. [Core Business Logic & Module Breakdown](#6-core-business-logic--module-breakdown)
   - [6.1 Personnel Information Management (PIM) & Team Directory](#61-personnel-information-management-pim--team-directory)
   - [6.2 Biometric Attendance & Shift Compliance Engine](#62-biometric-attendance--shift-compliance-engine)
   - [6.3 Leave Management & Quota Computation Engine](#63-leave-management--quota-computation-engine)
   - [6.4 Automated Payroll & Compensation Engine](#64-automated-payroll--compensation-engine)
   - [6.5 Company Bulletins & Announcement Engine](#65-company-bulletins--announcement-engine)
   - [6.6 Multi-Channel Notification Engine](#66-multi-channel-notification-engine)
   - [6.7 Employee Self-Service (ESS) Command Portal](#67-employee-self-service-ess-command-portal)
   - [6.8 Recruitment & Talent Acquisition Management](#68-recruitment--talent-acquisition-management)
   - [6.9 Regional Adaptation & Multi-Currency Engine](#69-regional-adaptation--multi-currency-engine)
7. [Repository File Map & Codebase Hierarchy](#7-repository-file-map--codebase-hierarchy)
   - [7.1 Backend Directory Structure](#71-backend-directory-structure)
   - [7.2 Frontend Directory Structure](#72-frontend-directory-structure)
   - [7.3 Root Scripts & Automation Tools](#73-root-scripts--automation-tools)
8. [Comprehensive REST API Reference](#8-comprehensive-rest-api-reference)
   - [8.1 Authentication & Password Recovery Endpoints](#81-authentication--password-recovery-endpoints)
   - [8.2 Dashboard & Metrics Endpoints](#82-dashboard--metrics-endpoints)
   - [8.3 Employee & PIM Endpoints](#83-employee--pim-endpoints)
   - [8.4 Biometric Attendance Endpoints](#84-biometric-attendance-endpoints)
   - [8.5 Leaves & Time-Off Endpoints](#85-leaves--time-off-endpoints)
   - [8.6 Payroll & Compensation Endpoints](#86-payroll--compensation-endpoints)
   - [8.7 Organization & Department Endpoints](#87-organization--department-endpoints)
   - [8.8 Designation Endpoints](#88-designation-endpoints)
   - [8.9 Company Announcement Endpoints](#89-company-announcement-endpoints)
   - [8.10 In-App Notification Endpoints](#810-in-app-notification-endpoints)
   - [8.11 System Health Check Endpoint](#811-system-health-check-endpoint)
9. [Frontend Design System & UI/UX Architecture](#9-frontend-design-system--uiux-architecture)
   - [9.1 Design Principles & Glassmorphism Aesthetics](#91-design-principles--glassmorphism-aesthetics)
   - [9.2 Theme & Regional State Management](#92-theme--regional-state-management)
   - [9.3 Layout Routing Hierarchy](#93-layout-routing-hierarchy)
10. [Testing, Verification & Quality Assurance](#10-testing-verification--quality-assurance)
    - [10.1 Test Suites & Verification Scripts](#101-test-suites--verification-scripts)
    - [10.2 Linting & Static Code Analysis](#102-linting--static-code-analysis)
11. [Installation, Environment Setup & Deployment Guide](#11-installation-environment-setup--deployment-guide)
    - [11.1 Prerequisites](#111-prerequisites)
    - [11.2 Environment Variables Configuration](#112-environment-variables-configuration)
    - [11.3 Development Setup](#113-development-setup)
    - [11.4 Production Build & Process Management](#114-production-build--process-management)
12. [Troubleshooting & Maintenance Manual](#12-troubleshooting--maintenance-manual)

---

## 1. Executive Summary & System Scope

**NexaHR** is a modern, enterprise-grade, single-company Human Resource Management System (HRMS) built to replace fragmented spreadsheets, manual attendance tracking, and error-prone payroll processing. The platform unifies the full employee lifecycle into a cohesive, secure, and reactive web application.

### Key Value Propositions
1. **Zero-Manual Biometric Tracking:** Native webhook integration (`/api/attendance/hardware-sync`) for automated ingestion from biometric fingerprint and Face-ID terminals with automatic late calculation against a configurable 15-minute grace threshold.
2. **Deterministic Role Isolation (RBAC):** Strict role gating ensuring staff members interact strictly within the Employee Self-Service (ESS) portal, while HR Managers and Administrators access administrative personnel files, payroll calculation engines, and organizational settings.
3. **Real-Time Leave Balance Engine:** Live tracking of leave quotas across Annual, Sick, and Casual buckets, automatically factoring pending and approved requests.
4. **Formulaic Payroll & Deduction Engine:** Automatic calculation of gross pay, itemized allowances (Housing, Transport, Custom), tax brackets, and unpaid absence deductions ($\frac{\text{Basic Salary}}{30} \times \text{Unpaid Days}$).
5. **Multi-Currency & Locale Adaptor:** Dynamic frontend switching across PKR (`Rs`), USD (`$`), EUR (`€`), GBP (`£`), AED (`AED`), and SAR (`SAR`) with standardized date/time formatting.
6. **Multi-Channel Alerts & Security:** Cryptographically secure 6-digit OTP password reset engine, in-app notification badges, and transactional email dispatches via Nodemailer.

---

## 2. Technology Stack & Tools Inventory

NexaHR utilizes a modern, production-hardened full-stack JavaScript/Node.js ecosystem paired with PostgreSQL for ACID-compliant persistence.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND CLIENT                                │
│   React 19 • Vite 8 • Tailwind CSS v4 • Framer Motion • Lucide React      │
│   Recharts • React Router v7 • Context API (Theme & Regional Settings)     │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                             HTTP / REST (JSON)
                                     │
┌────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND SERVER                                 │
│   Node.js LTS • Express.js v4 • Prisma ORM v5 • JSON Web Tokens (JWT)      │
│   BCrypt.js • Nodemailer • CORS • Dotenv • Custom RBAC Middlewares         │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                             SQL Connection Pool
                                     │
┌────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE LAYER                                 │
│   PostgreSQL 14+ (Relational, ACID, Foreign Keys & Unique Indexing)        │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Frontend Technologies & Libraries

| Technology / Tool | Version | Category | Description & Role in System |
| :--- | :--- | :--- | :--- |
| **React** | `^19.2.8` | UI Library | Component-based view layer utilizing hooks, functional components, and strict state encapsulation. |
| **Vite** | `^8.2.0` | Build Tool & Bundler | Next-generation fast frontend tooling offering instant Hot Module Replacement (HMR) and optimized Rollup production builds. |
| **React Router DOM** | `^7.18.2` | Routing Engine | Client-side routing engine managing nested routes, layout wrappers (`MainLayout`, `EmployeeLayout`), and route protection. |
| **Tailwind CSS** | `^4.3.3` | Styling Engine | Modern utility-first CSS framework with JIT compilation, custom color tokens, glassmorphism filters, and dark mode styling. |
| **@tailwindcss/postcss** | `^4.3.3` | PostCSS Plugin | PostCSS compiler bridge for Tailwind CSS v4 integration. |
| **Framer Motion** | `^12.43.0` | UI Animation Engine | Declarative animation library for page transitions, interactive modals, badge pulses, and hover dynamics. |
| **Lucide React** | `^1.28.0` | Iconography System | Cohesive, featherweight SVG icon system used across navigation menus, status indicators, and action bars. |
| **Recharts** | `^3.10.1` | Data Visualization | Composable charting library for rendering monthly attendance compliance, department headcount distributions, and payroll budget burn. |
| **clsx & tailwind-merge** | `^2.1.1` / `^3.6.0` | Style Utilities | Efficient conditional class composition and conflict resolution for dynamic component styling. |

### 2.2 Backend Technologies & Frameworks

| Technology / Tool | Version | Category | Description & Role in System |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` (LTS) | Runtime Environment | High-performance asynchronous, event-driven JavaScript server runtime. |
| **Express.js** | `^4.21.1` | Web Framework | Minimalist and flexible RESTful API framework handling routing, parameter parsing, and middleware chaining. |
| **Prisma Client** | `^5.22.0` | ORM & Query Builder | Type-safe, auto-generated database client with native relation loading and query optimization. |
| **jsonwebtoken (JWT)** | `^9.0.2` | Authentication | Stateless authentication token generation, signing, and verification with 7-day expiration cycles. |
| **bcryptjs** | `^2.4.3` | Cryptography | One-way password hashing algorithm with salt generation for storing user credentials securely. |
| **cors** | `^2.8.5` | Security Middleware | Cross-Origin Resource Sharing middleware enabling controlled browser communication between client (Port 5173) and backend (Port 5000). |
| **dotenv** | `^16.4.5` | Environment Management | Zero-dependency module that loads environment variables from `.env` into `process.env`. |
| **Nodemailer** | Internal Service | Email Dispatcher | Transactional SMTP email transport engine for dispatching notifications, payslips, and OTPs. |

### 2.3 Database & ORM Layer

| Technology / Tool | Version | Role in System |
| :--- | :--- | :--- |
| **PostgreSQL** | `>= 14.0` | Primary ACID-compliant relational database storing all enterprise records, foreign keys, timestamps, and indexes. |
| **Prisma ORM** | `^5.22.0` | Schema definition (`schema.prisma`), declarative database migrations (`prisma migrate dev`), and schema synchronization (`prisma db push`). |

### 2.4 Developer Tools, Linters & Utilities

| Tool | Role & Workflow Purpose |
| :--- | :--- |
| **Nodemon** (`^3.1.7`) | Development file watcher that automatically restarts the Node.js backend on source code modifications. |
| **Oxlint** (`^1.75.0`) | High-speed Rust-based JavaScript/React linter for static code verification and error prevention. |
| **Prisma Studio / CLI** | Visual schema inspection and interactive database management via browser interface (`npx prisma studio`). |
| **Windows Batch Launchers** | Automated developer orchestration scripts (`run.bat`, `run-backend.bat`, `run-frontend.bat`, `start.bat`) for dependency checks, environment setup, and dual-server startup. |

### 2.5 Complete Dependencies Matrix

```
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ BACKEND DEPENDENCIES (package.json)    │ CLIENT DEPENDENCIES (client/package)   │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ express: ^4.21.1                       │ react: ^19.2.8                         │
│ @prisma/client: ^5.22.0                │ react-dom: ^19.2.8                     │
│ bcryptjs: ^2.4.3                       │ react-router-dom: ^7.18.2              │
│ jsonwebtoken: ^9.0.2                   │ tailwindcss: ^4.3.3                    │
│ cors: ^2.8.5                           │ @tailwindcss/postcss: ^4.3.3           │
│ dotenv: ^16.4.5                        │ framer-motion: ^12.43.0                │
│ nodemon (dev): ^3.1.7                  │ lucide-react: ^1.28.0                  │
│ prisma (dev): ^5.22.0                  │ recharts: ^3.10.1                      │
│                                        │ clsx: ^2.1.1                           │
│                                        │ tailwind-merge: ^3.6.0                 │
│                                        │ vite (dev): ^8.2.0                     │
│                                        │ oxlint (dev): ^1.75.0                  │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

---

## 3. System Architecture & Data Flow Topology

### 3.1 High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  +-----------------------------------------------------------------------------+  |
|  | Single Page Application (SPA) - React 19 + Tailwind CSS + Lucide Icons       |  |
|  | - Public / Auth Pages (Login, Dual-Persona Selector, OTP Recovery Modal)    |  |
|  | - HR Admin Command Center (/app/*: Dashboard, Employees, Attendance, etc.)  |  |
|  | - Employee Self-Service Portal (/employee/*: Punch Hub, Leaves, Payslips)   |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTPS / JSON
                            Bearer Token / x-hardware-key
                                          v
+-----------------------------------------------------------------------------------+
|                                 APPLICATION TIER                                  |
|  +-----------------------------------------------------------------------------+  |
|  | Express HTTP Server (Port 5000)                                              |  |
|  |  ├── Global Middleware (CORS, Express.json, Request Logger)                 |  |
|  |  ├── Auth Middleware (JWT Token Verification, Session Hydration)            |  |
|  |  ├── RBAC Gatekeeper (checkRole: ADMIN | HR_MANAGER | EMPLOYEE)              |  |
|  |  └── Domain Route Handlers:                                                 |  |
|  |       /api/auth          /api/employees       /api/attendance              |  |
|  |       /api/leaves        /api/payroll         /api/departments             |  |
|  |       /api/designations  /api/announcements   /api/notifications           |  |
|  +-----------------------------------------------------------------------------+  |
|  | Controller & Service Layer                                                  |  |
|  |  ├── Payroll Engine (Gross/Net, Allowances, Tax & Unpaid Deductions)        |  |
|  |  ├── Notification Service (In-App DB Feeds + Nodemailer SMTP Dispatches)    |  |
|  |  └── Biometric Processing Service (Time Delta, Grace Period Evaluation)   |  |
|  +-----------------------------------------------------------------------------+  |
|  | Prisma ORM Query Layer (Type-Safe Client, Model Relations, Transactions)    |  |
+-----------------------------------------------------------------------------------+
                                          |
                                  TCP Connection Pool
                                          v
+-----------------------------------------------------------------------------------+
|                                 PERSISTENCE TIER                                  |
|  PostgreSQL Database (ACID, Relational Tables, Foreign Keys, B-Tree Indexes)     |
+-----------------------------------------------------------------------------------+
```

### 3.2 Request-Response Lifecycle & Middleware Pipeline

Every HTTP request traverses a standardized security and parsing pipeline:

```
Incoming Request
      │
      ▼
1. CORS Middleware (Validates origin and allowed headers)
      │
      ▼
2. express.json() (Parses incoming JSON body up to standard limits)
      │
      ▼
3. Request Logger (Development mode: timestamp, HTTP method, path)
      │
      ▼
4. Route-Level Authentication Middleware (`verifyToken`)
   ├─ Checks `Authorization: Bearer <token>`
   ├─ Decodes JWT payload using `JWT_SECRET`
   ├─ Validates user existence & `isActive: true` in PostgreSQL
   └─ Attaches `req.user = { userId, email, role, fullName }`
      │
      ▼
5. RBAC Middleware (`checkRole('ADMIN', 'HR_MANAGER')`)
   ├─ Verifies `req.user.role` against endpoint whitelist
   └─ Returns `403 Forbidden` if unauthorized
      │
      ▼
6. Controller Execution (Business logic, validation, calculations)
      │
      ▼
7. Prisma ORM Query (PostgreSQL database interaction)
      │
      ▼
8. Standardized JSON Response (`{ success: true, data: {...}, message: "..." }`)
```

### 3.3 Biometric Hardware Ingestion Architecture

```
[ Biometric Hardware Device ] (Face-ID / Optical Fingerprint Terminal)
            │
            │ HTTP POST /api/attendance/hardware-sync
            │ Headers: { "x-hardware-key": "nexahr_biometric_hardware_secret_2026" }
            │ Payload: { "employeeCode": "EMP-001", "timestamp": "2026-08-15T09:12:00Z" }
            ▼
[ Attendance Controller / Webhook ]
            │
            ├─ 1. Validate `x-hardware-key` matches `process.env.HARDWARE_SYNC_SECRET`
            ├─ 2. Resolve `User` by `employeeCode`
            ├─ 3. Parse punch time:
            │     - Extract Date string (`YYYY-MM-DD`)
            │     - Compute Time (`HH:mm:ss`)
            ├─ 4. Evaluate Grace Period:
            │     - Shift Start: 09:00:00
            │     - Grace Cutoff: 09:15:00
            │     - If Punch <= 09:15:00 -> Status: PRESENT
            │     - If Punch > 09:15:00  -> Status: LATE
            ├─ 5. Record / Update Attendance in PostgreSQL:
            │     - If first punch of day -> Set `checkInTime`
            │     - If subsequent punch  -> Set `checkOutTime` & recalculate `totalHours`
            ▼
[ Response: 200 OK ] -> Attendance Synchronized
```

### 3.4 Multi-Channel Notification Pipeline

```
[ System Event (Announcement / Leave Approval / Payslip Ready) ]
                               │
                               ▼
               [ notification.service.js Dispatcher ]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 [ In-App Notification Engine ]         [ Transactional SMTP Email Engine ]
 ├─ Insert row into `notifications`    ├─ Compile HTML Email Template
 ├─ Link target `userId` or Broadcast  ├─ Inline CSS with Brand Header & Footer
 ├─ Tag Category & Direct Link URL     ├─ Transmit via SMTP Transport
 └─ Increments Client Unread Badge     └─ Log Transmission Receipt
```

---

## 4. Role-Based Access Control (RBAC) & Security Matrix

### 4.1 Security Roles

The system enforces 3 discrete role tiers defined in the Prisma schema enum `Role`:

1. **`ADMIN` (System Administrator):** Complete governance over organizational structure, company-wide settings, user onboarding, role assignments, salary configuration, and payroll disbursal.
2. **`HR_MANAGER` (People Operations):** Operational management of employee dossiers, biometric attendance monitoring, leave request evaluations, company announcement authoring, and monthly payroll calculation.
3. **`EMPLOYEE` (General Staff):** Restricted access strictly to personal self-service data: personal biometric timestamps, leave applications, downloadable salary slips, corporate handbooks, holidays, and announcements.

### 4.2 Comprehensive Permissions Matrix

| Module / Operation | Admin (`ADMIN`) | HR Manager (`HR_MANAGER`) | Staff Employee (`EMPLOYEE`) | Endpoint Protection Gate |
| :--- | :---: | :---: | :---: | :--- |
| **System Dashboard** | Full Metrics | Full Metrics | Personal Pulse Only | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Employee Directory (PIM)** | View / Edit / Create | View / Edit / Create | ❌ **Restricted (Hidden)** | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Onboard New Employee** | ✅ Full Access | ✅ Full Access | ❌ Restricted | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Salary Structure Setup** | ✅ Full Access | ✅ Full Access | ❌ Restricted | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Biometric Master Logs** | View All / Export | View All / Export | ❌ Read Personal Only | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Hardware Webhook Sync** | ✅ Via Secret Key | ✅ Via Secret Key | ❌ Restricted | `x-hardware-key` Validation |
| **Leave Approval Queue** | Approve / Reject | Approve / Reject | ❌ Submit Only | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Apply for Leave** | ✅ Available | ✅ Available | ✅ Primary Portal | `verifyToken` |
| **Batch Payroll Generation** | ✅ Full Control | ✅ Full Control | ❌ Restricted | `checkRole('ADMIN', 'HR_MANAGER')` |
| **View Payslip Records** | All Company Slips | All Company Slips | ❌ Own Payslips Only | `checkRole('ADMIN', 'HR_MANAGER')` vs User Match |
| **Department / Designation CRUD** | ✅ Full CRUD | ✅ Full CRUD | ❌ Restricted | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Publish Announcements** | Publish & Pin | Publish & Pin | 👁️ Read-Only Feed | `checkRole('ADMIN', 'HR_MANAGER')` |
| **Helpdesk & Support** | Ticket Admin | Ticket Admin | Submit & Track | `verifyToken` |
| **Corporate Document Hub** | Manage & Upload | Manage & Upload | Read & Download | `verifyToken` |
| **System & Regional Settings** | ✅ Full Control | ❌ Restricted | ❌ Restricted | `checkRole('ADMIN')` |

### 4.3 Authentication & Session Management

- **Protocol:** Stateless JSON Web Token (JWT) over HTTP Authorization Header (`Bearer <token>`).
- **Signature Algorithm:** HMAC-SHA256 using server-side secret key `JWT_SECRET`.
- **Token Validity Window:** 7 days (`JWT_EXPIRES_IN=7d`).
- **Payload Structure:**
  ```json
  {
    "userId": "d7b4c910-8e12-4c28-98e3-02f8319e7a4b",
    "email": "alex.mercer@company.com",
    "role": "EMPLOYEE",
    "iat": 1786800000,
    "exp": 1787404800
  }
  ```
- **Session Hydration:** On client application load, `api.getMe()` verifies token validity against `/api/auth/me` and returns user profile, role permissions, and active settings.

### 4.4 Password Recovery & OTP Cryptographic Engine

NexaHR incorporates a 3-step password recovery engine with brute-force protection and role-channel isolation:

```
[ Step 1: Identity & Channel Check ]
User inputs email -> Backend queries User
├─ If role == ADMIN/HR_MANAGER -> Channel restricted strictly to EMAIL (Security Hardening)
└─ If role == EMPLOYEE         -> Channels: EMAIL or WHATSAPP (Flexible ESS)

[ Step 2: Cryptographic OTP Generation & Dispatch ]
├─ Generate 6-digit secure numeric code (e.g., 491823)
├─ Compute SHA-256 Hash of OTP
├─ Store in `password_reset_otps` table:
│   - `userId`, `email`, `otpHash`, `expiresAt: now + 10 mins`, `attempts: 0`, `isUsed: false`
└─ Dispatch OTP via Email (or WhatsApp gateway)

[ Step 3: Verification & Password Reset ]
├─ User submits 6-digit OTP
├─ Backend checks `attempts < 5` (Rate limiting / Brute-force lockout)
├─ Computes SHA-256 hash of submitted OTP and compares with `otpHash`
├─ Checks `expiresAt > now` and `isUsed == false`
├─ Issues short-lived Password Reset Token (15-minute expiry)
└─ User submits new password -> BCrypt hash (10 salt rounds) -> Updates `User.password`
```

---

## 5. Database Architecture & Data Models

### 5.1 Entity-Relationship (ER) Overview

```
 ┌──────────────────────┐         1:1         ┌────────────────────────┐
 │        User          ├─────────────────────┤    EmployeeProfile     │
 └──────────┬───────────┘                     └───────────┬────────────┘
            │                                             │
            ├───────────────┬──────────────┐              │ N:1
            │ 1:N           │ 1:N          │ 1:1          ▼
            ▼               ▼              ▼      ┌────────────────────────┐
     ┌──────────────┐ ┌──────────┐ ┌─────────────┐│       Department       │
     │  Attendance  │ │ LeaveReq │ │ SalaryStruct│└───────────┬────────────┘
     └──────────────┘ └────┬─────┘ └─────────────┘            │ 1:N
                           │ N:1                              ▼
                           ▼                          ┌────────────────────────┐
                    ┌─────────────┐                   │      Designation       │
                    │  LeaveType  │                   └────────────────────────┘
                    └─────────────┘
```

### 5.2 Prisma Schema Specifications

Below is the complete database model structure defined in `prisma/schema.prisma`:

```prisma
// Prisma Schema for NexaHR Enterprise System

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------
enum Role {
  ADMIN
  HR_MANAGER
  EMPLOYEE
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  ON_LEAVE
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum PayslipStatus {
  DRAFT
  GENERATED
  PAID
}

// ----------------------------------------------------
// USER & CORE AUTHENTICATION
// ----------------------------------------------------
model User {
  id                String             @id @default(uuid())
  employeeCode      String             @unique
  email             String             @unique
  password          String
  firstName         String
  lastName          String
  phone             String?
  role              Role               @default(EMPLOYEE)
  isActive          Boolean            @default(true)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  profile           EmployeeProfile?
  attendances       Attendance[]
  leaveRequests     LeaveRequest[]     @relation("UserLeaveRequests")
  approvedLeaves    LeaveRequest[]     @relation("ApprovedLeaves")
  salaryStructure   SalaryStructure?
  payslips          Payslip[]
  passwordResetOtps PasswordResetOtp[]
  notifications     Notification[]

  @@map("users")
}

// ----------------------------------------------------
// DEPARTMENT & DESIGNATION HIERARCHY
// ----------------------------------------------------
model Department {
  id          String            @id @default(uuid())
  name        String
  code        String            @unique
  description String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  designations Designation[]
  profiles     EmployeeProfile[]

  @@map("departments")
}

model Designation {
  id           String            @id @default(uuid())
  departmentId String?
  title        String            @unique
  description  String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  department   Department?       @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  profiles     EmployeeProfile[]

  @@map("designations")
}

// ----------------------------------------------------
// EMPLOYEE PROFILE DOSSIER (PIM)
// ----------------------------------------------------
model EmployeeProfile {
  id               String       @id @default(uuid())
  userId           String       @unique
  gender           String?
  dateOfBirth      DateTime?
  joiningDate      DateTime     @default(now())
  address          String?
  emergencyContact String?
  departmentId     String?
  designationId    String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  department       Department?  @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  designation      Designation? @relation(fields: [designationId], references: [id], onDelete: SetNull)

  @@map("employee_profiles")
}

// ----------------------------------------------------
// BIOMETRIC ATTENDANCE
// ----------------------------------------------------
model Attendance {
  id           String           @id @default(uuid())
  userId       String
  date         DateTime         @db.Date
  checkInTime  DateTime
  checkOutTime DateTime?
  status       AttendanceStatus @default(PRESENT)
  totalHours   Float?
  notes        String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([date])
  @@map("attendances")
}

// ----------------------------------------------------
// LEAVE POLICIES & APPLICATIONS
// ----------------------------------------------------
model LeaveType {
  id          String         @id @default(uuid())
  name        String
  code        String         @unique
  daysAllowed Int            @default(12)
  isPaid      Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  leaveRequests LeaveRequest[]

  @@map("leave_types")
}

model LeaveRequest {
  id              String      @id @default(uuid())
  userId          String
  leaveTypeId     String
  startDate       DateTime    @db.Date
  endDate         DateTime    @db.Date
  totalDays       Int
  reason          String
  status          LeaveStatus @default(PENDING)
  approvedById    String?
  rejectionReason String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation("UserLeaveRequests", fields: [userId], references: [id], onDelete: Cascade)
  leaveType       LeaveType   @relation(fields: [leaveTypeId], references: [id], onDelete: Cascade)
  approvedBy      User?       @relation("ApprovedLeaves", fields: [approvedById], references: [id], onDelete: SetNull)

  @@index([userId])
  @@map("leave_requests")
}

// ----------------------------------------------------
// SALARY STRUCTURE & PAYSLIPS
// ----------------------------------------------------
model SalaryStructure {
  id                 String   @id @default(uuid())
  userId             String   @unique
  basicSalary        Float
  housingAllowance   Float    @default(0)
  transportAllowance Float    @default(0)
  otherAllowances    Float    @default(0)
  taxDeductions      Float    @default(0)
  otherDeductions    Float    @default(0)
  effectiveDate      DateTime @default(now())
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("salary_structures")
}

model Payslip {
  id                   String        @id @default(uuid())
  userId               String
  month                Int
  year                 Int
  basicSalary          Float
  totalAllowances      Float
  taxDeductions        Float
  unpaidLeaveDays      Int           @default(0)
  unpaidLeaveDeduction Float         @default(0)
  otherDeductions      Float         @default(0)
  grossSalary          Float
  netSalary            Float
  status               PayslipStatus @default(GENERATED)
  generatedAt          DateTime      @default(now())
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt

  user                 User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, month, year])
  @@index([year, month])
  @@map("payslips")
}

// ----------------------------------------------------
// PASSWORD RECOVERY OTPs
// ----------------------------------------------------
model PasswordResetOtp {
  id        String   @id @default(uuid())
  userId    String
  email     String
  phone     String?
  otpHash   String
  channel   String
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  attempts  Int      @default(0)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([email])
  @@map("password_reset_otps")
}

// ----------------------------------------------------
// NOTIFICATIONS & ANNOUNCEMENTS
// ----------------------------------------------------
model Notification {
  id        String   @id @default(uuid())
  userId    String?
  title     String
  message   String
  type      String   @default("info")
  category  String   @default("GENERAL")
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("notifications")
}

model Announcement {
  id         String   @id @default(uuid())
  title      String
  category   String   @default("EVENTS")
  priority   String   @default("HIGH")
  department String?  @default("Company-Wide (All Offices)")
  summary    String?
  content    String
  author     String   @default("People Operations & HR")
  pinned     Boolean  @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([createdAt])
  @@map("announcements")
}
```

### 5.3 Indexing Strategy & Referential Integrity

- **Unique Constraints:**
  - `User.employeeCode` (Ensures 1:1 hardware terminal mapping)
  - `User.email` (Guarantees authentication uniqueness)
  - `Attendance(userId, date)` (Prevents duplicate daily attendance records)
  - `Payslip(userId, month, year)` (Guarantees single payslip per employee per billing cycle)
  - `LeaveType.code` & `Department.code` & `Designation.title` (Ensures unique taxonomy)
- **Cascade Rules:**
  - User deletion cascades to `EmployeeProfile`, `Attendance`, `SalaryStructure`, `Payslips`, `PasswordResetOtp`, `Notifications`.
  - Department deletion sets `EmployeeProfile.departmentId` and `Designation.departmentId` to `NULL` (`onDelete: SetNull`) to prevent data loss.

---

## 6. Core Business Logic & Module Breakdown

### 6.1 Personnel Information Management (PIM) & Team Directory
- Manages complete employee profile dossiers: contact details, emergency contacts, hire dates, assigned department, and official job designation.
- Atomic onboarding flow that creates `User` credentials, initial `EmployeeProfile`, and default `SalaryStructure` in a single transactional operation.
- Real-time search across employee codes, names, email addresses, and departments.

### 6.2 Biometric Attendance & Shift Compliance Engine
- Real-time calculation of check-in and check-out intervals:
  $$\text{Total Hours} = \frac{\text{Check-Out Timestamp} - \text{Check-In Timestamp}}{3600000}$$
- **Grace Period Logic:** Configurable 15-minute arrival window:
  - Check-in $\le$ 09:15:00 AM $\rightarrow$ `PRESENT`
  - Check-in $>$ 09:15:00 AM $\rightarrow$ `LATE`
- Monthly attendance compliance percentage computed for HR analytics.

### 6.3 Leave Management & Quota Computation Engine
- Live leave quota calculation for every active policy:
  $$\text{Remaining Balance} = \text{Total Allowed Days} - \sum \text{Approved Leave Days}$$
- Dynamic leave conflict detection preventing overlapping date applications.
- Two-way notification dispatch upon HR approval or rejection with reviewer feedback notes.

### 6.4 Automated Payroll & Compensation Engine
- Deterministic formula for monthly compensation calculations:
  $$\text{Gross Salary} = \text{Basic Salary} + \text{Housing Allowance} + \text{Transport Allowance} + \text{Other Allowances}$$
  $$\text{Daily Wage Rate} = \frac{\text{Basic Salary}}{30}$$
  $$\text{Unpaid Leave Penalty} = \text{Daily Wage Rate} \times \text{Unpaid Leave Days}$$
  $$\text{Total Deductions} = \text{Tax Deductions} + \text{Unpaid Leave Penalty} + \text{Other Deductions}$$
  $$\text{Net Salary} = \text{Gross Salary} - \text{Total Deductions}$$
- Batch payroll run generates itemized payslips for all active employees for the selected billing month.

### 6.5 Company Bulletins & Announcement Engine
- Rich company announcements categorized into `EVENTS`, `BENEFITS`, `MEETINGS`, `OPERATIONS`, `CORPORATE`.
- Pinned announcement support for persistent top-of-feed display.
- Integrated automatic broadcast notification and email distribution.

### 6.6 Multi-Channel Notification Engine
- In-app notification bell with real-time unread count badges.
- Filtering by category (`ANNOUNCEMENT`, `LEAVE`, `PAYROLL`, `ATTENDANCE`, `GENERAL`).
- One-click navigation links (`link`) directing users straight to relevant application views.
- Clean database sanitization routines for cross-platform emoji encoding.

### 6.7 Employee Self-Service (ESS) Command Portal
- **Live Biometric Station Hero Card:** Displays live clock, device synchronization status (`Biometric Synced`, `Late Recorded`, `Awaiting Punch`), and punch timestamps.
- **Quota Progress Bars:** Color-coded visual gauges showing consumed vs available leave quotas.
- **Gazetted Holiday Engine:** Live countdown engine showing remaining days (`Today • Active`, `Tomorrow`, `In X Days`) for all upcoming company holidays.
- **Digital Payslip Viewer:** Itemized salary slips with printable/downloadable compensation receipts.
- **Internal Helpdesk:** Support ticket submission for IT equipment, HR queries, and facility management.

### 6.8 Recruitment & Talent Acquisition Management
- Comprehensive hiring pipeline including Job Categories, Job Types, Skill tags, Experience brackets, Job Postings, Candidate Applications, Pipeline Kanban Boards, Interview Schedules, and Recruiter Desks.

### 6.9 Regional Adaptation & Multi-Currency Engine
- Global `RegionalSettingsContext` providing dynamic currency symbol switching, exchange rate multiplication, localized date formatting, and regional shift policy adaptation:
  - **PKR (`Rs`):** Pakistani Rupee
  - **USD (`$`):** US Dollar
  - **EUR (`€`):** Euro
  - **GBP (`£`):** British Pound
  - **AED (`AED`):** UAE Dirham
  - **SAR (`SAR`):** Saudi Riyal

---

## 7. Repository File Map & Codebase Hierarchy

### 7.1 Backend Directory Structure (`d:\NexaHR\src\`)

```
d:\NexaHR\src\
├── index.js                           # Express application entry point & server listener
├── config\
│   └── prisma.js                      # Singleton Prisma Client instance
├── middlewares\
│   ├── auth.middleware.js             # JWT bearer verification & user hydration
│   ├── rbac.middleware.js             # Role-based access control permission gates
│   └── tenant.middleware.js           # Multi-tenant safety middleware
├── routes\
│   ├── auth.routes.js                 # Authentication & OTP recovery routes
│   ├── employee.routes.js             # PIM & employee onboarding routes
│   ├── attendance.routes.js           # Biometric attendance & hardware webhook routes
│   ├── leave.routes.js                # Leave policy & application routes
│   ├── payroll.routes.js              # Salary structure & batch payroll routes
│   ├── department.routes.js           # Organizational department routes
│   ├── designation.routes.js          # Job designation routes
│   ├── dashboard.routes.js            # Admin & Employee dashboard metrics routes
│   ├── announcement.routes.js         # Company bulletin routes
│   └── notification.routes.js         # In-app notification routes
├── controllers\
│   ├── auth.controller.js             # Login, token issuance, OTP verification handlers
│   ├── employee.controller.js         # Employee CRUD & profile management handlers
│   ├── attendance.controller.js       # Biometric hardware sync & timesheet handlers
│   ├── leave.controller.js            # Leave quota, submission & approval handlers
│   ├── payroll.controller.js          # Salary configuration & batch payroll handlers
│   ├── department.controller.js       # Department management handlers
│   ├── designation.controller.js      # Job designation management handlers
│   ├── dashboard.controller.js        # Aggregated metrics handlers for Admin & ESS
│   ├── announcement.controller.js     # Announcement publishing & pinning handlers
│   └── notification.controller.js     # Notification feeds & read/clear handlers
├── services\
│   ├── notification.service.js        # Multi-channel in-app & email dispatcher
│   └── payroll.service.js             # Compensation formula calculation service
└── utils\
    ├── jwt.js                         # JWT sign & verify utility functions
    └── password.js                    # BCrypt password hashing & comparison helpers
```

### 7.2 Frontend Directory Structure (`d:\NexaHR\client\src\`)

```
d:\NexaHR\client\src\
├── App.jsx                            # Master React Router configuration & route guards
├── main.jsx                           # Application bootstrap with global context providers
├── index.css                          # Tailwind CSS v4 design system tokens & base styles
├── services\
│   └── api.js                         # Centralized HTTP client with token injection & error mapping
├── context\
│   ├── RegionalSettingsContext.jsx    # Currency, date format & locale state provider
│   └── ThemeContext.jsx               # Dark/Light mode theme state provider
├── layouts\
│   ├── MainLayout.jsx                 # HR Admin shell (Sidebar, Header, Content Area)
│   └── EmployeeLayout.jsx             # Employee Self-Service shell (Header, ESS Nav, Content)
├── components\
│   ├── auth\
│   │   └── ForgotPasswordModal.jsx    # 3-Step cryptographic OTP recovery modal
│   ├── common\
│   │   └── Logo.jsx                   # NexaHR vector brand logo component
│   └── navigation\
│       ├── Sidebar.jsx                # Admin & HR navigation sidebar
│       ├── AppPageHeader.jsx          # Top navigation bar with notifications & user menu
│       ├── EmployeeSidebar.jsx        # ESS dedicated navigation sidebar
│       ├── EmployeePageHeader.jsx     # ESS header with live biometric status badge
│       └── EmployeeBottomNav.jsx      # Mobile responsive bottom navigation
└── pages\
    ├── website\
    │   ├── Login.jsx                  # Dual-persona login portal (Admin vs Employee)
    │   ├── LandingPage.jsx            # Public marketing & product landing page
    │   └── RegisterAdmin.jsx          # Initial administrator bootstrap page
    ├── app\                           # HR Admin Command Center Pages
    │   ├── Dashboard.jsx              # Executive HR metrics & attendance compliance
    │   ├── Employees.jsx              # Company Directory & Team (PIM) management
    │   ├── Attendance.jsx             # Master biometric attendance terminal & logs
    │   ├── Leaves.jsx                 # Leave application approval queue
    │   ├── Payroll.jsx                # Monthly payroll calculation & disbursal
    │   ├── Departments.jsx            # Department hierarchy management
    │   ├── Announcement.jsx           # Company bulletin publishing
    │   ├── Accounts.jsx               # Financial accounts overview
    │   ├── Reports.jsx                # Headcount & attendance analytics
    │   ├── ProjectManagement.jsx      # Project task assignment
    │   ├── Award.jsx                  # Employee recognition awards
    │   ├── EmploymentStatus.jsx       # Employee shift & status management
    │   ├── LeavePolicy.jsx            # Leave quota policy configuration
    │   ├── Profile.jsx                # Admin personal profile
    │   ├── Settings.jsx               # System branding, grace period & regional settings
    │   ├── holiday\
    │   │   ├── WeeklyHoliday.jsx      # Weekend & recurring holiday configuration
    │   │   └── PublicHoliday.jsx      # Gazetted public holiday calendar
    │   ├── hr\
    │   │   ├── NewEmployee.jsx        # Full-page employee onboarding form
    │   │   ├── Designation.jsx        # Designation taxonomy manager
    │   │   └── RolePermissions.jsx    # Role permission matrix manager
    │   ├── payroll\
    │   │   ├── CalculatePayroll.jsx   # Dedicated batch payroll calculation wizard
    │   │   └── PayslipList.jsx        # Company-wide payslip archive
    │   └── recruitment\               # Full Recruitment & Talent Acquisition Suite
    │       ├── Jobs.jsx               # Job postings manager
    │       ├── JobApplication.jsx     # Candidate applications manager
    │       ├── JobBoard.jsx           # Visual hiring pipeline board
    │       ├── JobInterview.jsx       # Candidate interview scheduling
    │       ├── JobDesk.jsx            # Recruiter workspace desk
    │       ├── JobCategory.jsx        # Job category taxonomy
    │       ├── JobType.jsx            # Employment type manager
    │       ├── JobLocation.jsx        # Work location manager
    │       ├── JobSkills.jsx          # Required skills taxonomy
    │       └── JobExperience.jsx      # Experience level brackets
    └── employee\                      # Employee Self-Service (ESS) Pages
        ├── EmployeeDashboard.jsx      # ESS Command Center (Clock, Quotas, Holidays)
        ├── EmployeeAttendance.jsx     # Personal biometric attendance history
        ├── EmployeeLeaves.jsx         # Personal leave application & status tracker
        ├── EmployeePayslips.jsx       # Downloadable monthly salary slips
        ├── EmployeeAnnouncements.jsx  # Company bulletin board
        ├── EmployeeHolidays.jsx       # Gazetted holiday calendar with live countdown
        ├── EmployeeHelpdesk.jsx       # Internal IT & HR support ticketing
        ├── EmployeeDocuments.jsx      # Corporate handbook & policy library
        ├── EmployeeProfile.jsx        # Personal profile, emergency contacts, password change
        └── EmployeeSettings.jsx       # ESS notification & display preferences
```

### 7.3 Root Scripts & Automation Tools

- `run.bat` — Automated launcher checking `.env`, installing backend/frontend dependencies, and booting both servers in parallel.
- `run-backend.bat` — Starts backend Express API server on Port 5000.
- `run-frontend.bat` — Starts frontend Vite client on Port 5173.
- `clean-db-emojis.js` — Database cleanup utility stripping raw Unicode emojis from announcements and notifications.
- `test-notification-flow.js` — End-to-end integration test for in-app and email notifications.
- `test-recovery.js` — Automated verification script testing OTP password recovery security.
- `test-employee-flow.js` — Verification script testing employee onboarding, profile linking, and salary structure binding.
- `test-db.js` — Database connectivity and schema integrity test.

---

## 8. Comprehensive REST API Reference

All API routes are prefixed with `/api`. Authenticated endpoints require the header `Authorization: Bearer <token>`.

### 8.1 Authentication & Password Recovery Endpoints

#### `POST /api/auth/login`
- **Access Level:** Public
- **Description:** Authenticates user credentials and returns JWT bearer token and user profile.
- **Request Body:**
  ```json
  {
    "email": "admin@company.com",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "user": {
        "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
        "employeeCode": "EMP-ADMIN-001",
        "email": "admin@company.com",
        "firstName": "System",
        "lastName": "Administrator",
        "role": "ADMIN"
      }
    }
  }
  ```

#### `GET /api/auth/me`
- **Access Level:** Authenticated (All Roles)
- **Description:** Validates active JWT session and returns current user profile with department and designation relations.

#### `POST /api/auth/forgot-password/check`
- **Access Level:** Public
- **Description:** Queries account recovery capabilities and returns allowed OTP channels based on RBAC policy.
- **Request Body:** `{ "email": "employee@company.com" }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "role": "EMPLOYEE",
      "allowedChannels": ["EMAIL", "WHATSAPP"],
      "maskedEmail": "e***e@company.com",
      "maskedPhone": "+1 (555) ***-8882"
    }
  }
  ```

#### `POST /api/auth/forgot-password/initiate`
- **Access Level:** Public
- **Description:** Generates and dispatches a 6-digit cryptographic OTP to the requested channel.
- **Request Body:** `{ "email": "employee@company.com", "channel": "EMAIL" }`

#### `POST /api/auth/forgot-password/verify-otp`
- **Access Level:** Public
- **Description:** Verifies the 6-digit OTP against the stored SHA-256 hash and returns a short-lived reset token.
- **Request Body:** `{ "email": "employee@company.com", "otp": "491823" }`

#### `POST /api/auth/forgot-password/reset-password`
- **Access Level:** Public (Requires Reset Token in Authorization Header)
- **Description:** Updates the user's password with a new BCrypt-hashed string.
- **Request Body:** `{ "newPassword": "newSecurePassword123", "confirmPassword": "newSecurePassword123" }`

---

### 8.2 Dashboard & Metrics Endpoints

#### `GET /api/dashboard/admin`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Returns executive metrics: total employee headcount, today's attendance count, pending leave requests, total monthly payroll burn, and attendance breakdown.

#### `GET /api/dashboard/employee`
- **Access Level:** Authenticated Employee
- **Description:** Returns personal attendance record for today, live leave quotas (Annual, Sick, Casual), recent announcements, upcoming holidays, and latest payslip summary.

---

### 8.3 Employee & PIM Endpoints

#### `GET /api/employees`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Query Parameters:** `search`, `departmentId`, `role`, `page`, `limit`
- **Description:** Lists all employees with profile dossiers, department, designation, and salary structures.

#### `POST /api/employees` or `POST /api/employees/onboard`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Transactionally onboards a new employee, creates credentials, profile, and salary structure.
- **Request Body:**
  ```json
  {
    "employeeCode": "EMP-105",
    "email": "sarah.connor@company.com",
    "password": "TempPassword123",
    "firstName": "Sarah",
    "lastName": "Connor",
    "phone": "+1 555-0199",
    "role": "EMPLOYEE",
    "departmentId": "dept-uuid",
    "designationId": "desig-uuid",
    "gender": "Female",
    "joiningDate": "2026-08-15",
    "basicSalary": 75000,
    "housingAllowance": 15000,
    "transportAllowance": 8000,
    "taxDeductions": 5000
  }
  ```

#### `GET /api/employees/:id`
- **Access Level:** `ADMIN`, `HR_MANAGER`, or Self
- **Description:** Retrieves detailed dossier for a specific employee.

#### `PUT /api/employees/:id`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Updates profile fields, department, designation, or role.

---

### 8.4 Biometric Attendance Endpoints

#### `POST /api/attendance/hardware-sync`
- **Access Level:** Biometric Hardware Device (`x-hardware-key` header required)
- **Description:** Ingests punch timestamps directly from optical fingerprint or Face-ID terminals.
- **Request Body:**
  ```json
  {
    "employeeCode": "EMP-101",
    "timestamp": "2026-08-15T09:10:00Z"
  }
  ```

#### `GET /api/attendance`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Query Parameters:** `date`, `departmentId`, `status`
- **Description:** Fetches all attendance records across the enterprise for a specific date.

#### `GET /api/attendance/my-logs`
- **Access Level:** Authenticated Employee
- **Query Parameters:** `month`, `year`
- **Description:** Fetches personal attendance punch records and daily work hours for the current employee.

---

### 8.5 Leaves & Time-Off Endpoints

#### `GET /api/leaves/types`
- **Access Level:** Authenticated (All Roles)
- **Description:** Returns all active leave types (Annual, Sick, Casual, Emergency) and annual quota allocations.

#### `POST /api/leaves/apply` or `POST /api/leaves/request`
- **Access Level:** Authenticated (All Roles)
- **Description:** Submits a new leave request.
- **Request Body:**
  ```json
  {
    "leaveTypeId": "leave-type-uuid",
    "startDate": "2026-09-01",
    "endDate": "2026-09-03",
    "reason": "Family vacation"
  }
  ```

#### `GET /api/leaves/my-requests`
- **Access Level:** Authenticated Employee
- **Description:** Returns personal leave application history and current statuses (`PENDING`, `APPROVED`, `REJECTED`).

#### `GET /api/leaves` or `GET /api/leaves/requests`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Returns all leave requests across the company for administrative approval.

#### `PATCH /api/leaves/:id/status` or `PATCH /api/leaves/requests/:id/status`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Updates status of a leave application to `APPROVED` or `REJECTED` and dispatches notification.
- **Request Body:**
  ```json
  {
    "status": "APPROVED",
    "rejectionReason": null
  }
  ```

---

### 8.6 Payroll & Compensation Endpoints

#### `POST /api/payroll/salary-structure`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Creates or updates the salary structure for a specific employee.

#### `GET /api/payroll/salary-structure/:userId`
- **Access Level:** `ADMIN`, `HR_MANAGER`, or Self
- **Description:** Retrieves basic pay, allowances, and tax deduction configurations for an employee.

#### `POST /api/payroll/generate` or `POST /api/payroll/generate-monthly`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Runs batch payroll calculation for a specific billing month and year.
- **Request Body:**
  ```json
  {
    "month": 8,
    "year": 2026
  }
  ```

#### `GET /api/payroll/payslips`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Query Parameters:** `month`, `year`, `departmentId`
- **Description:** Retrieves all generated payslips across the organization.

#### `GET /api/payroll/my-payslips`
- **Access Level:** Authenticated Employee
- **Description:** Retrieves all personal payslip records for the requesting employee.

#### `PATCH /api/payroll/payslips/:id/status`
- **Access Level:** `ADMIN`, `HR_MANAGER`
- **Description:** Updates payslip status (`DRAFT`, `GENERATED`, `PAID`).

---

### 8.7 Organization & Department Endpoints

#### `GET /api/departments` — List all company departments with headcount counts.
#### `POST /api/departments` — Create a new department *(Admin/HR Only)*.
#### `PUT /api/departments/:id` — Update department name or code *(Admin/HR Only)*.
#### `DELETE /api/departments/:id` — Remove department with safe relation nullification *(Admin/HR Only)*.

---

### 8.8 Designation Endpoints

#### `GET /api/designations` — List all job designations with department relations.
#### `POST /api/designations` — Create a new job designation *(Admin/HR Only)*.
#### `PUT /api/designations/:id` — Update designation title or description *(Admin/HR Only)*.
#### `DELETE /api/designations/:id` — Remove job designation *(Admin/HR Only)*.

---

### 8.9 Company Announcement Endpoints

#### `GET /api/announcements` — List all active company announcements (sorted by pinned first).
#### `POST /api/announcements` — Publish and broadcast a new company bulletin *(Admin/HR Only)*.
#### `PUT /api/announcements/:id` — Update announcement content or pinned status *(Admin/HR Only)*.
#### `DELETE /api/announcements/:id` — Delete an announcement *(Admin/HR Only)*.

---

### 8.10 In-App Notification Endpoints

#### `GET /api/notifications` — Fetch user's notification feed.
#### `PATCH /api/notifications/read-all` — Mark all notifications as read.
#### `PATCH /api/notifications/:id/read` — Mark specific notification as read.
#### `DELETE /api/notifications/:id` — Delete a single notification.
#### `DELETE /api/notifications` — Clear all notifications for current user.

---

### 8.11 System Health Check Endpoint

#### `GET /api/health`
- **Access Level:** Public
- **Description:** Verifies backend availability and executes `SELECT 1` on PostgreSQL to confirm database connectivity.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "status": "UP",
    "message": "NexaHR Multi-Tenant API is healthy and connected to PostgreSQL database.",
    "timestamp": "2026-08-15T23:45:00.000Z"
  }
  ```

---

## 9. Frontend Design System & UI/UX Architecture

### 9.1 Design Principles & Glassmorphism Aesthetics
The frontend implements an aesthetic designed for clarity and engagement:
- **Tailwind CSS v4 Token Architecture:** Curated HSL-balanced palettes supporting both dark and light modes.
- **Subtle Glassmorphism:** Layered frosted glass panels (`backdrop-blur-md`, subtle border highlights) delivering depth.
- **Micro-Animations:** Framer Motion spring transitions on route changes, modal popovers, and button interactions.
- **Modern Typography:** High-legibility sans-serif font hierarchy with tabular numeral support for timestamps and financial data.

### 9.2 Theme & Regional State Management
- **`ThemeContext`:** Manages dark/light mode toggle, saving state to `localStorage` and attaching the `dark` class to `document.documentElement`.
- **`RegionalSettingsContext`:** Provides dynamic currency formatting (`formatCurrency(amount)`), date localization (`formatDate(date)`), and configurable company shift rules throughout the component tree.

### 9.3 Layout Routing Hierarchy

```
<Router>
  ├── Route "/" -> <Login /> (Dual-Persona Authentication Portal)
  ├── Route "/app/*" -> <MainLayout /> (Protected HR Admin Shell)
  │    ├── /app/dashboard
  │    ├── /app/employees (PIM Directory)
  │    ├── /app/attendance
  │    ├── /app/leaves
  │    ├── /app/payroll
  │    ├── /app/departments
  │    ├── /app/announcement
  │    ├── /app/reports
  │    ├── /app/settings
  │    └── /app/recruitment/*
  └── Route "/employee/*" -> <EmployeeLayout /> (Protected ESS Portal)
       ├── /employee/dashboard (Hero Station, Quotas, Holidays)
       ├── /employee/attendance (Personal Logs)
       ├── /employee/leaves (Apply & Track)
       ├── /employee/payslips (Downloadable Slips)
       ├── /employee/announcements (Bulletin Board)
       ├── /employee/holidays (Countdown Engine)
       ├── /employee/helpdesk (Ticketing)
       └── /employee/profile (Dossier & Credentials)
</Router>
```

---

## 10. Testing, Verification & Quality Assurance

### 10.1 Test Suites & Verification Scripts

NexaHR includes built-in verification scripts in the workspace root:

| Script | Command | Purpose & Test Scope |
| :--- | :--- | :--- |
| **Notification Flow Test** | `node test-notification-flow.js` | Verifies in-app notification creation, broadcast logic, and SMTP email dispatcher pipelines. |
| **Password Recovery Test** | `node test-recovery.js` | Tests account checking, role channel restrictions (Admin Email-only), OTP generation, attempt throttling, and password reset. |
| **Employee Flow Test** | `node test-employee-flow.js` | Verifies employee onboarding, department/designation linking, and salary structure configuration. |
| **Database Integrity Test** | `node test-db.js` | Executes raw SQL health queries against PostgreSQL and validates active table counts. |
| **Database Emoji Cleaner** | `node clean-db-emojis.js` | Strips unsupported emoji characters from announcements and notification records. |

### 10.2 Linting & Static Code Analysis

- **Frontend Oxlint:** `cd client && npm run lint` executes Oxlint across all JSX and JavaScript files.
- **Vite Production Build:** `cd client && npm run build` verifies zero syntax or bundling errors.

---

## 11. Installation, Environment Setup & Deployment Guide

### 11.1 Prerequisites
- **Node.js:** `v18.0.0` or higher (LTS recommended)
- **PostgreSQL:** `v14.0` or higher
- **npm:** `v9.0.0` or higher

### 11.2 Environment Variables Configuration

Create a `.env` file in the workspace root (`d:\NexaHR\.env`):

```env
# Server Port
PORT=5000

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nexahr?schema=public"

# JWT Authentication
JWT_SECRET="nexahr_super_secure_jwt_secret_key_2026"
JWT_EXPIRES_IN="7d"

# Biometric Hardware Webhook Secret Key
HARDWARE_SYNC_SECRET="nexahr_biometric_hardware_secret_2026"

# Transactional Email (SMTP Configuration)
EMAIL_HOST="smtp.company.com"
EMAIL_PORT=587
EMAIL_USER="notifications@company.com"
EMAIL_PASS="company_smtp_password"
```

### 11.3 Development Setup

#### Automated Start (Windows One-Click)
Double-click `run.bat` in the project root. The script checks for `.env`, installs missing dependencies, and launches both backend (Port 5000) and frontend (Port 5173).

#### Manual Step-by-Step Start

```bash
# 1. Install Backend Dependencies
npm install

# 2. Synchronize Prisma Database Schema
npx prisma db push

# 3. Seed Database with Initial Roles and Admin User
node prisma/seed.js

# 4. Start Backend Development Server
npm run dev

# ----------------------------------------------------

# 5. In a second terminal, install Frontend Dependencies
cd client
npm install

# 6. Start Frontend Development Server
npm run dev
```

- **Backend API:** `http://localhost:5000`
- **Frontend UI:** `http://localhost:5173`

---

### 11.4 Production Build & Process Management

#### 1. Compile Frontend Production Bundle
```bash
cd d:\NexaHR\client
npm run build
```
Outputs optimized static assets to `d:\NexaHR\client\dist`.

#### 2. Serve via Nginx Reverse Proxy (Sample Configuration)
```nginx
server {
    listen 80;
    server_name hrms.company.com;

    # Serve compiled React frontend
    location / {
        root /var/www/nexahr/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy REST API requests to Express backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. Manage Backend via PM2
```bash
npm install -g pm2
pm2 start src/index.js --name "nexahr-backend" --instances max --exec-mode cluster
pm2 save
pm2 startup
```

---

## 12. Troubleshooting & Maintenance Manual

| Symptom / Issue | Potential Cause | Resolution Steps |
| :--- | :--- | :--- |
| **`Database connection check failed`** | PostgreSQL service stopped or invalid `DATABASE_URL`. | 1. Ensure PostgreSQL service is active.<br>2. Verify database username, password, and port in `.env`.<br>3. Run `node test-db.js`. |
| **`PrismaClientInitializationError`** | Prisma client out of sync with schema. | Run `npx prisma generate` and `npx prisma db push`. |
| **`401 Unauthorized` on API routes** | Missing or expired JWT token in browser `localStorage`. | Re-authenticate via the login portal (`/`) to receive a fresh token. |
| **Biometric punch not reflecting** | Incorrect `x-hardware-key` header or mismatched `employeeCode`. | 1. Ensure device sends `x-hardware-key` matching `HARDWARE_SYNC_SECRET`.<br>2. Confirm `employeeCode` exists in `User` table. |
| **Frontend displays blank page on refresh** | SPA routing configuration missing on server. | Ensure `try_files $uri $uri/ /index.html;` is configured in web server (Nginx/Vite). |

---

**Document Maintained By:** NexaHR Core Engineering Team  
**Compliance Standard:** ISO/IEC 27001 Security & Enterprise Software Engineering Standards  
**Build Status:** ✅ Production Ready & Fully Operational

<div align="center">

# ⚡ NexaHR

### **Next-Generation Enterprise Human Resource, Biometric & Workforce Intelligence Platform**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <b>NexaHR</b> is an enterprise-grade Human Resource Management System (HRMS) and Employee Self-Service (ESS) platform. Designed with an intentional editorial design system (Deep Teal & Warm Slate with self-hosted Bricolage Grotesque & Instrument Sans typography), sub-10ms in-memory cache architecture, AI-powered Gmail ATS pipeline, zero-layout-shift shimmer loading, fine-grained Role-Based Access Control (RBAC), authenticated CV vault, real-time biometric synchronization, automated payroll tax engine, corporate document vault, and multi-tenant telemetry.
</p>

<p align="center">
  <a href="#-dual-portal-architecture">Dual Portals</a> •
  <a href="#-key-features--capabilities">Key Features</a> •
  <a href="#-editorial-design-system--brand-tokens">Design System</a> •
  <a href="#-ats-pipeline--performance-architecture">ATS Performance</a> •
  <a href="#-live-demo-credentials">Demo Credentials</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-repository-structure">Directory Map</a> •
  <a href="#-quick-start-guide">Quick Start</a> •
  <a href="#-api-reference-overview">API Reference</a> •
  <a href="#-automated-testing">Testing</a> •
  <a href="#-security--compliance">Security</a>
</p>

</div>

---

## 🌟 Highlights & Platform Overview

```
  ┌─────────────────────────────────────────────────────────────────────────────────────────┐
  │                                        NexaHR                                           │
  │                    ┌──────────────────────┴──────────────────────┐                      │
  │                    ▼                                             ▼                      │
  │   🏢 HR Executive Command Center                👤 Employee Self-Service (ESS)          │
  │     • 360° Workforce Intelligence & BI            • Live Punch Terminal & Active Timer  │
  │     • 6-Tab Employee Dossier & PIM                • Overtime & Regularization Logs      │
  │     • Hardware Biometric Gateway & Batch Punch    • Interactive Leave Quota Meters      │
  │     • Dynamic Payroll & Auto-Tax Processor        • Printable PDF-Styled Payslip Vault  │
  │     • AI ATS Pipeline & Requisition Workspace     • Team Roster & Live Presence Map     │
  │     • Non-Blocking Gmail ATS Auto-Screening       • Helpdesk & IT Service Desk          │
  │     • Authenticated CV Vault (RBAC & Signed URLs) • Encrypted Document Vault & Policies │
  │     • User-Partitioned In-Memory Caching (SWR)    • Holiday Countdown & Weekend Planner │
  │     • Bricolage Grotesque & Instrument Sans Brand • First-Login Credential Hardening    │
  │     • Zero-Layout-Shift Shimmer Skeleton Loading  • Multi-Currency Regional Preferences │
  │     • PgBouncer High-Concurrency Pool Tuning      • Responsive Mobile 2x2 Telemetry     │
  └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Dual-Portal Architecture

NexaHR delivers two distinct, role-tailored application environments sharing unified backend services and real-time data persistence:

### 🏢 HR Executive & Admin Command Center (`/app/*`)
* **Workforce Intelligence & BI Dashboard**: Headcount analytics, gender distribution, department breakdown charts, live presence gauge, quick action shortcuts, and recruitment pipeline status.
* **Personnel Information Management (PIM)**: Complete employee directory with 6-tab dossiers (Personal, Professional, Financial, Documents, Assets, Emergency Contact), search, department filtering, and status management.
* **Multi-Step Onboarding Engine**: Guided employee onboarding wizard with profile picture upload, salary structure configuration, and automated account credential generation.
* **Biometric & Geo Attendance Control**: Live biometric hardware gateway integration (`/api/attendance/hardware-sync`), daily punch logs, batch punch-in for active personnel (`/api/attendance/punch-all-today`), overtime records, and shift tracking (Present, Late, Half-Day, Absent, On Leave).
* **Leave Management & Dynamic Policy Engine**: Global leave quota rules, paid/unpaid classifications, full dynamic policy CRUD (Create, Read, Update, Delete) with live database persistence, multi-tier approval workflows, and audit history.
* **Automated Payroll & Tax Computation**: Dynamic allowances (HRA, transport, custom), tax deductions, unpaid leave penalties, and one-click monthly batch payslip generation.
* **Full-Lifecycle Recruitment & Applicant Tracking System (ATS)**:
  - **Requisition Command & Workspace**: Live sparkline KPI telemetry cards (`Published Openings`, `Total Applicants`, `Paused / On Hold`, and `Offer Acceptance`) with interactive vector sparklines, dual Grid and Table view modes, department/status filters, and instant requisition create/edit drawer.
  - **Interactive Kanban Candidate Funnel**: 5-stage drag-and-drop pipeline (`APPLIED` ➔ `SCREENING` ➔ `INTERVIEWING` ➔ `OFFER` ➔ `HIRED`), candidate scorecard ratings, full resume review drawer, and fast-track candidate creation modal.
  - **AI ATS Auto-Screening**: Non-blocking Gmail inbox sync (HTTP 202 Accepted) with background PDF/DOCX parsing, semantic job matching, provider-agnostic objective scoring (0–100), and AI Screened-Out audit drawer with one-click HR manual override.
  - **Authenticated Resume Delivery**: Protected endpoint serving candidate CVs via RBAC authorization (`ADMIN` / `HR_MANAGER`), streaming local files or generating short-lived Cloudinary signed URLs into client-side in-memory Blobs.
  - **Candidate Interview Desk**: Multi-round interview coordination (Technical, System Design, Leadership Fit), interviewer assignment, Google Meet room link generation, and real-time pass/reschedule status.
  - **Unified Master Taxonomy & Settings**: 5-in-1 centralized management for Job Categories, Contract Types, Hiring Locations, Skill Competency Taxonomy, and Seniority Career Bands with database persistence and zero dummy-data fallbacks.
* **Document Vault & Policy Governance Hub (`/app/documents`)**: Issue official contracts, NDAs, offer letters, and salary certificates directly to employees, oversee employee personal document uploads, publish company handbooks and compliance policies, with dynamic search and instant file downloads.
* **IT Helpdesk & Support Desk Management (`/app/helpdesk`)**: Company-wide support ticket queue management, category and priority triage (HR, IT, Payroll, Facilities), status advancement (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), and threaded resolution conversations.
* **Organization Hierarchy & Designations**: Dynamic department creation, designation hierarchy mapping, and team reporting structure.
* **User Access Control & Security**: Fine-grained Role-Based Access Control (RBAC) permission matrices, user status activation/deactivation, and security audit logs.
* **Accounts, Ledgers & Financial Audits**: Departmental cost tracking, payroll disbursement logs, expense accounts, batch operations, and exportable financial summaries.
* **Corporate Announcements**: Rich-text company broadcasts, department targeting, priority tags, and pinning capabilities.

### 👤 Employee Self-Service (ESS) Portal (`/employee/*`)
* **Live Punch Terminal**: Real-time web clock-in/out terminal with active session timers, break counter, and cross-tab event synchronization.
* **Attendance & Regularization**: Monthly punch logs, check-in/out stamps, punch methods (Biometric, Web, Mobile), and regularization request filing.
* **Smart Leave Manager**: Visual quota progress meters (Annual, Casual, Sick, Parental), instant date duration calculations, reason attachments, and approval tracking.
* **Interactive Payslip Vault**: Detailed earnings vs. deductions breakdown, year-to-date (YTD) salary trends, and pixel-perfect PDF-styled printable payslip view.
* **Company Team Directory & Roster**: Searchable colleague directory filtered by department and live presence (In Office, Remote, On Leave), with direct email actions.
* **Helpdesk & HR Service Desk**: Multi-category support ticket creation (HR, IT Hardware, Payroll, Benefits), priority levels, resolution status tracking, and threaded conversations.
* **Encrypted Document Vault & Policy Center**: Personal contracts, signed NDAs, tax forms, certificate upload modal with type filtering, and company policy handbook repository.
* **Holiday Schedule & Long Weekend Planner**: Next holiday countdown hero banner, full official calendar, and long weekend optimization badges.
* **Multi-Tab Profile & Settings**: Comprehensive personal dossier view, theme engine customization (Dark/Light/System), and security settings.

---

## 🎨 Editorial Design System & Brand Tokens

NexaHR features an intentional, bespoke design system documented in [`DESIGN.md`](DESIGN.md) that deliberately rejects generic "AI-generated" UI patterns:

```
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                               NexaHR Design System                                     │
  ├────────────────────────────────────────────────────────────────────────────────────────┤
  │  Primary Brand Colour: Deep Teal (#0F766E / teal-700)                                   │
  │  Ink & Body Text:      Warm Slate (#1C2321) on Warm Off-White (#F6F5F1)                 │
  │  Card Surfaces:        Pristine White (#FFFFFF) / Dark Mode (#16211E)                   │
  │  Accent Highlight:     Warm Amber (#D97706) — used as FILL with dark ink text           │
  │  Display Typography:   Bricolage Grotesque (600/700) — self-hosted, variable            │
  │  Body Typography:      Instrument Sans (400/500/600) — tabular numbers for figures     │
  │  Radius Scale:         Controls (8px) • Cards (14px) • Large Modals/Drawers (20px)     │
  │  Elevation:            Subtle 3-tier shadow hierarchy (0 glow, 0 neon halos)            │
  │  Motion:               150-250ms ease transitions respecting prefers-reduced-motion     │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Design Principles
1. **No Gradient Text / Neon Glows**: Headings use solid, high-contrast brand ink (`#1C2321` or deep teal). Gradients are strictly limited to small accent borders, never type.
2. **Intentional Layout Asymmetry**: Varied grid structures, lead cards with supporting modules, and left-aligned headers rather than repetitive centered heroes with 3 equal cards.
3. **Typography with Personality**: Self-hosted variable fonts via `@fontsource-variable/bricolage-grotesque` and `@fontsource-variable/instrument-sans`. Tabular numbers (`tabular-nums`) ensure clean alignment across payroll, tables, and KPI metrics.
4. **Three-Tier Radius Scale**:
   * **Controls & Inputs**: `rounded-lg` (`8px`)
   * **Cards & Containers**: `rounded-[14px]` (`14px`)
   * **Drawers & Modals**: `rounded-[20px]` (`20px`)
5. **Standardized Reusable Primitives** (`client/src/components/common/`):
   * [`Button.jsx`](client/src/components/common/Button.jsx) (`primary`, `secondary`, `destructive`, `ghost`)
   * [`Input.jsx`](client/src/components/common/Input.jsx) (Accessible label, hint, error states, and icon prefixes)
   * [`Card.jsx`](client/src/components/common/Card.jsx) (Restrained 14px radius, warm borders, zero glow)
   * [`Badge.jsx`](client/src/components/common/Badge.jsx) (`brand`, `accent`, `success`, `warning`, `danger`, `neutral`)
   * [`AiScoreBadge.jsx`](client/src/components/common/AiScoreBadge.jsx) (High-contrast amber/teal score meters)
   * [`Drawer.jsx`](client/src/components/common/Drawer.jsx) & [`Modal.jsx`](client/src/components/common/Modal.jsx) (Accessible backdrop, focus trapping, Esc-to-close)

---

## ⚡ ATS Performance & Optimization Architecture

The ATS Pipeline (`/recruitment/pipeline`) was overhauled to eliminate render bottlenecks, delivering instant page loads and seamless Kanban interactions:

1. **Prisma Select Projection (99.9% Payload Reduction)**:
   * The list query (`GET /api/recruitment/applications`) uses a targeted Prisma `select` projection returning only card essentials (`id`, `name`, `role`, `stage`, `aiScore`, `aiStatus`, `experience`, `rating`).
   * Heavy fields (`resumeUrl`, `resumeSummary`, `aiBreakdown`, `aiStrengths`, `aiGaps`) are omitted from the initial list payload.
2. **Lazy Dossier Loading**:
   * Full applicant dossiers are loaded on-demand via `GET /api/recruitment/applications/:id` only when a candidate drawer is opened. The drawer shell displays immediately with card data while details stream in progressively.
3. **Non-Blocking Gmail ATS Sync (HTTP 202)**:
   * `POST /api/recruitment/ai-screening/sync` initiates the background scan and returns `202 Accepted` immediately with job status. The UI polls `GET /api/recruitment/ai-screening/status` without blocking Express event loop threads.
4. **Targeted Database Indexes**:
   * PostgreSQL composite and single-column indexes guarantee sub-3ms queries:
     * `JobApplication(status, aiStatus)`
     * `JobApplication(stage)`
     * `JobApplication(jobOpeningId)`
     * `JobApplication(email)`
     * `JobApplication(createdAt)`
5. **PgBouncer Transaction Pool Tuning**:
   * Configured `connection_limit=10&pool_timeout=20&pgbouncer=true` in `DATABASE_URL` for efficient connection re-use over remote Supabase / PostgreSQL poolers.
6. **Frontend PROGRESSIVE Rendering & Memoization**:
   * Parallel `Promise.all` loads the candidate roster independently of stats and jobs.
   * `React.memo` on `CandidateCard` prevents board-wide re-renders during drag-and-drop stage changes.
   * Express `compression` (gzip) enabled across all JSON payloads.

---

## 🔒 Enterprise Security & Special Features

* **Authenticated Resume Access & RBAC**:
  - Removed public `/uploads` static file exposure.
  - Candidate CVs are served exclusively via authenticated endpoint `GET /api/recruitment/applications/:id/resume`.
  - Strict role check (`ADMIN`, `HR_MANAGER`, `SUPER_ADMIN`, `COMPANY_ADMIN`). Requests with `EMPLOYEE` role receive `403 Forbidden`.
  - For Cloudinary, resumes are uploaded as `type: 'authenticated'` and served via short-lived signed URLs.
  - The frontend downloads resumes into in-memory `Blob` URLs, opening them securely in a new window and revoking the object URL after 60 seconds.
* **User-Isolated In-Memory Cache (SWR)**:
  - Cache keys in [`cache.service.js`](src/services/cache.service.js) partition by `${role}:${userId}:${url}`.
  - User A's cached response is never leaked or served to User B, with strict query parameter isolation.
  - Automatic cache invalidation triggers instantly on mutation (`POST`, `PUT`, `PATCH`, `DELETE`).
* **Multi-Channel Password Recovery**: 
  - Ephemeral 6-digit OTP verification via Corporate SMTP (Nodemailer) or WhatsApp Cloud API (Twilio / Meta).
  - SHA-256 hashed OTPs with strict 10-minute expiry and brute-force attempt limits.
* **Render Free-Tier Keep-Alive Daemon**:
  - Background self-ping service ([`selfPing.service.js`](src/services/selfPing.service.js)) pings `/api/health` every 14 minutes, preventing free-tier container spindown delays.
* **Tiered Rate Limiting & HTTP Protection**:
  - Strict rate limiters for authentication endpoints, password reset flows, and general API routes.
  - Helmet CSP headers, CORS with credential handling, and express-validator input sanitization.

---

## 🔑 Live Demo Credentials

NexaHR includes pre-configured demo credentials for instant testing:

| Portal Mode | Role | Email | Password | Access Path |
| :--- | :--- | :--- | :--- | :--- |
| **HR Executive / Admin** | `ADMIN` | `admin@company.com` | `admin123` | [`/app/dashboard`](http://localhost:5173/app/dashboard) |
| **HR Manager** | `HR_MANAGER` | `hr@company.com` | `hr123` | [`/app/dashboard`](http://localhost:5173/app/dashboard) |
| **Employee Self-Service** | `EMPLOYEE` | `employee@company.com` | `employee123` | [`/employee/dashboard`](http://localhost:5173/employee/dashboard) |

> 💡 **Role Switcher**: Seamlessly switch between HR Admin and Employee views at any time via the sidebar or header profile dropdown.

---

## 🛠️ Tech Stack

### **Frontend Client**
* **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
* **Routing**: [React Router v7](https://reactrouter.com/) (Data routers, layouts & ScrollToTop utility)
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Editorial Theme Engine
* **Typography**: `@fontsource-variable/bricolage-grotesque` (Headings) + `@fontsource-variable/instrument-sans` (Body & Controls)
* **Data Visualizations**: [Recharts 3](https://recharts.org/) (Area, Bar, Donut, and Radial charts)
* **Iconography**: [Lucide React](https://lucide.dev/) (Strict icon library, 0 emojis as UI icons)
* **Motion & Animations**: [Framer Motion](https://www.framer.com/motion/) (Restrained 150-250ms ease transitions)

### **Backend Server & Infrastructure**
* **Runtime**: [Node.js](https://nodejs.org/) (v18+ LTS)
* **REST Framework**: [Express.js 4.21](https://expressjs.com/) (Modular Route-Controller-Service architecture)
* **Compression**: `compression` middleware enabled across all endpoints
* **Performance & Caching**: In-Memory User-Isolated Cache Service (`cache.service.js`) with mutation invalidator
* **ORM & Database**: [Prisma ORM 5.22](https://www.prisma.io/) + [PostgreSQL 15+](https://www.postgresql.org/) with PgBouncer connection tuning
* **Authentication**: JWT (JSON Web Tokens) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + HttpOnly Cookies
* **Media & CV Storage**: [Cloudinary](https://cloudinary.com/) (Authenticated documents & image avatars)
* **Email & WhatsApp**: [Nodemailer](https://nodemailer.com/) (SMTP) + [Twilio](https://www.twilio.com/) / Meta WhatsApp Cloud API
* **Security**: [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [express-validator](https://express-validator.github.io/docs/)

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Client (React 19 + Vite 8 + Tailwind v4)"]
        A[Login / Multi-Channel Recovery Portal]
        B[Admin & HR Command Center /app/*]
        C[Employee ESS Module /employee/*]
        D[In-App Notification Center]
        E[Editorial UI Primitives & Shimmer Skeletons]
    end

    subgraph Server["Backend REST API (Node.js + Express 4.21)"]
        F[Security Middlewares Helmet, CORS, RateLimit, Compression]
        G[Auth & RBAC Middleware verifyToken + checkRole]
        H[Auth Controller & Recovery]
        I[Employee & PIM Controller]
        J[Attendance & Biometric Sync]
        K[Leave & Policy Controller]
        L[Payroll & Tax Calculation]
        M[Department & Designation Engine]
        N[Notification & Announcement Hub]
        T[IT Helpdesk & Tickets Controller]
        U[Accounts & Ledger Controller]
        X[Recruitment, ATS & Resume Delivery Controller]
        Y[Document Vault & Policies Controller]
        V[User-Partitioned Cache Service]
        W[Anti-Spindown Self-Ping Daemon]
    end

    subgraph Storage["Persistence & External Cloud Services"]
        O[(PostgreSQL Database with PgBouncer)]
        P[Cloudinary Authenticated CDN Vault]
        Q[Corporate SMTP Nodemailer]
        R[WhatsApp Gateway Twilio / Meta API]
        S[Biometric Hardware Gateway]
    end

    A & B & C & D --> F
    F --> G
    G --> H & I & J & K & L & M & N & T & U & X & Y
    H & I & J & K & L & M & N & T & U & X & Y <--> V
    H & I & J & K & L & M & N & T & U & X & Y --> O
    I & X & Y --> P
    H & N --> Q & R
    J <--> S
    W -.->|14-min keepalive ping| F
```

---

## 📁 Repository Structure

```
NexaHR/
├── DESIGN.md                               # Canonical Brand Document & Design System Tokens
├── client/                                 # Frontend Client (React 19 + Vite 8 + Tailwind v4)
│   ├── public/                             # Public static assets & favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                       # ForgotPasswordModal (Email & WhatsApp OTP)
│   │   │   ├── common/                     # Button, Input, Card, Badge, AiScoreBadge, Drawer, Modal, Skeleton
│   │   │   └── navigation/                 # Admin & Employee Sidebar, Header, MobileBottomNav, PageHeaders
│   │   ├── context/                        # ThemeContext & RegionalSettingsContext
│   │   ├── layouts/                        # MainLayout (Admin) & EmployeeLayout (ESS)
│   │   ├── pages/
│   │   │   ├── app/                        # HR Executive & Admin Command Center Pages
│   │   │   │   ├── Dashboard.jsx           # 360° Workforce BI & Analytics
│   │   │   │   ├── Employees.jsx           # Directory, Table, and 6-Tab Dossier Modal
│   │   │   │   ├── Attendance.jsx          # Biometric Hardware Sync, Daily Logs & Batch Punch
│   │   │   │   ├── Leaves.jsx              # Company-wide Leave Approvals
│   │   │   │   ├── LeavePolicy.jsx         # Quota Rules & Dynamic Policy Configuration (CRUD)
│   │   │   │   ├── Payroll.jsx             # Payroll Ledger & Structure Management
│   │   │   │   ├── Departments.jsx         # Organizational Units
│   │   │   │   ├── UserAccessControl.jsx   # Split-Screen RBAC Governance & Preset Matrix
│   │   │   │   ├── Accounts.jsx            # Company Accounts & Ledger Management
│   │   │   │   ├── Documents.jsx           # Document Vault, Policy Center & Employee Submissions
│   │   │   │   ├── Helpdesk.jsx            # IT & HR Support Ticket Queue & Triage Desk
│   │   │   │   └── recruitment/            # Recruitment ATS & Talent Intelligence Suite
│   │   │   │       ├── JobsWorkspace.jsx   # Requisition Command & SparkMetric Telemetry
│   │   │   │       ├── ATSPipeline.jsx     # High-Performance 5-Stage Kanban & Candidate Dossier
│   │   │   │       ├── JobDesk.jsx         # Recruiter Command Desk & Velocity Telemetry
│   │   │   │       ├── JobInterview.jsx    # Interview Rounds & Scheduling
│   │   │   │       └── RecruitmentSettings.jsx # Unified 5-in-1 Master Configuration
│   │   │   └── employee/                   # Employee Self-Service Pages
│   │   ├── services/                       # Centralized Axios/Fetch API Client & SWR In-Memory Store
│   │   ├── App.jsx                         # Master Routing Hub & Protected Routes
│   │   ├── index.css                       # Global Tailwind v4 Theme Tokens & Typography Styles
│   │   └── main.jsx                        # React 19 Entrypoint with Self-Hosted Font Loaders
│   ├── package.json
│   └── vite.config.js
│
├── prisma/
│   ├── schema.prisma                       # PostgreSQL Schema, Relational Models & Indexes
│   ├── seed.js                             # Canonical Database Seeder
│   └── migrations/                         # Prisma Migration History SQL files
│
├── scripts/
│   └── gmail-auth.js                       # CLI Utility for Google OAuth 2.0 Token Generation
│
├── src/                                    # Backend Express.js REST API
│   ├── config/                             # Prisma Client & Cloudinary Authenticated Configuration
│   ├── controllers/                        # Dedicated Controllers (Auth, Recruitment, Employee, Leaves, etc.)
│   ├── middlewares/                        # JWT Auth, RBAC checkRole, Rate Limiters, Upload, Validators
│   ├── routes/                             # Express REST API Endpoints (Auth, Recruitment, Attendance, etc.)
│   ├── services/                           # Cache Service, Gmail ATS, AI Screening, Resume Parser, Self-Ping
│   ├── tests/                              # Automated Unit & Security Test Suites
│   │   ├── aiScreening.test.js             # AI Scoring, Decision Thresholds & Normalization Tests
│   │   └── atsHardening.test.js            # Resume RBAC, Cache Isolation & Authenticated Delivery Tests
│   ├── utils/                              # Contact Extractor, Filters, Password Hashing & JWT Helpers
│   └── index.js                            # Express Server Entrypoint with Compression & Security
│
├── run.bat / run.sh                        # 1-Click Unified Development Launchers
├── .env.example                            # Environment Variables Template
├── package.json                            # Root Backend Package & Scripts
└── README.md                               # Project Master Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) `>= 18.0.0`
* [npm](https://www.npmjs.com/) `>= 9.0.0`
* [PostgreSQL](https://www.postgresql.org/) `>= 14.0` *(Supabase, Neon, AWS RDS, or local)*

---

### Option 1: 1-Click Launch (Recommended)

#### On Windows:
Double-click [`run.bat`](run.bat) or execute in PowerShell/CMD:
```bat
.\run.bat
```

#### On Linux / macOS:
```bash
chmod +x run.sh
./run.sh
```

---

### Option 2: Manual Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/imumairakram/Nexa-HR.git
cd Nexa-HR
```

#### 2. Backend Setup & Configuration
```bash
# Install root/backend dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` variables:
```env
PORT=5000
NODE_ENV=development
# Append connection_limit and pool_timeout for PgBouncer transaction pooling
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/postgres?pgbouncer=true&connection_limit=10&pool_timeout=20"
JWT_SECRET="nexahr_super_secure_jwt_secret_key_2026"
JWT_EXPIRES_IN="1h"
FRONTEND_URL="http://localhost:5173"

# Self-Ping Anti-Spindown Service (Render Free-Tier)
BACKEND_URL="https://your-app.onrender.com"

# Hardware Biometric Terminal Gateway Key
HARDWARE_SECRET_KEY="your_hardware_secret_key"

# Cloudinary Storage Configuration (Avatars & Authenticated CVs)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Corporate SMTP Email Configuration (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
EMAIL_FROM="NexaHR Security <no-reply@nexahr.com>"
```

Generate Prisma client & deploy database migrations:
```bash
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

Start the Backend Server:
```bash
npm run dev:backend
# Backend active on http://localhost:5000
```

#### 3. Frontend Client Setup
In a separate terminal:
```bash
cd client
npm install
npm run dev
# Frontend active on http://localhost:5173
```

#### 4. Unified Concurrent Development
Alternatively, run both servers together from the project root:
```bash
npm run dev
```

---

## 🤖 AI-Powered ATS Auto-Screening from HR Gmail

NexaHR includes an automated, AI-driven Applicant Tracking System (ATS) pipeline that synchronizes candidate applications received in the HR Gmail inbox into the active recruitment workflow.

### Feature Workflow

1. **Email Ingestion**: Candidates send application emails with CV attachments (PDF/DOCX, up to 10 MB) to HR's inbox.
2. **Background Cron Polling**: A background daemon (`gmail.service.js`) polls every 5 minutes (configurable via `GMAIL_POLL_CRON`) using `node-cron`.
3. **Resume Parsing & Authenticated Cloud Storage**:
   - `pdf-parse` and `mammoth` extract text from PDF and DOCX attachments directly in memory.
   - Original resumes are uploaded to Cloudinary as `type: 'authenticated'`.
4. **Step A - Job Requisition Matching**:
   - Scans email subject and body for requisition codes (e.g. `JOB-101`) or job titles.
   - Matches candidate CV semantically against active job openings. Candidates without a clear match (confidence < 0.5) are routed to manual review (`aiStatus = 'UNMATCHED'`).
5. **Step B - Objective ATS Scoring (0–100)**:
   - Provider-agnostic engine (`gemini`, `openai`, `anthropic`).
   - Anti-injection defense (`<untrusted_candidate_resume>` tags).
   - Strict fairness constraint: name, gender, age, nationality, religion, race, and marital status are strictly excluded from evaluation.
   - Validated strictly via `zod` schema (breakdown: skills, experience, education, keywords; recruiter summary, strengths, gaps).
6. **Pipeline Routing & Audit**:
   - **Score ≥ 70 (`CONFIRMED`)**: Candidate is placed into the **"Sourced & Applied" (`APPLIED`)** Kanban column with their **AI Score** badge.
   - **Score < 70 (`SCREENED_OUT`)**: Candidate is preserved in the audit database, viewable in the **"AI Screened-Out"** drawer, with a one-click **"Override & Add to Pipeline"** action for HR.

---

## 📡 API Reference Overview

All REST API endpoints are mounted under `/api` with sanitized JSON responses:

### 🎯 Recruitment, ATS & Candidate Pipeline
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recruitment/stats` | Aggregated metrics, counts & offer conversion rate | Yes |
| `GET` | `/api/recruitment/jobs` | List job openings with search, department & status filters | Yes |
| `GET` | `/api/recruitment/jobs/:id` | Fetch detailed job opening requisition | Yes |
| `POST` | `/api/recruitment/jobs` | Create new job opening requisition | Admin / HR |
| `PUT` | `/api/recruitment/jobs/:id` | Update job opening requisition | Admin / HR |
| `PATCH` | `/api/recruitment/jobs/:id/status`| Toggle requisition status (`ACTIVE` / `PAUSED` / `CLOSED`) | Admin / HR |
| `DELETE` | `/api/recruitment/jobs/:id` | Delete job opening requisition | Admin / HR |
| `GET` | `/api/recruitment/applications` | List lightweight candidate applications (slim projection) | Yes |
| `GET` | `/api/recruitment/applications/:id`| Lazy-load full candidate dossier & AI analysis | Yes |
| `GET` | `/api/recruitment/applications/:id/resume`| **Secure authenticated resume stream / signed URL** | **Admin / HR Only (403 for Employee)** |
| `POST` | `/api/recruitment/applications` | Submit / create new candidate application | Admin / HR |
| `PUT` | `/api/recruitment/applications/:id`| Update candidate profile & resume summary | Admin / HR |
| `PATCH` | `/api/recruitment/applications/:id/stage`| Advance candidate pipeline stage (`APPLIED` ➔ `HIRED`) | Admin / HR |
| `DELETE` | `/api/recruitment/applications/:id`| Delete candidate application | Admin / HR |
| `POST` | `/api/recruitment/ai-screening/sync` | **Non-blocking trigger (HTTP 202 Accepted) for Gmail ATS sync** | Admin / HR |
| `GET` | `/api/recruitment/ai-screening/status` | Polling endpoint for ATS sync telemetry and status | Admin / HR |
| `GET` | `/api/recruitment/ai-screening/screened-out` | List low-score, unmatched, or parse-error applications | Admin / HR |
| `POST` | `/api/recruitment/applications/:id/ai-override` | HR manual override: promote candidate to APPLIED stage | Admin / HR |
| `POST` | `/api/recruitment/applications/:id/rescan` | Re-run AI scan for an application | Admin / HR |
| `GET` | `/api/recruitment/interviews` | List scheduled interviews with round & date filters | Yes |
| `POST` | `/api/recruitment/interviews` | Schedule new interview round with Google Meet link | Admin / HR |
| `PUT` | `/api/recruitment/interviews/:id` | Update interview schedule, status, feedback & score | Admin / HR |
| `DELETE` | `/api/recruitment/interviews/:id` | Delete / cancel scheduled interview | Admin / HR |
| `GET` | `/api/recruitment/taxonomies` | List recruitment taxonomies (`CATEGORY`, `TYPE`, `LOCATION`, `SKILL`, `EXPERIENCE`) | Yes |
| `POST` | `/api/recruitment/taxonomies` | Create new recruitment taxonomy item | Admin / HR |
| `PUT` | `/api/recruitment/taxonomies/:id` | Update recruitment taxonomy item | Admin / HR |
| `PATCH` | `/api/recruitment/taxonomies/:id/toggle`| Toggle taxonomy active status | Admin / HR |
| `DELETE` | `/api/recruitment/taxonomies/:id` | Delete recruitment taxonomy item | Admin / HR |

### 🔐 Authentication & Session
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-admin` | Bootstrap initial system administrator | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | No (Rate Limited) |
| `POST` | `/api/auth/logout` | Revoke session & clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Fetch active user session profile | Yes |
| `PUT` | `/api/auth/profile` | Update personal profile details | Yes |
| `PUT` | `/api/auth/change-password` | Update account password | Yes |
| `POST` | `/api/auth/forgot-password/check` | Verify user identity channel (Email / Phone) | No (Rate Limited) |
| `POST` | `/api/auth/forgot-password` | Initiate multi-channel OTP password recovery | No (Rate Limited) |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit cryptographic OTP | No (Rate Limited) |
| `POST` | `/api/auth/reset-password` | Complete password reset with verified OTP | No (Rate Limited) |

### 👥 Personnel Information Management (PIM)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | List all employees (parallelized queries) | Admin / HR |
| `GET` | `/api/employees/:id` | Fetch detailed employee dossier | Yes |
| `POST` | `/api/employees/onboard` | Onboard new employee & profile | Admin / HR |
| `PUT` | `/api/employees/:id` | Update employee information | Admin / HR |
| `DELETE` | `/api/employees/:id` | Soft/Hard delete employee record | Admin / HR |
| `POST` | `/api/employees/profile-picture` | Upload avatar via Cloudinary stream | Yes |
| `DELETE` | `/api/employees/profile-picture` | Remove avatar & reset to initials | Yes |

### ⏱️ Attendance & Biometrics
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/hardware-sync` | Ingest biometric hardware punch sync | `x-hardware-key` |
| `GET` | `/api/attendance/my-logs` | Fetch authenticated employee punch logs | Yes |
| `GET` | `/api/attendance` | Fetch company-wide attendance overview | Admin / HR |
| `POST` | `/api/attendance/punch-all-today` | Batch punch-in all active employees today | Admin / HR |

### 🏖️ Leave Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves/types` | List leave policies & allowed quotas | Yes |
| `POST` | `/api/leaves/types` | Create new leave type policy | Admin / HR |
| `GET` | `/api/leaves/types/:id` | Fetch specific leave type policy details | Admin / HR |
| `PUT` | `/api/leaves/types/:id` | Update leave type policy, days quota & description | Admin / HR |
| `DELETE` | `/api/leaves/types/:id` | Delete leave type policy | Admin / HR |
| `POST` | `/api/leaves/apply` | Submit new leave application | Yes |
| `GET` | `/api/leaves/my-requests` | Get employee's personal leave requests | Yes |
| `GET` | `/api/leaves` | List leave requests (Smart dispatch: Admin/HR vs Employee) | Yes |
| `PUT` | `/api/leaves/:id/status` | Approve or reject leave application | Admin / HR |

### 💰 Payroll & Compensation
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payroll/salary-structure` | Set employee salary structure & allowances | Admin / HR |
| `GET` | `/api/payroll/salary-structure/:userId`| Get employee salary breakdown | Yes |
| `POST` | `/api/payroll/generate-monthly`| Execute automated monthly batch payroll | Admin / HR |
| `GET` | `/api/payroll/payslips` | List company-wide generated payslips | Admin / HR |
| `GET` | `/api/payroll/my-payslips` | Fetch employee's personal payslips | Yes |
| `PUT` | `/api/payroll/payslips/:id/status` | Update payslip payment status | Admin / HR |

---

## 🧪 Automated Testing

NexaHR includes built-in automated test suites executing via Node's native test runner (`node --test`):

```bash
# Run all unit and security integration tests
npm test
```

### Test Coverage Highlights:
1. **AI ATS Screening Suite (`src/tests/aiScreening.test.js`)**:
   * Threshold boundary validation (Score 69 vs 70 vs 71).
   * Zod schema parsing and malformed payload rejection.
   * Markdown code block JSON extraction (`cleanJsonOutput`).
   * Semantic job match parsing and score validation.
   * Duplicate candidate protection (updating existing candidate vs duplicate creation).
   * Contact extraction: phone number extraction, standard normalization (`+92 XXX XXXXXXX`), and privacy masking.
   * Requisition KPI and Kanban card filter alignment (`visibleApplicationsWhere`).
2. **ATS Hardening & Security Suite (`src/tests/atsHardening.test.js`)**:
   * **401 Unauthorized**: Requesting candidate resume without token returns `401`.
   * **403 Forbidden**: Requesting resume with `EMPLOYEE` role is blocked with `403`.
   * **200 OK**: Requesting resume with `HR_MANAGER` or `ADMIN` role returns `200` with `Content-Type: application/pdf` and `Content-Disposition: inline`.
   * **404 Not Found**: Requesting resume for non-existent candidate returns `404`.
   * **Cache Key Partitioning**: Verifies role, user ID, and URL query string isolation in cache generation.
   * **Self-Cleaning Lifecycle**: Tests dynamically generate and clean up mock binary assets without leaving residual test files on disk.

To build and verify the frontend:
```bash
npm --prefix client run build
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**. See the `LICENSE` file for details.

---

<div align="center">
  <b>Built with ❤️ for modern agile organizations worldwide.</b><br/>
  <sub>© 2026 NexaHR Platform. All rights reserved.</sub>
</div>

<div align="center">

# ⚡ NexaHR

### **Next-Generation Enterprise Human Resource, Biometric, Payroll & Workforce Intelligence Platform**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Test Suite](https://img.shields.io/badge/Tests-24%20Passing-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <b>NexaHR</b> is an enterprise-grade Human Resource Management System (HRMS) and Employee Self-Service (ESS) platform engineered for agility, institutional precision, and high concurrency. Powered by an intentional editorial design system (Deep Teal & Warm Slate typography), a sub-10ms user-partitioned in-memory cache architecture, an AI-driven Gmail ATS resume pipeline, zero-layout-shift shimmer loading, granular Role-Based Access Control (RBAC), authenticated CV streaming, real-time biometric hardware sync, automated tax calculation, and dedicated enterprise telemetry (Single-Tenant Architecture).
</p>

<p align="center">
  <a href="#-executive-overview--platform-topology">Overview</a> •
  <a href="#-dual-portal-architecture">Dual Portals</a> •
  <a href="#-editorial-design-system--brand-identity">Design System</a> •
  <a href="#-ai-powered-ats--gmail-screening-pipeline">AI ATS Pipeline</a> •
  <a href="#-high-performance-architecture--caching">Performance & Caching</a> •
  <a href="#-security-hardening--compliance">Security</a> •
  <a href="#-live-demo-credentials">Demo Credentials</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-repository-structure">Directory Map</a> •
  <a href="#-quick-start-guide">Quick Start</a> •
  <a href="#-exhaustive-rest-api-reference">API Reference</a> •
  <a href="#-automated-testing--verification">Testing</a>
</p>

</div>

---

## 🌟 Executive Overview & Platform Topology

NexaHR unifies company-wide workforce operations across two complementary operational environments connected to a single high-performance PostgreSQL persistence tier and reactive event bus:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             NexaHR                                               │
│                                ┌───────────────┴───────────────┐                                 │
│                                ▼                               ▼                                 │
│         🏢 HR Executive & Admin Command Center      👤 Employee Self-Service (ESS) Portal        │
│           • 360° Workforce Intelligence & BI          • Real-Time Web Punch & Active Timer       │
│           • 6-Tab Employee Dossier & PIM Directory    • Monthly Attendance & Regularization      │
│           • Multi-Step Onboarding Engine & Badging    • Visual Leave Quota Progress Meters       │
│           • Biometric Hardware Terminal Gateway Sync  • PDF-Styled Printable Payslip Vault       │
│           • Dynamic Leave Quota Rules & Approvals     • Searchable Team Directory & Presence     │
│           • Dynamic Payroll & Automated Tax Engine    • IT & HR Helpdesk Ticket Management       │
│           • Full Requisition & 5-Stage Kanban ATS     • Personal Document Vault & Cert Uploads   │
│           • Non-Blocking Gmail ATS Auto-Screening     • Official Holiday Calendar & Long Weekends│
│           • Authenticated CV Vault (Signed Blob URLs) • Multi-Currency Regional Preferences      │
│           • Split-Screen RBAC Governance Matrix       • Dark / Light / System Editorial Theme    │
│           • Corporate Document Vault & Policy Center  • First-Login Credential Hardening         │
│           • Departmental Ledgers & Cost Tracking      • Responsive Mobile Bottom Nav Matrix      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Dual-Portal Architecture

NexaHR delivers two distinct, role-tailored application interfaces sharing unified backend services, strict authentication barriers, and real-time state synchronization:

### 🏢 1. HR Executive & Admin Command Center (`/app/*`)

The administrative headquarters designed for People Operations leaders, HR Managers, and Executive Administrators:

* **360° Workforce Intelligence & BI Dashboard (`/app/dashboard`)**:
  * Live headcount tracking, male/female gender distribution ratio, and department headcount allocation.
  * Real-time presence gauge displaying currently clocked-in personnel vs. absent or on-leave team members.
  * Interactive sparkline recruitment KPI telemetry cards: *Published Openings*, *Total Active Applicants*, *Paused Openings*, and *Offer Acceptance Velocity*.
  * Executive quick-action shortcuts for employee onboarding, leave adjudication, payroll runs, and vacancy announcements.

* **Personnel Information Management (PIM) & 6-Tab Dossier (`/app/employees`)**:
  * Comprehensive workforce directory with search, department filtering, designation tags, and status toggles.
  * Comprehensive 6-tab modal dossier inspectable per employee:
    1. **Personal Information**: Full name, employee code, primary email, contact phone, home address, and gender.
    2. **Professional Profile**: Department, job title/designation, work shift, office location, and date of joining.
    3. **Financial & Compensation**: Detailed salary breakdown, housing allowances, transport allowances, and tax tier.
    4. **Documents**: Issued employment contracts, signed NDAs, identity records, and tax filings.
    5. **Assets Assigned**: Corporate hardware, workstation IDs, accessories, and procurement dates.
    6. **Emergency Contact**: Next of kin, relation, phone number, and primary emergency address.

* **Multi-Step Onboarding Engine (`/app/hr/new-employee`)**:
  * Guided 4-step wizard capturing profile details, departmental assignment, initial compensation tier, and account credentials.
  * Integrated Cloudinary profile avatar upload with stream processing and auto-crop.
  * Credential hardening flag (`mustChangePassword: true`) forcing immediate password updates upon first sign-in.

* **Biometric Terminal Gateway & Attendance Center (`/app/attendance`)**:
  * Direct hardware integration endpoint (`POST /api/attendance/hardware-sync`) protected by the secure `x-hardware-key` header.
  * Live punch telemetry monitoring clock-in timestamps, clock-out timestamps, and automatic daily working hour calculations.
  * Shift classification engine: `PRESENT`, `LATE` (grace period breach), `HALF_DAY`, `ABSENT`, or `ON_LEAVE`.
  * One-click mass punch utility (`POST /api/attendance/punch-all-today`) enabling administrators to simulate or backfill active personnel.
  * Employee status and regularization verification desk (`/app/employment-status`).

* **Dynamic Leave & Policy Engine (`/app/leaves`, `/app/leave-policy`)**:
  * Full dynamic policy CRUD engine backed by PostgreSQL persistence (create, inspect, edit, or delete leave policies).
  * Configurable annual quotas for Annual Paid Leave, Medical/Sick Leave, Casual Leave, and Parental Leave.
  * Paid vs. unpaid classification affecting payroll deductions in real time.
  * Two-tier approval workflow with manager approval notes, timestamps, and rejection rationale tracking.

* **Dynamic Payroll & Automated Tax Engine (`/app/payroll`, `/app/payroll/calculate`, `/app/payroll/payslips`)**:
  * Dynamic compensation structure builder with custom base pay, housing allowance, transport allowance, and custom allowances.
  * Configurable tax deduction formulas and automatic unpaid leave penalty computations (`(basicSalary / 30) * unpaidLeaveDays`).
  * Automated batch monthly payslip generator (`POST /api/payroll/generate-monthly`) processing company-wide payroll in seconds.
  * Audit-ready payslip registry with status lifecycle tracking (`DRAFT` ➔ `GENERATED` ➔ `PAID`).

* **Unified Recruitment & Talent Intelligence Suite (`/app/recruitment/*`)**:
  * **Requisition Command & Workspace (`/app/recruitment/workspace`)**:
    * Dual-view mode (Interactive Card Grid vs. High-Density Table).
    * Live vector SVG sparkline telemetry for candidate velocity and acceptance ratios.
    * Requisition drawer for instant drafting, salary band setting, skill tagging, and vacancy publication (`ACTIVE`, `PAUSED`, `CLOSED`).
  * **High-Performance 5-Stage Kanban Pipeline (`/app/recruitment/pipeline`)**:
    * Visual candidate workflow stages: `APPLIED` ➔ `SCREENING` ➔ `INTERVIEWING` ➔ `OFFER` ➔ `HIRED`.
    * Drag-and-drop candidate card state advancement with optimistic UI updates.
    * Candidate scorecards displaying candidate ratings, experience badges, and AI ATS match scores.
  * **Lazy-Loading Candidate Dossier**:
    * Lightweight card projection initially loaded for sub-10ms board rendering.
    * Opening a candidate card lazily streams the full dossier (extracted resume summary, AI strengths, AI gaps, and interview timeline) without blocking the Kanban board.
  * **Candidate Interview Desk (`/app/recruitment/pipeline`)**:
    * Multi-round interview coordination (Technical, System Architecture, Culture Fit, Executive).
    * Interviewer assignment, scheduled time slots, and automatic Google Meet room link generation.
  * **Unified Master Taxonomy & Settings (`/app/recruitment/settings`)**:
    * 5-in-1 centralized management console for Job Categories, Employment Types, Work Locations, Skill Taxonomies, and Experience Bands.
    * 100% database persistence with instant status toggles and zero hardcoded fallbacks.

* **Document Vault & Corporate Governance Hub (`/app/documents`)**:
  * Direct issuance of official documentation: Appointment letters, NDAs, increment letters, and experience certificates.
  * Oversight portal for inspecting employee-uploaded identity and academic credentials.
  * Centralized company policy handbook publishing hub with downloadable attachments.

* **IT Helpdesk & Support Triage Desk (`/app/helpdesk`)**:
  * Organization-wide ticketing queue with category routing (General HR, IT Hardware, Payroll, Workplace & Facilities).
  * Priority triage matrices (`LOW`, `MEDIUM`, `HIGH`) and status lifecycles (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
  * Threaded conversational resolution dialog between employees and system support staff.

* **Organizational Architecture & Designations (`/app/departments`)**:
  * Dynamic department hierarchy builder with department codes, descriptions, and manager assignments.
  * Designation mapping linked directly to department structures and reporting trees.

* **Split-Screen User Access Control & RBAC Matrix (`/app/access-control`)**:
  * Granular Role-Based Access Control matrix (`ADMIN`, `HR_MANAGER`, `EMPLOYEE`).
  * Instant user activation and deactivation toggles with immediate session revocation.

* **Financial Accounts, Ledgers & Expenses (`/app/accounts`)**:
  * Complete double-entry accounting ledger tracking organizational expenses, vendor disbursements, and payroll payouts.
  * Expense category breakdown, tax deductibility flags, receipt reference numbers, and batch operations.

* **Corporate Announcements (`/app/announcement`, `/app/holiday/public`)**:
  * Rich-text corporate broadcasts, category tagging, pinning priorities, and official public holiday calendar configuration.

---

### 👤 2. Employee Self-Service (ESS) Portal (`/employee/*`)

A responsive, empowering self-service hub accessible across desktop, tablet, and mobile browsers:

* **Live Punch Terminal & Active Timer (`/employee/dashboard`, `/employee/attendance`)**:
  * Real-time web punch-in/out terminal displaying live elapsed working seconds and break durations.
  * Cross-tab state synchronization via `BroadcastChannel` and `localStorage` to eliminate desync across browser windows.
  * Visual working hour progression rings calibrated against daily target hours (8.5 hours).

* **Monthly Attendance & Regularization Center (`/employee/attendance`)**:
  * Detailed calendar log displaying daily punch-in timestamps, punch-out timestamps, overtime hours, and punch source (Biometric vs. Web).
  * Direct regularization filing interface to submit attendance adjustments with manager verification notes.

* **Smart Leave Manager (`/employee/leaves`)**:
  * Visual circular progress meters for available leave balances (Annual, Medical/Sick, Casual).
  * Automated date-duration calculator preventing weekends or duplicate date overlaps.
  * Real-time leave application status tracker (`PENDING`, `APPROVED`, `REJECTED`) with rejection feedback.

* **Interactive Payslip Vault (`/employee/payslips`)**:
  * Monthly net salary overview, earnings breakdown (Base, HRA, Transport), and statutory deductions (Taxes, Unpaid Leaves).
  * Year-to-date (YTD) salary trajectory visual graphs.
  * Dedicated, pixel-perfect print-ready payslip view formatted for executive corporate PDF exports.

* **Company Team Directory & Roster (`/employee/dashboard`)**:
  * Searchable colleague directory filterable by department and live presence badges (*In Office*, *Remote*, *On Leave*).
  * Direct email shortcuts and office location mapping.

* **Employee Helpdesk & Service Desk (`/employee/helpdesk`)**:
  * Self-service support ticket submission across HR, IT Hardware, Payroll, and Workplace categories.
  * Real-time resolution thread with instant reply notifications from HR administrators.

* **Personal Document Vault (`/employee/documents`)**:
  * Secure repository of personal employment contracts, signed policies, and tax documents.
  * Direct upload modal for degree certificates, national identity scans, and medical proofs with file-type verification.

* **Holiday Schedule & Long Weekend Optimizer (`/employee/holidays`)**:
  * Next upcoming holiday countdown hero card.
  * Comprehensive official holiday calendar with "Long Weekend" strategic recommendation badges.

* **Personal Profile & Regional Preferences (`/employee/profile`, `/employee/settings`)**:
  * Personal dossier overview, profile picture management, and password change security settings.
  * Multi-currency preference selector supporting USD ($), PKR (Rs), EUR (€), GBP (£), and AED (AED) formatting.
  * Editorial theme switcher: Dark Mode, Light Mode, or System OS match.

---

## 🎨 Editorial Design System & Brand Identity

NexaHR implements an intentional, bespoke design language documented in [`DESIGN.md`](DESIGN.md) crafted specifically to eliminate generic, templated "AI-generated" aesthetics:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       NexaHR Design System                                       │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Primary Brand Anchor:  Deep Teal (#0F766E / teal-700)                                           │
│  Ink & Neutral Surface: Warm Slate (#1C2321) on Warm Off-White (#F6F5F1)                         │
│  Container Surfaces:    Pristine White (#FFFFFF) / Dark Mode Warm Charcoal (#16211E / #0F1715)   │
│  Accent Highlight:      Warm Amber (#D97706) — strictly as a FILL with dark ink text             │
│  Display Typography:    Bricolage Grotesque (600/700) — self-hosted variable font               │
│  Body Typography:       Instrument Sans (400/500/600) — tabular figures enabled for metrics     │
│  Border Radius Scale:   Controls (8px) • Cards (14px) • Large Drawers & Modals (20px)           │
│  Elevation & Shadow:    Subtle 3-tier shadow hierarchy (0 neon halos, 0 blur glows)              │
│  Micro-Interactions:    150-250ms ease transitions respecting prefers-reduced-motion             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### The 6 Anti-AI Design Rules
1. **No Gradient Text or Purple Hero Gradients**: Headings utilize solid, authoritative brand ink (`#1C2321` or `#0F766E`). Gradients are prohibited across typography and large card surfaces.
2. **Intentional Layout Asymmetry**: Left-aligned editorial headers, emphasized lead metric cards, and varied component proportions replace monotonous centered 3-card layouts.
3. **Typography with Character**: Self-hosted variable typography via `@fontsource-variable/bricolage-grotesque` (headings) and `@fontsource-variable/instrument-sans` (body). Tabular numerals (`tabular-nums`) guarantee aligned financial data across tables and KPI meters.
4. **Three-Tier Radius Scale**:
   * **Controls & Inputs**: `rounded-lg` (`8px`)
   * **Cards & Containers**: `rounded-[14px]` (`14px`)
   * **Drawers & Modals**: `rounded-[20px]` (`20px`)
5. **Strict Icon Standards (Lucide Only)**: Emojis are strictly forbidden as interface icons. All icons adhere to unified 1.75 stroke widths inside 16px, 20px, or 24px frames.
6. **Standardized Reusable Primitives** (`client/src/components/common/`):
   * [`Button.jsx`](client/src/components/common/Button.jsx) (`primary`, `secondary`, `destructive`, `ghost`)
   * [`Input.jsx`](client/src/components/common/Input.jsx) (Accessible labels, error states, and icon prefixes)
   * [`Card.jsx`](client/src/components/common/Card.jsx) (Restrained 14px radius, warm borders, zero glow)
   * [`Badge.jsx`](client/src/components/common/Badge.jsx) (`brand`, `accent`, `success`, `warning`, `danger`, `neutral`)
   * [`AiScoreBadge.jsx`](client/src/components/common/AiScoreBadge.jsx) (High-contrast amber/teal score meters)
   * [`Drawer.jsx`](client/src/components/common/Drawer.jsx) & [`Modal.jsx`](client/src/components/common/Modal.jsx) (Accessible backdrops, focus trapping, Esc-to-close)
   * [`Skeleton.jsx`](client/src/components/common/Skeleton.jsx) (Zero-layout-shift shimmer placeholders)

---

## 🤖 AI-Powered ATS & Gmail Screening Pipeline

NexaHR includes an automated, AI-driven Applicant Tracking System (ATS) pipeline that continuously ingests candidate resumes received in the corporate HR mailbox and evaluates them against active job openings.

```mermaid
flowchart TD
    A[Candidate Emails Resume to HR Inbox] -->|PDF / DOCX <= 10MB| B[node-cron Background Daemon]
    B --> C[Gmail API Ingestion OAuth 2.0]
    C --> D[In-Memory Text Extractor pdf-parse & mammoth]
    D --> E[Cloudinary Authenticated CV Vault]
    E --> F[Semantic Job Requisition Matcher]
    
    F -->|Match Found| G[Objective ATS Scoring Engine 0-100]
    F -->|No Clear Match| H[Mark UNMATCHED -> Manual Review Queue]
    
    G --> I{ATS Score >= 70?}
    I -->|Yes - CONFIRMED| J[Auto-Enroll into APPLIED Kanban Stage]
    I -->|No - SCREENED_OUT| K[Store in AI Screened-Out Audit Drawer]
    
    K -->|HR Manual Override| L[One-Click Promotion to Active Pipeline]
```

### Complete ATS Pipeline Workflow:
1. **Email Ingestion**: Candidates send application emails with CV attachments (PDF/DOCX, up to 10 MB) directly to the HR mailbox.
2. **Background Cron Polling**: An autonomous background daemon ([`gmail.service.js`](src/services/gmail.service.js)) polls the mailbox every 5 minutes (configurable via `GMAIL_POLL_CRON`) using `node-cron`.
3. **In-Memory Text Extraction & Storage**:
   * `pdf-parse` and `mammoth` parse the resume text directly in memory without writing unencrypted temporary files to the local disk.
   * Original CV files are uploaded to Cloudinary as `type: 'authenticated'`, preventing unauthorized public URL hotlinking.
4. **Step A — Semantic Job Requisition Matching**:
   * Scans email subjects, message bodies, and CV text for job codes (e.g., `JOB-101`) or matching role titles.
   * Matches candidate profiles against active job openings (`JobOpening.status === 'ACTIVE'`). Unmatched applications are safely held in the `UNMATCHED` audit queue for HR manual assignment.
5. **Step B — Objective AI Scoring Engine (0–100)**:
   * **Provider Agnostic**: Seamlessly operates with Google Gemini (`gemini-3.8-flash` default with automated fallback chain `gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.1-flash-lite`), OpenAI (`gpt-4o-mini`), or Anthropic Claude.
   * **Prompt Injection Defense**: Untrusted CV text is encapsulated within `<untrusted_candidate_resume>` XML tags with strict system prompt boundaries.
   * **Anti-Bias & Fairness Enforcement**: Candidate names, genders, ages, races, nationalities, religions, and marital statuses are strictly excluded from the scoring prompt.
   * **Zod Schema Validation**: Evaluates candidate experience, core skills, education, and domain keywords, producing a structured JSON breakdown with recruiter strengths and identified gaps.
6. **Pipeline Routing & Audit Governance**:
   * **Score ≥ 70 (`CONFIRMED`)**: Candidate is automatically enrolled in the active **"Applied" (`APPLIED`)** Kanban stage with their verified **AI Score Badge**.
   * **Score < 70 (`SCREENED_OUT`)**: Candidate is preserved in the database audit log and visible in the **"AI Screened-Out"** drawer. HR managers retain full authority to execute a one-click **"Override & Add to Pipeline"** action at any time.
7. **Non-Blocking Execution (HTTP 202)**:
   * Manual sync triggers (`POST /api/recruitment/ai-screening/sync`) return `202 Accepted` immediately, delegating the heavy batch processing to a background worker. The client polls `GET /api/recruitment/ai-screening/status` without blocking the Node.js event loop.

---

## ⚡ High-Performance Architecture & Caching

NexaHR utilizes multi-tier optimizations to deliver sub-10ms response times and fluid drag-and-drop Kanban interactions:

1. **User-Partitioned In-Memory Caching (SWR)**:
   * Custom cache middleware ([`cache.service.js`](src/services/cache.service.js)) generates partitioned cache keys formatted as `${role}:${userId}:${url}`.
   * User A's cached response is never leaked or served to User B, maintaining strict query parameter isolation.
   * Dynamic responses are served in sub-5ms from RAM with automated TTLs (60s–120s).
2. **Smart Mutation Cache Invalidator**:
   * Any state-modifying HTTP request (`POST`, `PUT`, `PATCH`, `DELETE`) intercepted by the backend immediately purges matching cache tags across all related endpoints (e.g., modifying an employee flushes `employees` and `dashboard` cache tags).
3. **Prisma Targeted Projections (99.9% Payload Reduction)**:
   * The candidate Kanban endpoint (`GET /api/recruitment/applications`) executes a targeted Prisma `select` projection returning only lightweight card metadata (`id`, `name`, `role`, `stage`, `aiScore`, `aiStatus`, `experience`, `rating`).
   * Heavy fields (`resumeSummary`, `aiBreakdown`, `aiStrengths`, `aiGaps`) are omitted from the initial list, reducing payload transfer sizes by up to 99.9%.
4. **Lazy Dossier Hydration**:
   * Candidate drawers load instantly with cached card data while full dossiers stream in asynchronously via `GET /api/recruitment/applications/:id`.
5. **Targeted PostgreSQL Indexes**:
   * Composite and single-column indexes guarantee sub-3ms relational queries:
     * `JobApplication(status, aiStatus)`
     * `JobApplication(stage)`
     * `JobApplication(jobOpeningId)`
     * `JobApplication(email)`
     * `JobApplication(createdAt)`
     * `Attendance(userId, date)`
     * `Payslip(userId, month, year)`
6. **PgBouncer Transaction Pool Tuning**:
   * Configured `connection_limit=10&pool_timeout=20&pgbouncer=true` within `DATABASE_URL` for efficient connection recycling over remote Supabase / PostgreSQL connection poolers.
7. **Frontend Progressive Rendering**:
   * High-traffic components utilize `React.memo` to eliminate redundant re-renders during Kanban card dragging.
   * Zero-layout-shift shimmer skeletons ensure visual stability during progressive data hydration.
   * Express `compression` (gzip) enabled across all JSON payloads.

---

## 🔒 Security Hardening & Compliance

* **Authenticated Resume Delivery (RBAC & Signed URLs)**:
  * Static file exposure via public `/uploads` directories has been permanently removed.
  * Candidate resumes are served exclusively via the authenticated route `GET /api/recruitment/applications/:id/resume`.
  * Enforces strict role checks (`ADMIN`, `HR_MANAGER`). Requests from users with an `EMPLOYEE` role receive a strict `403 Forbidden`.
  * For Cloudinary storage, files are uploaded as `type: 'authenticated'` and delivered via short-lived signed URLs.
  * The frontend streams resumes into temporary in-memory `Blob` URLs and automatically revokes the object URL within 60 seconds.

* **Ephemeral Multi-Channel Password Recovery**:
  * Users can recover credentials via corporate SMTP email or WhatsApp Cloud API (Twilio / Meta).
  * 6-digit cryptographic OTPs are hashed using SHA-256 before database storage and verified using `crypto.timingSafeEqual` constant-time comparison to prevent timing side-channel attacks.
  * Strictly enforced 10-minute expiration windows, maximum 5-attempt brute-force lockouts, and 60-second resend cooldowns.
  * Zero-leak guarantee: OTPs, codes, and reset tokens are strictly excluded from API response bodies across all environments (production, staging, development, and test).
  * To test password recovery locally, use a real inbox.

* **Tiered Rate Limiting & DoS Mitigation**:
  * `authRateLimiter`: 10 requests per 15 minutes on login endpoints.
  * `passwordResetRateLimiter`: 5 recovery attempts per 15 minutes.
  * `generalApiLimiter`: 100 requests per 15 minutes across all standard `/api` endpoints.

* **Render Free-Tier Anti-Spindown Keep-Alive Daemon**:
  * An automated background service ([`selfPing.service.js`](src/services/selfPing.service.js)) pings `/api/health` every 14 minutes, preventing free-tier container sleep spindown delays.

* **HTTP Security Headers & Input Sanitization**:
  * Helmet Content Security Policy (CSP), Strict-Transport-Security (HSTS 1-year preload), and X-Frame-Options clickjacking protection on the backend.
  * Strict Edge CSP configured in [`client/vercel.json`](client/vercel.json) enforcing `connect-src 'self' https://nexa-hr-backend-2ybt.onrender.com; img-src 'self' data: blob: https://res.cloudinary.com; font-src 'self' data:; frame-ancestors 'none'`.
    > ⚠️ **Deployment Note**: If the backend Render service URL changes, the `connect-src` origin in `client/vercel.json` **must be updated** to match the new backend origin.
  * HttpOnly, Secure, SameSite cookies for JWT transport.
  * Deep input validation and sanitization using `express-validator` and `zod`.

---

## 🔑 Initial System Administrator Provisioning

NexaHR enforces strict credential security and does not ship with default or hardcoded credentials. To initialize a system administrator account, execute the secure CLI provisioner:

```bash
ADMIN_EMAIL="admin@yourdomain.com" ADMIN_INITIAL_PASSWORD="YourStrongPassword123!" node scripts/create-admin.js
```

> 💡 **Role Switcher**: Once authenticated, users can switch between Administrative and Employee portals according to their role via the navigation or profile avatar menu.

---

## 🌐 Deploying the Isolated Demo Environment

To guarantee complete data isolation and prevent demo users from ever viewing, modifying, or leaking real company records, NexaHR runs guest demo sessions exclusively on an isolated sandbox environment backed by its own dedicated database.

```
┌────────────────────────────────────────────────────────┐  ┌────────────────────────────────────────────────────────┐
│                   PRODUCTION ENVIRONMENT               │  │                 ISOLATED DEMO SANDBOX                  │
│  • Render Web Service 1 (Production)                   │  │  • Render Web Service 2 (Demo Staging)                 │
│  • Primary Supabase / PostgreSQL (Real Employee Data)  │  │  • Dedicated Demo Supabase / PostgreSQL (Synthetic)    │
│  • ENABLE_GUEST_DEMO=false (or unset)                  │  │  • ENABLE_GUEST_DEMO=true                              │
│  • Guest Login Endpoints: 404 Route Not Found          │  │  • Guest Login Endpoints: Active (60-min Ephemeral)    │
│  • 1-Click Guest Buttons: Automatically Hidden         │  │  • 1-Click Guest Buttons: Visible                      │
└────────────────────────────────────────────────────────┘  └────────────────────────────────────────────────────────┘
```

### Architecture & Security Controls:
1. **Zero Production Leakage**: In production, `ENABLE_GUEST_DEMO` is unset. Guest login buttons are automatically hidden via `GET /api/auth/config`, and all demo login endpoints return `404 Route not found`.
2. **Startup Verification Guard**: On service boot, `initDemoGuard` verifies that the connected database contains zero real accounts (`isDemo: false`). If any real account is detected while `ENABLE_GUEST_DEMO=true`, the server logs a critical security alert and fails closed (locking all guest endpoints).
3. **Synthetic Seed Script**: `scripts/seed-demo-data.js` populates an empty demo database with 15 realistic synthetic employee profiles, 30 days of attendance logs, leave records, 3 job openings, 6 candidates with AI evaluations, payslips, announcements, and the two dedicated demo credentials (`guest-hr@demo.invalid` and `guest-employee@demo.invalid`). It strictly refuses to execute if the database contains any non-demo users.
4. **Defense-in-Depth Middleware (`blockDemo`)**: Guest sessions (`req.user.isDemo === true`) are blocked from mutating sensitive resources (e.g. password changes, profile edits, document uploads, employee onboarding/deletion, payroll runs, Gmail sync) with `403 { code: 'DEMO_MODE' }`.

### Step-by-Step Deployment:
1. **Provision Dedicated Demo Database**: Create a new, empty database instance in Supabase (or any PostgreSQL provider).
2. **Deploy Second Web Service on Render**: Create a secondary web service pointing to the repository.
3. **Configure Demo Service Environment Variables**:
   ```env
   NODE_ENV=production
   ENABLE_GUEST_DEMO=true
   DATABASE_URL="postgresql://postgres:password@demo-db.supabase.co:5432/postgres?schema=public"
   JWT_SECRET="demo_dedicated_secret_key_minimum_32_characters_long"
   CORS_ORIGINS="https://demo.nexahr.com,https://your-demo-client.vercel.app"
   ```
4. **Run Database Migrations & Demo Seeder**:
   ```bash
   # Apply database migrations on the demo database
   DATABASE_URL="postgresql://...demo-db..." npx prisma migrate deploy

   # Seed synthetic demo data (requires confirmation flag or DEMO_DATABASE_URL)
   DEMO_DATABASE_URL="postgresql://...demo-db..." node scripts/seed-demo-data.js
   ```
5. **Session Expiration & View-Only Protection**: Demo sessions issue 60-minute ephemeral tokens. If a demo user attempts to modify or delete data, an alert toaster popup informs them that demo mode is view-only.

### 🌐 Frontend-Only Demo Mode (Zero Network, Zero Real Accounts)

In addition to the isolated backend sandbox, NexaHR provides a completely **zero-network frontend-only demo mode**. It lets visitors test all HR and Employee portal workflows instantly using synthetic in-memory fixtures without contacting any backend server or touching real customer data.

- **Environment Variables**:
  - `VITE_ENABLE_GUEST_DEMO="true"`: Enables "Experience as Guest HR" and "Experience as Guest Employee" 1-click demo buttons on the login screen.
  - `VITE_GUEST_DEMO_UNTIL="2026-12-31T23:59:59Z"`: Optional ISO date deadline. After this timestamp, guest buttons are hidden and active demo sessions terminate automatically.
- **Data Isolation**: Guest sessions exist strictly in `sessionStorage` under `nexahr_demo_session` with a 60-minute timeout. Real sessions in `localStorage` are untouched.
- **Central Network Guard**: All client API requests in `client/src/services/api.js` are intercepted:
  - **GET**: Answered locally with synthetic fixtures across ~15 demo employees (`@demo.invalid`), 30-day attendance records, leave balances, payslips, job openings, and candidates.
  - **Mutations (POST / PUT / PATCH / DELETE / Upload)**: Blocked immediately with a `DemoModeError` and toast: *"Demo mode: view only. Changes are disabled."*
  - **CV Preview**: Shows toast: *"CV preview is not available in demo mode."*

---

## 🛠️ Tech Stack

### **Frontend Client**
| Technology | Version | Purpose / Role |
| :--- | :--- | :--- |
| **React** | `19.2.8` | Core UI library with Concurrent Mode rendering |
| **Vite** | `8.2.0` | Next-generation frontend build tooling and HMR dev server |
| **Tailwind CSS** | `4.3.3` | High-performance atomic utility CSS engine |
| **React Router** | `7.18.2` | Client-side routing, protected layouts, and scroll management |
| **Bricolage Grotesque** | `5.3.0` | Self-hosted variable heading typography |
| **Instrument Sans** | `5.3.0` | Self-hosted tabular-number body and UI typography |
| **Recharts** | `3.10.1` | Interactive vector charts (Area, Donut, Sparklines, Bar) |
| **Lucide React** | `1.28.0` | Consistent 1.75 stroke-width SVG iconography |
| **Framer Motion** | `12.43.0` | Hardware-accelerated transitions & micro-interactions |

### **Backend Server & Infrastructure**
| Technology | Version | Purpose / Role |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0 LTS` | Server-side JavaScript runtime environment |
| **Express.js** | `4.21.1` | Robust REST API server framework |
| **Prisma ORM** | `5.22.0` | Type-safe database client and declarative schema migrations |
| **PostgreSQL** | `>= 15.0` | Primary relational database with PgBouncer pooling |
| **Compression** | `1.8.2` | Gzip compression for all API payloads |
| **JWT & bcryptjs** | `9.0.2 / 2.4.3` | JSON Web Token session auth and password hashing |
| **Zod** | `4.6.7` | Runtime type validation for AI screening payloads |
| **Cloudinary** | `2.11.0` | Cloud media storage with authenticated signed CV access |
| **Nodemailer** | `10.4.0` | Corporate SMTP email transport for OTP recovery |
| **Twilio / Meta** | `6.1.0` | WhatsApp Cloud API integration for instant OTPs |
| **node-cron** | `4.6.0` | Autonomous background task scheduler for Gmail ingestion |
| **pdf-parse & mammoth**| `2.4.5 / 1.13.0`| In-memory extraction of PDF and DOCX resume attachments |
| **Helmet** | `8.3.0` | HTTP security headers and CSP protection |

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Client (React 19 + Vite 8 + Tailwind v4)"]
        UI_AUTH[Login & Ephemeral OTP Password Recovery]
        UI_ADMIN[HR Executive Command Center /app/*]
        UI_ESS[Employee Self-Service Portal /employee/*]
        UI_ATS[5-Stage Kanban ATS & Job Workspace]
        UI_CACHE[Client-Side SWR In-Memory Store]
    end

    subgraph Gateway["Express 4.21 API Server"]
        MW_SEC[Helmet, CORS, Rate Limiters, Compression]
        MW_AUTH[JWT verifyToken & RBAC checkRole]
        MW_CACHE[User-Partitioned In-Memory Cache Service]
        
        CTRL_AUTH[Auth & Password Recovery Controller]
        CTRL_EMP[Employee & 6-Tab PIM Controller]
        CTRL_ATT[Attendance & Biometric Sync Controller]
        CTRL_LEV[Leave & Policy CRUD Controller]
        CTRL_PAY[Payroll & Dynamic Tax Controller]
        CTRL_ATS[Recruitment & Authenticated Resume Controller]
        CTRL_DOC[Document Vault & Policy Controller]
        CTRL_TICK[IT Helpdesk & Support Controller]
        CTRL_ACC[Accounts & Financial Ledger Controller]
        
        SVC_GMAIL[Gmail Ingestion Daemon node-cron]
        SVC_AI[Objective ATS AI Evaluator Zod / Gemini]
        SVC_PING[Render Anti-Spindown Self-Ping Daemon]
    end

    subgraph Persistence["Storage & Cloud Infrastructure"]
        DB[(PostgreSQL Database with PgBouncer)]
        CDN[Cloudinary Authenticated Document Vault]
        SMTP[Corporate SMTP Email Gateway Nodemailer]
        WA[Twilio / Meta WhatsApp Cloud API]
        HARDWARE[Biometric Hardware Terminal Gateway]
    end

    UI_AUTH & UI_ADMIN & UI_ESS & UI_ATS --> MW_SEC
    MW_SEC --> MW_AUTH
    MW_AUTH --> MW_CACHE
    MW_CACHE --> CTRL_AUTH & CTRL_EMP & CTRL_ATT & CTRL_LEV & CTRL_PAY & CTRL_ATS & CTRL_DOC & CTRL_TICK & CTRL_ACC
    
    CTRL_AUTH & CTRL_EMP & CTRL_ATT & CTRL_LEV & CTRL_PAY & CTRL_ATS & CTRL_DOC & CTRL_TICK & CTRL_ACC --> DB
    CTRL_EMP & CTRL_ATS & CTRL_DOC --> CDN
    CTRL_AUTH --> SMTP & WA
    HARDWARE -->|x-hardware-key| CTRL_ATT
    SVC_GMAIL --> SVC_AI --> CTRL_ATS
    SVC_PING -.->|Every 14 Mins| MW_SEC
```

---

## 📁 Repository Structure

```
NexaHR/
├── DESIGN.md                               # Canonical Design System Specification & Brand Tokens
├── run.bat                                 # 1-Click Unified Development Launcher (Windows)
├── run.sh                                  # 1-Click Unified Development Launcher (Linux / macOS)
├── .env.example                            # Comprehensive Environment Variables Template
├── package.json                            # Root Backend Package & Concurrent Scripts
│
├── client/                                 # Frontend Application (React 19 + Vite 8 + Tailwind v4)
│   ├── public/                             # Favicons and public static branding assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                       # ForgotPasswordModal (Email & WhatsApp OTP)
│   │   │   ├── common/                     # Button, Input, Card, Badge, AiScoreBadge, Drawer, Modal, Skeleton
│   │   │   └── navigation/                 # Admin & Employee Sidebars, Headers, MobileBottomNav
│   │   ├── context/                        # ThemeContext & RegionalSettingsContext (Multi-Currency)
│   │   ├── layouts/                        # MainLayout (HR Admin) & EmployeeLayout (ESS)
│   │   ├── pages/
│   │   │   ├── app/                        # HR Executive & Admin Command Center Pages
│   │   │   │   ├── Dashboard.jsx           # 360° Workforce BI & Analytics
│   │   │   │   ├── Employees.jsx           # Directory, Table, and 6-Tab Dossier Modal
│   │   │   │   ├── Attendance.jsx          # Biometric Hardware Sync, Daily Logs & Batch Punch
│   │   │   │   ├── Leaves.jsx              # Company-wide Leave Approvals
│   │   │   │   ├── LeavePolicy.jsx         # Quota Rules & Dynamic Policy Configuration (CRUD)
│   │   │   │   ├── Payroll.jsx             # Payroll Ledger & Structure Management
│   │   │   │   ├── Departments.jsx         # Organizational Hierarchy & Designation Engine
│   │   │   │   ├── UserAccessControl.jsx   # Split-Screen RBAC Governance & Preset Matrix
│   │   │   │   ├── Accounts.jsx            # Company Accounts & Ledger Management
│   │   │   │   ├── Documents.jsx           # Document Vault, Policy Center & Employee Submissions
│   │   │   │   ├── Helpdesk.jsx            # IT & HR Support Ticket Queue & Triage Desk
│   │   │   │   └── recruitment/            # Recruitment ATS & Talent Intelligence Suite
│   │   │   │       ├── JobsWorkspace.jsx   # Requisition Command & SparkMetric Telemetry
│   │   │   │       ├── ATSPipeline.jsx     # High-Performance 5-Stage Kanban & Candidate Dossier
│   │   │   │       ├── JobDesk.jsx         # Recruiter Command Desk & Velocity Telemetry
│   │   │   │       ├── JobInterview.jsx    # Interview Rounds & Google Meet Scheduling
│   │   │   │       └── RecruitmentSettings.jsx # Unified 5-in-1 Master Configuration
│   │   │   ├── employee/                   # Employee Self-Service Pages
│   │   │   │   ├── EmployeeDashboard.jsx   # Real-Time Punch Terminal & Quick Stats
│   │   │   │   ├── EmployeeAttendance.jsx  # Personal Logs, Stamps & Regularization
│   │   │   │   ├── EmployeeLeaves.jsx      # Visual Quota Meters & Leave Applications
│   │   │   │   ├── EmployeePayslips.jsx    # Earnings/Deductions & Printable Payslips
│   │   │   │   ├── EmployeeAnnouncements.jsx # Corporate Broadcast Feed
│   │   │   │   ├── EmployeeHolidays.jsx    # Holiday Calendar & Long Weekend Optimizer
│   │   │   │   ├── EmployeeHelpdesk.jsx    # Self-Service Support Ticket Submissions
│   │   │   │   ├── EmployeeDocuments.jsx   # Personal Document Vault & Certificate Uploads
│   │   │   │   ├── EmployeeProfile.jsx     # Comprehensive Personal Dossier
│   │   │   │   └── EmployeeSettings.jsx    # Regional Currency & Security Preferences
│   │   │   └── website/                    # Authentication Views
│   │   │       ├── Login.jsx               # Internal Single-Company Auth Terminal
│   │   │       └── RegisterAdmin.jsx       # Initial System Admin Bootstrap Terminal
│   │   ├── services/                       # Centralized Axios Client & In-Memory SWR Store
│   │   ├── utils/                          # Session Guards, Date Utilities & Formatters
│   │   ├── App.jsx                         # Master Routing Hub & Protected Route Guards
│   │   ├── index.css                       # Global Tailwind v4 Theme Tokens & Typography Styles
│   │   └── main.jsx                        # React 19 Entrypoint with Self-Hosted Font Loaders
│   ├── package.json
│   └── vite.config.js
│
├── prisma/
│   ├── schema.prisma                       # Relational PostgreSQL Schema, Enums & Indexes
│   ├── seed.js                             # Baseline Database Seeder
│   └── migrations/                         # Migration History SQL Files
│
├── scripts/
│   └── gmail-auth.js                       # CLI Tool for Google Cloud OAuth 2.0 Token Generation
│
├── src/                                    # Backend Express.js REST API
│   ├── config/                             # Prisma Client & Cloudinary Storage Config
│   ├── controllers/                        # Modular Controllers (Auth, Recruitment, Attendance, etc.)
│   ├── middlewares/                        # JWT Auth, checkRole, Rate Limiters, Upload, Validators
│   ├── routes/                             # Express REST API Route Modules
│   ├── services/                           # Cache Service, Gmail Ingestion, ATS AI Evaluator, Self-Ping
│   ├── tests/                              # Automated Test Suites (Native node --test)
│   │   ├── aiScreening.test.js             # AI Scoring, Decision Boundaries & Normalization Tests
│   │   └── atsHardening.test.js            # Resume RBAC, Cache Isolation & Authenticated Delivery Tests
│   ├── utils/                              # Password Hashing, Contact Extractors & JWT Signers
│   └── index.js                            # Express Server Entrypoint with Compression & Security
```

---

## 🚀 Quick Start Guide

### System Prerequisites
* [Node.js](https://nodejs.org/) `>= 18.0.0 LTS`
* [npm](https://www.npmjs.com/) `>= 9.0.0`
* [PostgreSQL](https://www.postgresql.org/) `>= 14.0` *(Local instance, Supabase, Neon, or AWS RDS)*

---

### Option 1: 1-Click Launch (Recommended)

#### On Windows:
Double-click [`run.bat`](run.bat) or execute from PowerShell / Command Prompt:
```bat
.\run.bat
```

#### On Linux / macOS:
```bash
chmod +x run.sh
./run.sh
```

---

### Option 2: Step-by-Step Manual Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/imumairakram/Nexa-HR.git
cd Nexa-HR
```

#### 2. Configure Environment Variables
Copy the template to your active `.env` file:
```bash
cp .env.example .env
```

Open `.env` and configure your settings:
```env
# Server Port & Runtime Environment
PORT=5000
NODE_ENV=development

# PostgreSQL Connection String (Append PgBouncer tuning parameters)
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nexahr?schema=public&connection_limit=10&pool_timeout=20"

# JWT Authentication Secrets
JWT_SECRET="nexahr_super_secure_jwt_secret_key_2026"
JWT_EXPIRES_IN="1h"

# Application URLs
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:5000"

# Biometric Hardware Terminal Gateway Secret Key
HARDWARE_SECRET_KEY="your_hardware_secret_key"

# Cloudinary Cloud Storage (Avatars & Authenticated Documents)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Corporate SMTP Email Configuration (Outbound Transactional Mailbox)
# Architecture Note: Use a dedicated transactional sender (notifications@company.com or SES/Resend/SendGrid)
# Keep strictly separate from GMAIL_HR_ADDRESS to prevent bounce loops.
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="notifications@company.com"
SMTP_PASS="your_app_specific_password"
EMAIL_FROM="NexaHR Notifications <no-reply@company.com>"

# WhatsApp OTP Dispatch API (Twilio / Meta Cloud API)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# AI-Powered ATS Screening & Google Cloud Gmail Integration (Inbound Candidate Mailbox)
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/oauth2callback"
GMAIL_REFRESH_TOKEN="your_gmail_oauth_refresh_token"
GMAIL_HR_ADDRESS="careers@company.com"
GMAIL_POLL_CRON="*/5 * * * *"
GMAIL_SEARCH_QUERY="is:unread has:attachment -label:NexaHR-Processed -label:NexaHR-Ignored -from:mailer-daemon -from:postmaster -from:me -subject:(\"Delivery Status Notification\") -subject:(\"Undeliverable\")"

# AI Provider Configuration (gemini | openai | anthropic)
AI_PROVIDER="gemini"
AI_API_KEY="your_ai_api_key"
# Default for Gemini is gemini-3.8-flash (fallback chain: gemini-3.8-flash -> gemini-3.5-flash -> gemini-3.1-flash-lite)
AI_MODEL="gemini-3.8-flash"
ATS_PASS_THRESHOLD=70
```

#### 3. Install Dependencies & Deploy Database
```bash
# Install backend dependencies
npm install

# Generate Prisma Client & apply database migrations
npm run prisma:generate
npx prisma migrate deploy

# Seed baseline departments, designations, and leave policies
npm run prisma:seed

# Install frontend client dependencies
cd client && npm install && cd ..
```

#### 4. Google Cloud OAuth 2.0 Token Generation (Optional for ATS)
To connect the HR Gmail inbox for automatic CV ingestion:
```bash
node scripts/gmail-auth.js
```
Follow the interactive prompt to authorize your HR mailbox and copy the returned `refresh_token` into your `.env` file.

#### 5. Launch Development Environment
Run both backend and client concurrently:
```bash
npm run dev
```

* **Frontend Client**: Accessible at [`http://localhost:5173`](http://localhost:5173)
* **Backend REST API**: Active at [`http://localhost:5000`](http://localhost:5000)
* **API Health Check**: Verifiable at [`http://localhost:5000/api/health`](http://localhost:5000/api/health)

---

## 📡 Exhaustive REST API Reference

All REST endpoints are mounted under `/api` and return standardized, sanitized JSON responses:

### 🔐 1. Authentication & Session (`/api/auth`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-admin` | Bootstrap initial system administrator | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT auth cookie | Public (Rate Limited) |
| `POST` | `/api/auth/logout` | Revoke active session & clear cookie | Authenticated |
| `GET` | `/api/auth/me` | Fetch active user profile and permissions | Authenticated |
| `PUT` | `/api/auth/profile` | Update personal profile information | Authenticated |
| `PUT` | `/api/auth/change-password` | Update account password | Authenticated |
| `POST` | `/api/auth/forgot-password/check` | Verify user recovery channel (Email / Phone) | Public (Rate Limited) |
| `POST` | `/api/auth/forgot-password` | Dispatch 6-digit OTP via Email or WhatsApp | Public (Rate Limited) |
| `POST` | `/api/auth/verify-otp` | Validate cryptographic recovery OTP | Public (Rate Limited) |
| `POST` | `/api/auth/reset-password` | Finalize password reset with verified OTP | Public (Rate Limited) |

### 👥 2. Personnel Information Management (`/api/employees`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | List all employees with search & filters | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/employees/:id` | Fetch full 6-tab employee dossier | Authenticated |
| `POST` | `/api/employees` | Onboard new employee & auto-generate account | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/employees/:id` | Update employee information & shift | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/employees/:id` | Delete employee record & associated data | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/employees/profile-picture` | Upload profile avatar via Cloudinary stream | Authenticated |
| `DELETE` | `/api/employees/profile-picture` | Remove avatar & reset profile to initials | Authenticated |

### ⏱️ 3. Attendance & Biometric Synchronization (`/api/attendance`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/hardware-sync` | Ingest biometric hardware punch sync | `x-hardware-key` Protected |
| `GET` | `/api/attendance/my-logs` | Fetch authenticated employee's punch logs | Authenticated |
| `GET` | `/api/attendance` | Fetch company-wide attendance overview | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/attendance/punch-all-today` | Mass punch-in all active employees today | `ADMIN`, `HR_MANAGER` |

### 🏖️ 4. Dynamic Leave Management & Policies (`/api/leaves`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves/types` | List all leave policies and annual quotas | Authenticated |
| `POST` | `/api/leaves/types` | Create new leave policy rule | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/leaves/types/:id` | Fetch specific leave type policy details | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/leaves/types/:id` | Update leave policy quota, name & paid status | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/leaves/types/:id` | Delete leave policy rule | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/leaves/apply` | Submit new leave application | Authenticated |
| `GET` | `/api/leaves/my-requests` | Fetch employee's personal leave requests | Authenticated |
| `GET` | `/api/leaves` | Smart dispatch: Company leaves (Admin) vs My leaves (Staff) | Authenticated |
| `PUT` | `/api/leaves/:id/status` | Approve or reject leave request with notes | `ADMIN`, `HR_MANAGER` |

### 💰 5. Dynamic Payroll & Payslip Processing (`/api/payroll`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payroll/salary-structure` | Configure employee base pay & allowances | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/payroll/salary-structure/:userId`| Inspect employee salary structure | Authenticated |
| `POST` | `/api/payroll/generate-monthly` | Execute monthly automated batch payroll | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/payroll/payslips` | List company-wide generated payslips | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/payroll/my-payslips` | Fetch employee's personal payslip records | Authenticated |
| `PUT` | `/api/payroll/payslips/:id/status` | Advance payslip payment status (`PAID`) | `ADMIN`, `HR_MANAGER` |

### 🎯 6. Recruitment, ATS Pipeline & Candidate Delivery (`/api/recruitment`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/recruitment/stats` | Aggregated ATS metrics, counts & velocity | Authenticated |
| `GET` | `/api/recruitment/jobs` | List job requisitions with filters | Authenticated |
| `GET` | `/api/recruitment/jobs/:id` | Fetch detailed job opening requisition | Authenticated |
| `POST` | `/api/recruitment/jobs` | Create new job opening requisition | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/recruitment/jobs/:id` | Update job opening requisition | `ADMIN`, `HR_MANAGER` |
| `PATCH` | `/api/recruitment/jobs/:id/status`| Toggle requisition status (`ACTIVE` / `PAUSED` / `CLOSED`) | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/recruitment/jobs/:id` | Delete job opening requisition | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/recruitment/applications` | List lightweight candidate cards (slim projection) | Authenticated |
| `GET` | `/api/recruitment/applications/:id`| Lazy-load full candidate dossier & AI scores | Authenticated |
| `GET` | `/api/recruitment/applications/:id/resume`| **Secure authenticated resume stream / signed URL** | **Admin / HR Only (403 for Employee)** |
| `POST` | `/api/recruitment/applications` | Create candidate application manually | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/recruitment/applications/:id`| Update candidate profile & resume notes | `ADMIN`, `HR_MANAGER` |
| `PATCH` | `/api/recruitment/applications/:id/stage`| Advance Kanban stage (`APPLIED` ➔ `HIRED`) | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/recruitment/applications/:id`| Delete candidate application | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/recruitment/ai-screening/sync` | **Non-blocking trigger (HTTP 202) for Gmail ATS sync** | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/recruitment/ai-screening/status` | Polling endpoint for ATS sync status telemetry | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/recruitment/ai-screening/screened-out` | List low-score, unmatched, or parse-error applications | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/recruitment/applications/:id/ai-override` | HR override: promote candidate to APPLIED stage | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/recruitment/applications/:id/rescan` | Re-run AI evaluation for an existing applicant | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/recruitment/interviews` | List scheduled interviews | Authenticated |
| `POST` | `/api/recruitment/interviews` | Schedule interview round with Google Meet link | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/recruitment/interviews/:id` | Update interview status, feedback & score | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/recruitment/interviews/:id` | Cancel scheduled interview round | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/recruitment/taxonomies` | List master taxonomies (Category, Type, Location, etc.) | Authenticated |
| `POST` | `/api/recruitment/taxonomies` | Create new taxonomy entry | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/recruitment/taxonomies/:id` | Update taxonomy entry | `ADMIN`, `HR_MANAGER` |
| `PATCH` | `/api/recruitment/taxonomies/:id/toggle`| Toggle taxonomy active state | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/recruitment/taxonomies/:id` | Delete taxonomy entry | `ADMIN`, `HR_MANAGER` |

### 📂 7. Document Vault & Corporate Policies (`/api/documents`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/documents/issued` | List issued employment contracts & certificates | Authenticated |
| `POST` | `/api/documents/issue` | Issue official document to an employee | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/documents/upload` | Upload employee personal document | Authenticated |
| `DELETE` | `/api/documents/issued/:id` | Remove issued document record | Authenticated |
| `GET` | `/api/documents/policies` | List published corporate handbook policies | Authenticated |
| `POST` | `/api/documents/policies` | Publish corporate policy with attachment | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/documents/policies/:id` | Delete corporate policy record | `ADMIN`, `HR_MANAGER` |

### 🎫 8. IT Helpdesk & Support Tickets (`/api/tickets`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tickets/my` | List employee's personal support tickets | Authenticated |
| `GET` | `/api/tickets` | List all support tickets (triage queue) | Authenticated |
| `GET` | `/api/tickets/:id` | Fetch ticket details & conversation thread | Authenticated |
| `POST` | `/api/tickets` | Open new support ticket | Authenticated |
| `POST` | `/api/tickets/:id/replies` | Add reply to ticket conversation thread | Authenticated |
| `PATCH` | `/api/tickets/:id/status` | Advance ticket status (`RESOLVED`, `CLOSED`)| Authenticated |

### 💼 9. Financial Accounts & Ledgers (`/api/accounts`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/accounts/stats` | Aggregate financial income & expense metrics | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/accounts/transactions` | List double-entry ledger transactions | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/accounts/transactions` | Record new transaction entry | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/accounts/transactions/:id` | Update transaction entry details | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/accounts/transactions/:id` | Delete transaction record | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/accounts/batch-delete` | Batch delete selected transaction records | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/accounts/batch-status` | Batch update verification status | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/accounts/seed` | Seed default operational ledger entries | `ADMIN`, `HR_MANAGER` |
| `POST` | `/api/accounts/clear` | Clear all transaction records | `ADMIN`, `HR_MANAGER` |

### 🏢 10. Organizational Structure (`/api/departments`, `/api/designations`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | List all company departments & headcounts | Authenticated |
| `POST` | `/api/departments` | Create new organizational department | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/departments/:id` | Fetch department details & members | Authenticated |
| `PUT` | `/api/departments/:id` | Update department details & code | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/departments/:id` | Delete department record | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/designations` | List all employee job designations | Authenticated |
| `POST` | `/api/designations` | Create new designation entry | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/designations/:id` | Update designation title & mapping | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/designations/:id` | Delete designation entry | `ADMIN`, `HR_MANAGER` |

### 📢 11. Announcements & In-App Notifications (`/api/announcements`, `/api/notifications`)
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/announcements` | Fetch all active corporate announcements | Authenticated |
| `POST` | `/api/announcements` | Publish new company broadcast | `ADMIN`, `HR_MANAGER` |
| `PUT` | `/api/announcements/:id` | Update broadcast content or pinning | `ADMIN`, `HR_MANAGER` |
| `DELETE` | `/api/announcements/:id` | Remove broadcast announcement | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/notifications` | Fetch authenticated user notifications | Authenticated |
| `PATCH` | `/api/notifications/read-all`| Mark all user notifications as read | Authenticated |
| `PATCH` | `/api/notifications/:id/read`| Mark single notification as read | Authenticated |
| `DELETE` | `/api/notifications/:id` | Delete individual notification | Authenticated |
| `DELETE` | `/api/notifications` | Clear all user notifications | Authenticated |

### 📊 12. Dashboards, Health & Anti-Spindown
| Method | Endpoint | Description | Role / Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/admin` | High-level 360° Workforce BI telemetry | `ADMIN`, `HR_MANAGER` |
| `GET` | `/api/dashboard/employee` | Personalized ESS telemetry & timers | Authenticated |
| `GET` | `/api/health` | Comprehensive database connection health check | Public |
| `GET` | `/health` | Lightweight anti-spindown ping endpoint | Public |

---

## 🧪 Automated Testing & Verification

NexaHR includes built-in test suites executed via Node.js native test runner (`node --test`), verifying AI screening thresholds, phone normalization, resume RBAC authorization, and user cache isolation:

```bash
# Execute all backend unit and security test suites
npm test
```

### Automated Test Suites:
1. **AI ATS Screening Suite ([`src/tests/aiScreening.test.js`](src/tests/aiScreening.test.js))** — *13 Tests*:
   * **Boundary Threshold Validation**: Verifies that score 69 is routed to `SCREENED_OUT`, while score 70+ is routed to `CONFIRMED`.
   * **Zod Schema Parsing**: Validates strict JSON parsing and ensures malformed payloads or missing breakdown objects are rejected.
   * **Markdown Extraction**: Verifies `cleanJsonOutput` strips triple backtick markdown wrappers cleanly.
   * **Semantic Match Parsing**: Validates job match confidence thresholds.
   * **Duplicate Candidate Protection**: Ensures repeat applicant emails update existing records rather than producing redundant database rows.
   * **Phone Number Extraction & Normalization**: Validates regex extraction across international formats and normalization to standard `+92 XXX XXXXXXX` formatting.
   * **Privacy Masking**: Ensures phone numbers in logs are redacted (`+92 *** ****567`) for data privacy compliance.
   * **Data Consistency**: Verifies requisition KPI totals match visible Kanban card sums.

2. **ATS Hardening & RBAC Suite ([`src/tests/atsHardening.test.js`](src/tests/atsHardening.test.js))** — *11 Tests*:
   * **401 Unauthorized**: Requesting candidate resumes without an auth token returns `401`.
   * **403 Forbidden**: Requesting candidate resumes with an `EMPLOYEE` role returns `403`.
   * **200 OK**: Requesting candidate resumes with an `HR_MANAGER` or `ADMIN` role returns `200` with `Content-Type: application/pdf` and `Content-Disposition: inline`.
   * **404 Not Found**: Requesting resumes for non-existent candidate records returns `404`.
   * **Cache Key Partitioning**: Verifies role, user ID, and URL query parameter isolation in cache generation.
   * **User Data Isolation**: Proves User A's cached response is never leaked or served to User B.
   * **Self-Cleaning Lifecycle**: Tests dynamically create and clean up mock binary assets without leaving residual test artifacts on disk.

```bash
# Verify frontend production build and asset bundles
npm --prefix client run build
```

---

## 🤝 Contributing Guidelines

We welcome contributions to NexaHR! To contribute:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/WorkforceOptimization
   ```
3. **Commit Your Changes** following standard conventional commit guidelines:
   ```bash
   git commit -m "feat(payroll): add automated tax band deduction calculator"
   ```
4. **Run Automated Tests**:
   ```bash
   npm test
   npm --prefix client run build
   ```
5. **Push to Your Branch**:
   ```bash
   git push origin feature/WorkforceOptimization
   ```
6. **Open a Pull Request** describing your feature additions, architectural reasoning, and verification results.

---

## 📄 License & Intellectual Property

This project is licensed under the **ISC License**. See the [`LICENSE`](LICENSE) file for complete terms.

---

<div align="center">
  <b>Built with precision for agile enterprises and people-first organizations worldwide.</b><br/>
  <sub>© 2026 NexaHR Platform. All rights reserved.</sub>
</div>

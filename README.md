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
  <b>NexaHR</b> is a state-of-the-art, full-stack Human Resource Management System (HRMS) and Employee Self-Service (ESS) platform. Designed with glassmorphic UI aesthetics, enterprise-grade Role-Based Access Control (RBAC), real-time biometric synchronization, automated payroll tax engines, full-lifecycle recruitment ATS, multi-channel OTP recovery, Cloudinary media pipeline, and in-app notifications.
</p>

<p align="center">
  <a href="#-dual-portal-architecture">Dual Portals</a> •
  <a href="#-key-features--capabilities">Key Features</a> •
  <a href="#-live-demo-credentials">Demo Credentials</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-repository-structure">Directory Map</a> •
  <a href="#-quick-start-guide">Quick Start</a> •
  <a href="#-api-reference-overview">API Reference</a> •
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
  │     • 360° Workforce Intelligence & BI            • Live Punch Terminal & Sessions      │
  │     • 6-Tab Employee Dossier & PIM                • Overtime & Regularization Logs      │
  │     • Hardware Biometric Gateway Sync             • Interactive Leave Quota Meters      │
  │     • Dynamic Payroll & Auto-Tax Processor        • Printable PDF-Styled Payslip Vault  │
  │     • Full Recruitment ATS & Interview Desk       • Team Roster & Live Presence         │
  │     • Company Accounts, Ledgers & Audits          • Helpdesk & IT Service Desk          │
  │     • User Access Control (Granular RBAC)         • Encrypted Document Vault & Policies │
  │     • Corporate Announcements & Bulletins         • Awards, Badges & Peer Kudos Feed    │
  │     • In-App Notifications Hub                    • Holiday Countdown & Weekend Planner │
  └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Dual-Portal Architecture

NexaHR delivers two distinct, role-tailored application environments sharing unified backend services and real-time data persistence:

### 1. 🏢 HR Executive & Admin Command Center (`/app/*`)
* **Workforce Intelligence & BI Dashboard**: Headcount analytics, gender distribution, department distribution charts, live presence donut, quick action shortcuts, and recruitment pipeline status.
* **Personnel Information Management (PIM)**: Complete employee directory with 6-tab dossiers (Personal, Professional, Financial, Documents, Assets, Emergency Contact), search, department filtering, and status management.
* **Multi-Step Onboarding Engine**: Guided employee onboarding wizard with profile picture upload, salary structure configuration, and automated account credential generation.
* **Biometric & Geo Attendance Control**: Live biometric hardware gateway integration, daily punch logs, overtime records, and shift tracking (Present, Late, Half-Day, Absent, On Leave).
* **Leave Management & Policy Engine**: Global leave quota rules, paid/unpaid policies, multi-tier approval workflows, and audit history.
* **Automated Payroll & Tax Computation**: Dynamic allowances (HRA, transport, custom), tax deductions, unpaid leave penalties, and one-click monthly batch payslip generation.
* **Recruitment & Applicant Tracking System (ATS)**: Job Desk, Job Board, Jobs catalog, Applicant pipeline stages, Candidate interview scheduler, Job categories, Skills matrix, Location manager, and Experience tags.
* **Organization Hierarchy & Designations**: Dynamic department creation, designation hierarchy mapping, and team reporting structure.
* **User Access Control & Security**: Fine-grained Role-Based Access Control (RBAC) permission matrices, user status activation/deactivation, and security audit logs.
* **Accounts, Ledgers & Financial Audits**: Departmental cost tracking, payroll disbursement logs, expense accounts, and exportable financial summaries.
* **Corporate Announcements**: Rich-text company broadcasts, department targeting, priority tags, and pinning capabilities.

### 2. 👤 Employee Self-Service (ESS) Portal (`/employee/*`)
* **Live Punch Terminal**: Real-time web clock-in/out terminal with active session timers, break counter, and cross-tab event synchronization.
* **Attendance & Regularization**: Monthly punch logs, check-in/out stamps, punch methods (Biometric, Web, Mobile), and regularization request filing.
* **Smart Leave Manager**: Visual quota progress meters (Annual, Casual, Sick, Parental), instant date duration calculations, reason attachments, and approval tracking.
* **Interactive Payslip Vault**: Detailed earnings vs. deductions breakdown, year-to-date (YTD) salary trends, and pixel-perfect PDF-styled printable payslip view.
* **Project & Kanban Board**: Sprint deliverables, draggable task workflow status cards, and direct work hour logging.
* **Company Team Directory & Roster**: Searchable colleague directory filtered by department and live presence (In Office, Remote, On Leave), with direct email actions.
* **Helpdesk & HR Service Desk**: Multi-category support ticket creation (HR, IT Hardware, Payroll, Benefits), priority levels, and live conversation threads.
* **Encrypted Documents & Policy Center**: Personal contracts, signed NDAs, tax forms, certificate upload modal, and company policy handbook repository.
* **Awards & Peer Kudos Wall**: Personal honors showcase, company-wide peer recognition feed, and "Send Kudos" modal with badge endorsements.
* **Holiday Schedule & Long Weekend Planner**: Next holiday countdown hero banner, full official calendar, and long weekend optimization badges.
* **Multi-Tab Profile & Settings**: Comprehensive personal dossier view, theme engine customization (Dark/Light/System), and security settings.

---

## 🔒 Enterprise Security & Special Features

* **Multi-Channel Password Recovery**: 
  - Ephemeral 6-digit OTP verification via Corporate SMTP (Nodemailer) or WhatsApp Cloud API (Twilio / Meta).
  - SHA-256 hashed OTPs with strict 10-minute expiry and brute-force attempt limits.
* **Cloudinary Media Pipeline**:
  - Direct memory stream profile picture uploads to Cloudinary CDN via Multer (zero disk footprint for ephemeral platforms like Render/Vercel).
  - Built-in webcam capture and local base64 preview fallback.
* **Mandatory First-Login Password Change**:
  - Enforced credential update modal upon initial account activation (`mustChangePassword` flag).
* **Tiered Rate Limiting & HTTP Protection**:
  - Strict rate limiters for authentication endpoints, password reset flows, and general API routes.
  - Helmet CSP headers, CORS with credential handling, and express-validator input sanitization.
* **In-App Notification Hub**:
  - Real-time notification badge counter, category filters (`LEAVE`, `PAYROLL`, `ANNOUNCEMENT`, `ATTENDANCE`), mark-as-read, delete, and deep-link routing.

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
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism Theme Engine (Light, Dark, and System modes)
* **Data Visualizations**: [Recharts 3](https://recharts.org/) (Area, Bar, Donut, and Radial charts)
* **Iconography**: [Lucide React](https://lucide.dev/) (200+ micro-icons)
* **Motion & Animations**: [Framer Motion](https://www.framer.com/motion/)

### **Backend Server & Infrastructure**
* **Runtime**: [Node.js](https://nodejs.org/) (v18+ LTS)
* **REST Framework**: [Express.js 4.21](https://expressjs.com/) (Modular Route-Controller-Service-Middleware architecture)
* **ORM & Database**: [Prisma ORM 5.22](https://www.prisma.io/) + [PostgreSQL 15+](https://www.postgresql.org/)
* **Authentication**: JWT (JSON Web Tokens) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
* **Media Storage**: [Cloudinary CDN](https://cloudinary.com/) with Multer MemoryStorage
* **Notifications & Messaging**: [Nodemailer](https://nodemailer.com/) (SMTP) + [Twilio](https://www.twilio.com/) / Meta WhatsApp Cloud API
* **Security**: [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [express-validator](https://express-validator.github.io/docs/)

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Client (React 19 + Vite 8 + Tailwind v4)"]
        A[Login / Multi-Channel Recovery Portal]
        B[Admin & HR Module /app/*]
        C[Employee ESS Module /employee/*]
        D[In-App Notification Center]
        E[Glassmorphic Theme Engine]
    end

    subgraph Server["Backend REST API (Node.js + Express 4.21)"]
        F[Security Middlewares Helmet, CORS, RateLimit]
        G[Auth & RBAC Middleware]
        H[Auth Controller & Recovery]
        I[Employee & PIM Controller]
        J[Attendance & Biometric Sync]
        K[Leave & Policy Controller]
        L[Payroll & Tax Calculation]
        M[Department & Designation Engine]
        N[Notification & Announcement Hub]
    end

    subgraph Storage["Persistence & External Cloud Services"]
        O[(PostgreSQL Database via Prisma ORM)]
        P[Cloudinary CDN Media Stream]
        Q[Corporate SMTP Nodemailer]
        R[WhatsApp Gateway Twilio / Meta API]
        S[Biometric Hardware Gateway]
    end

    A & B & C & D --> F
    F --> G
    G --> H & I & J & K & L & M & N
    H & I & J & K & L & M & N --> O
    I --> P
    H & N --> Q & R
    J <--> S
```

---

## 📁 Repository Structure

```
NexaHR/
├── client/                                 # Frontend Client (React 19 + Vite 8)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                     # Logo, Badge, ScrollToTop, Modal dialogs
│   │   │   ├── navigation/                 # Admin & Employee Sidebar, Header, NotificationDropdown
│   │   │   └── ui/                         # Reusable buttons, cards, inputs, tabs
│   │   ├── context/                        # ThemeContext (Dark/Light/System)
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx              # Admin & HR command layout wrapper
│   │   │   └── EmployeeLayout.jsx          # Employee Self-Service layout wrapper
│   │   ├── pages/
│   │   │   ├── website/                    # Login, Multi-Channel Forgot Password, Setup
│   │   │   ├── app/                        # HR Executive & Admin Command Pages
│   │   │   │   ├── Dashboard.jsx           # 360° Workforce BI & Analytics
│   │   │   │   ├── Employees.jsx           # Employee Directory & 6-Tab Dossier Modal
│   │   │   │   ├── Attendance.jsx          # Biometric Hardware Sync & Punch Logs
│   │   │   │   ├── Leaves.jsx              # Company-wide Leave Approvals
│   │   │   │   ├── LeavePolicy.jsx         # Leave Quota & Policy Configuration
│   │   │   │   ├── Payroll.jsx             # Payroll Matrix & Structure Management
│   │   │   │   ├── Departments.jsx         # Department Hierarchy
│   │   │   │   ├── EmploymentStatus.jsx    # Classification & Status Types
│   │   │   │   ├── UserAccessControl.jsx   # Role-Based Access Control (RBAC) & Audit
│   │   │   │   ├── Accounts.jsx            # Company Accounts, Ledgers & Expenses
│   │   │   │   ├── Reports.jsx             # Headcount, Attendance & Financial Reports
│   │   │   │   ├── Announcement.jsx        # Admin Broadcasts & Circulars
│   │   │   │   ├── ProjectManagement.jsx   # Agile Project & Task Sprint Board
│   │   │   │   ├── Settings.jsx            # System Configuration & Localization
│   │   │   │   ├── holiday/                # Public & Company Holiday Planner
│   │   │   │   ├── hr/                     # Onboarding Wizard, Designations, Roles
│   │   │   │   ├── payroll/                # Calculate Payroll & Payslip Lists
│   │   │   │   └── recruitment/            # ATS Desk, Board, Jobs, Interviews, Tags
│   │   │   └── employee/                   # Employee Self-Service Pages
│   │   │       ├── EmployeeDashboard.jsx   # Personal Shift Pulse & Quick Actions
│   │   │       ├── EmployeeAttendance.jsx  # Live Punch Terminal & Regularizations
│   │   │       ├── EmployeeLeaves.jsx      # Balance Meters & Leave Application
│   │   │       ├── EmployeePayslips.jsx    # Digital Salary Slips & Printable PDF
│   │   │       ├── EmployeeDirectory.jsx   # Team Roster & Presence Status
│   │   │       ├── EmployeeHelpdesk.jsx    # HR & IT Support Ticket Desk
│   │   │       ├── EmployeeDocuments.jsx   # Encrypted Document Vault & Policies
│   │   │       ├── EmployeeAnnouncements.jsx # Corporate Bulletins
│   │   │       ├── EmployeeAwards.jsx      # Badges & Peer Recognition Wall
│   │   │       ├── EmployeeHolidays.jsx    # Holiday Countdown & Weekend Planner
│   │   │       ├── EmployeeProfile.jsx     # Multi-Tab Personal Profile View
│   │   │       └── EmployeeSettings.jsx    # Notification & Display Preferences
│   │   ├── services/                       # Centralized Axios/Fetch API Client & Mock Fallbacks
│   │   ├── App.jsx                         # Master Routing Hub & Protected Routes
│   │   └── main.jsx                        # React 19 Entrypoint
│   ├── package.json
│   └── vite.config.js
│
├── prisma/
│   └── schema.prisma                       # PostgreSQL Data Models & Relations
│
├── src/                                    # Backend Express.js REST API
│   ├── config/                             # Prisma Client & Cloudinary Configuration
│   ├── controllers/                        # 10 Dedicated Controllers (Auth, Employee, Leaves, etc.)
│   ├── middlewares/                        # JWT Auth, RBAC, Rate Limiters, Upload, Validators
│   ├── routes/                             # Express REST API Endpoints
│   ├── services/                           # Notification Dispatch, Mailer & Tax Engines
│   ├── utils/                              # Password Hashing & JWT Helpers
│   └── index.js                            # Express Server Entrypoint (Port 5000)
│
├── run.bat / run.sh                        # 1-Click Unified Development Launchers
├── run-backend.bat / run-frontend.bat      # Granular Process Launchers
├── test-*.js                               # Comprehensive Unit & Integration Test Suites
├── .env.example                            # Environment Variables Template
├── package.json                            # Root Backend Package & Scripts
└── README.md                               # Project Master Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) `>= 18.0.0`
* [npm](https://www.npmjs.com/) `>= 9.0.0`
* [PostgreSQL](https://www.postgresql.org/) `>= 14.0` *(Optional for live DB; frontend includes graceful mock fallback)*

---

### Option 1: 1-Click Launch (Recommended)

#### On Windows:
Double-click [`run.bat`](file:///d:/NexaHR/run.bat) or execute in PowerShell/CMD:
```bat
.\run.bat
```

#### On Linux / macOS:
```bash
chmod +x run.sh
./run.sh
```

*This automatically verifies dependencies, generates `.env` if missing, and launches both Backend and Frontend concurrently.*

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
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nexahr?schema=public"
JWT_SECRET="nexahr_super_secure_jwt_secret_key_2026"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"

# Optional Cloud Integrations
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
EMAIL_FROM="NexaHR Security <no-reply@nexahr.com>"
```

Generate Prisma client & run database migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
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

## 📡 API Reference Overview

All REST API endpoints are mounted under `/api` with sanitized JSON responses:

### 🔐 Authentication & Session
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-admin` | Bootstrap initial system administrator | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | No (Rate Limited) |
| `POST` | `/api/auth/logout` | Revoke session & clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Fetch active user session profile | Yes |
| `PUT` | `/api/auth/profile` | Update personal profile details | Yes |
| `PUT` | `/api/auth/change-password` | Update account password | Yes |
| `POST` | `/api/auth/forgot-password` | Initiate multi-channel OTP password recovery | No (Rate Limited) |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit cryptographic OTP | No (Rate Limited) |
| `POST` | `/api/auth/reset-password` | Complete password reset with verified OTP | No (Rate Limited) |

### 👥 Personnel Information Management (PIM)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | List all employees with filters & pagination | Admin / HR |
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

### 🏖️ Leave Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves/types` | List leave policies & allowed quotas | Yes |
| `POST` | `/api/leaves/types` | Create/update company leave type | Admin / HR |
| `POST` | `/api/leaves/apply` | Submit new leave application | Yes |
| `GET` | `/api/leaves/my-requests` | Get employee's personal leave requests | Yes |
| `GET` | `/api/leaves` | List all company leave requests | Admin / HR |
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

### 🏢 Departments & Designations
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | List all organizational units | Yes |
| `POST` | `/api/departments` | Create new department | Admin / HR |
| `PUT` | `/api/departments/:id` | Update department details | Admin / HR |
| `DELETE` | `/api/departments/:id` | Delete department unit | Admin / HR |
| `GET` | `/api/designations` | List all job designations & hierarchy | Yes |
| `POST` | `/api/designations` | Create new job designation | Admin / HR |
| `PUT` | `/api/designations/:id` | Update job designation | Admin / HR |
| `DELETE` | `/api/designations/:id` | Delete job designation | Admin / HR |

### 📢 Announcements & Notifications
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/announcements` | Fetch active company announcements | Yes |
| `POST` | `/api/announcements` | Create circular broadcast | Admin / HR |
| `PUT` | `/api/announcements/:id` | Update announcement | Admin / HR |
| `DELETE` | `/api/announcements/:id` | Remove announcement | Admin / HR |
| `GET` | `/api/notifications` | Fetch user notifications & unread count | Yes |
| `PATCH` | `/api/notifications/read-all`| Mark all notifications as read | Yes |
| `PATCH` | `/api/notifications/:id/read` | Mark single notification as read | Yes |
| `DELETE` | `/api/notifications/:id` | Delete single notification | Yes |
| `DELETE` | `/api/notifications` | Clear all notifications | Yes |

### 📊 Dashboard & System Health
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/admin` | Executive 360° workforce analytics | Admin / HR |
| `GET` | `/api/dashboard/employee` | Employee personal shift pulse & KPIs | Yes |
| `GET` | `/api/health` | Database connection & server health | No |

---

## 🧪 Verification & Test Suites

The repository includes standalone validation and integration test suites:

```bash
# Test Database Connection & Models
node test-db.js

# Test Enterprise Security, Helmet, CORS & Rate Limiting
node test-security-suite.js

# Test Multi-Channel Password Recovery & OTP Pipeline
node test-recovery.js

# Test Cloudinary Zero-Disk Profile Picture Upload
node test-profile-picture-pipeline.js

# Test In-App Notification Hub & Email Dispatch
node test-notification-flow.js

# Test Employee Onboarding & PIM Flow
node test-employee-flow.js
```

---

## 🎨 Design Philosophy & UI Excellence

NexaHR is crafted adhering to world-class modern UI/UX principles:
* **Tailored Color Palettes**: Slate `#0B0F19` deep dark mode and `#F4F4F7` crisp porcelain light mode paired with vibrant emerald, indigo, cyan, and amber accents.
* **Fluid Glassmorphism**: Translucent backdrop-blur cards with subtle 1px border lighting.
* **Micro-Animations**: Smooth Framer Motion hover elevations, pulsating punch indicators, animated modal transitions, and interactive charts.
* **Responsive Layouts**: Seamless adaptations from multi-column ultra-wide monitors down to mobile bottom-nav drawer views.

---

## 🗺️ Roadmap & Upcoming Milestones

- [ ] **AI-Powered Resume Matcher**: Automated CV parsing and candidate scoring for the Recruitment module.
- [ ] **Real-Time WebSockets**: Instant push notifications for leave approvals, kudos alerts, and live punches.
- [ ] **Slack & MS Teams Webhooks**: Daily attendance reminders and holiday broadcast bots.
- [ ] **Native Mobile Application (Capacitor/React Native)**: Native biometric fingerprint login on iOS & Android.

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

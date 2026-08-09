<div align="center">

# ⚡ NexaHR

### **Next-Generation Enterprise Human Resource, Biometric & Workforce Intelligence Platform**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <b>NexaHR</b> is a full-stack, enterprise-grade Human Resource Management (HRM) and Employee Self-Service (ESS) platform engineered with a sleek modern aesthetic, real-time biometric synchronization, automated payroll tax engines, recruitment applicant tracking (ATS), and seamless dual-portal architecture.
</p>

<p align="center">
  <a href="#-dual-portal-architecture">Dual Portals</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-live-demo-credentials">Demo Credentials</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-quick-start-guide">Quick Start</a> •
  <a href="#-api-reference">API Docs</a>
</p>

</div>

---

## 🌟 Highlights & Core Capabilities

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                                NexaHR                                  │
  │     ┌───────────────────────────┴───────────────────────────┐          │
  │     ▼                                                       ▼          │
  │ 🏢 HR Executive Command Center           👤 Employee Self-Service (ESS)│
  │   • 360° Workforce KPIs                    • Live Punch Terminal       │
  │   • PIM & Role-Based ACL                   • Shift Counter & Logs      │
  │   • Biometric & Geo Attendance             • Leave Quota Requests      │
  │   • Payroll Auto-Tax Engine                • Printable Payslips        │
  │   • Full Recruitment ATS                   • Kanban Task Sprint Board  │
  │   • Company Accounts & Audits              • Team Directory & Org Tree │
  │   • Corporate Announcements                • Helpdesk Service Desk     │
  │   • Recognition & Kudos                    • Encrypted Document Vault  │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 Dual-Portal Architecture

NexaHR provides two dedicated, isolated portals tailored specifically for executive administration and employee daily operations:

### 1. 🏢 HR Executive & Admin Command Center (`/app/*`)
* **Executive 360° Dashboard**: Real-time headcount distributions, department breakdown charts, gender ratios, live attendance presence donuts, and recruitment pipeline KPIs.
* **Personnel Information Management (PIM)**: Complete employee lifecycle management, role & designation matrices, department hierarchy, and fine-grained permissions.
* **Biometric & Attendance Engine**: Hardware biometric gateway sync, daily punch logs, shift scheduling, and status tracking (Present, Late, Half-Day, Absent, On Leave).
* **Automated Payroll & Auto-Tax Compliance**: Dynamic salary structures (HRA, allowances, provident fund, insurance), automatic tax deduction computation, and one-click batch payslip generation.
* **Recruitment & Applicant Tracking System (ATS)**: Multi-stage hiring desk, candidate pipeline kanban board, job category/skills/experience tags, and interview scheduler.
* **Company Accounts & Audit Reports**: Departmental expenditure analytics, payroll disbursement logs, leave liability reports, and exportable financial summaries.

### 2. 👤 Employee Self-Service (ESS) Portal (`/employee/*`)
* **Live Punch Terminal**: Real-time web clock-in/out terminal with active session timers, break counter, and cross-tab event synchronization.
* **My Attendance & Regularization**: Monthly attendance logs with punch methods (Biometric, Web, Mobile GPS), overtime logs, and missing punch regularization requests.
* **Smart Leave Manager**: Visual quota progress meters (Annual, Casual, Sick, Parental), instant date duration calculations, reason attachments, and approval history.
* **Interactive Payslip Vault**: Detailed earnings vs. deductions breakdown, year-to-date (YTD) salary trends, and pixel-perfect PDF-styled printable payslip view.
* **Agile Projects & Kanban Board**: Sprint deliverables, draggable task workflow status cards, and direct work hour logging.
* **Company Team Directory & Roster**: Searchable colleague directory filtered by department and live presence (In Office, Remote, On Leave), with direct email and Slack actions.
* **Helpdesk & HR Service Desk**: Multi-category support ticket creation (HR, IT Hardware, Payroll, Benefits), priority levels, and live conversation threads.
* **Encrypted Documents & Policy Center**: Personal contracts, signed NDAs, W-2 tax forms, certificate upload modal, and company policy handbook repository.
* **Awards & Peer Kudos Wall**: Personal honors showcase, company-wide peer recognition feed, and "Send Kudos" modal with badge endorsements.
* **Holiday Schedule & Long Weekend Planner**: Next holiday countdown hero banner, full official calendar, and long weekend optimization badges.

---

## 🔑 Live Demo Credentials

NexaHR includes built-in demo credentials for immediate exploration without requiring manual seed configuration:

| Portal Mode | Role | Email | Password | Access Path |
| :--- | :--- | :--- | :--- | :--- |
| **HR Executive** | `ADMIN` | `admin@company.com` | `admin123` | [`/app/dashboard`](http://localhost:5173/app/dashboard) |
| **Employee Self-Service** | `EMPLOYEE` | `employee@company.com` | `employee123` | [`/employee/dashboard`](http://localhost:5173/employee/dashboard) |

> 💡 **Role Switcher**: You can seamlessly switch between HR Admin and Employee views at any time via the sidebar or profile header dropdown.

---

## 🛠️ Tech Stack

### **Frontend Client**
* **Core Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
* **Routing**: [React Router v7](https://reactrouter.com/)
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism Theme Engine (Light, Dark, and System modes)
* **Data Visualizations**: [Recharts 3](https://recharts.org/) (Interactive Area, Bar, and Donut Charts)
* **Iconography**: [Lucide React](https://lucide.dev/) (Comprehensive icon set)
* **Motion & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/)

### **Backend Server & Database**
* **Runtime**: [Node.js](https://nodejs.org/) (v18+ LTS)
* **REST API Framework**: [Express.js](https://expressjs.com/) (Modular Controller-Service-Route architecture)
* **ORM**: [Prisma ORM 5](https://www.prisma.io/)
* **Database Engine**: [PostgreSQL 15+](https://www.postgresql.org/)
* **Authentication & Security**: JSON Web Tokens (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) password hashing + CORS protection

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Client (React 19 + Vite 8)"]
        A[Login / Multi-Role Portal Entry]
        B[Admin Module /app/*]
        C[Employee ESS /employee/*]
        D[Theme Engine & Token Store]
    end

    subgraph Server["Backend REST API (Node.js + Express)"]
        E[Auth & JWT Middleware]
        F[Employee & PIM Controller]
        G[Biometric & Attendance Service]
        H[Leave & Holiday Engine]
        I[Payroll & Auto-Tax Processor]
        J[Recruitment & ATS Controller]
    end

    subgraph Data["Database & Services"]
        K[(PostgreSQL Database)]
        L[Prisma ORM Client]
        M[Biometric Hardware Gateway]
    end

    A --> E
    B --> E
    C --> E
    E --> F & G & H & I & J
    F & G & H & I & J --> L
    L --> K
    G <--> M
```

---

## 📁 Repository Structure

```
NexaHR/
├── client/                           # Frontend React 19 + Vite Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Logo, Badges, Shared UI elements
│   │   │   ├── navigation/           # Admin/Employee Sidebar, Header, BottomNav
│   │   │   └── ui/                   # Reusable UI widgets, Modals, Cards
│   │   ├── context/                  # ThemeContext (Dark/Light/System)
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx        # HR Admin layout wrapper
│   │   │   └── EmployeeLayout.jsx    # Employee Self-Service layout wrapper
│   │   ├── pages/
│   │   │   ├── website/              # Login, Auth portals
│   │   │   ├── app/                  # HR Admin Pages
│   │   │   │   ├── Dashboard.jsx     # Executive workforce analytics
│   │   │   │   ├── Employees.jsx     # PIM employee directory & profiles
│   │   │   │   ├── Attendance.jsx    # Hardware biometric logs & sync
│   │   │   │   ├── Leaves.jsx        # Company-wide leave approvals
│   │   │   │   ├── Payroll.jsx       # Global payroll & auto-tax matrix
│   │   │   │   ├── Departments.jsx   # Organization structure & units
│   │   │   │   ├── holiday/          # Public & Weekly holiday settings
│   │   │   │   ├── hr/               # Onboarding, Role-ACL, Designations
│   │   │   │   ├── payroll/          # Calculate payroll & payslip lists
│   │   │   │   └── recruitment/      # ATS Jobs, Board, Interviews, Desk
│   │   │   └── employee/             # Employee Self-Service Pages
│   │   │       ├── EmployeeDashboard.jsx    # Personal shift pulse & tasks
│   │   │       ├── EmployeeAttendance.jsx   # Punch in/out & regularizations
│   │   │       ├── EmployeeLeaves.jsx       # Balance meters & application
│   │   │       ├── EmployeePayslips.jsx     # Salary slips & printable PDF
│   │   │       ├── EmployeeProjects.jsx     # Sprint tasks & Kanban board
│   │   │       ├── EmployeeDirectory.jsx    # Team roster & presence status
│   │   │       ├── EmployeeHelpdesk.jsx     # HR & IT support ticket desk
│   │   │       ├── EmployeeDocuments.jsx    # Encrypted docs & policy library
│   │   │       ├── EmployeeAnnouncements.jsx# Circular notices & bulletins
│   │   │       ├── EmployeeAwards.jsx       # Badges & peer kudos feed
│   │   │       ├── EmployeeHolidays.jsx     # Holiday countdown & planner
│   │   │       ├── EmployeeProfile.jsx      # Multi-tab personal profile
│   │   │       └── EmployeeSettings.jsx     # Themes & notification prefs
│   │   ├── services/                 # Centralized Axios/Fetch API client
│   │   ├── App.jsx                   # Master routing hub
│   │   └── main.jsx                  # React application entrypoint
│   ├── package.json
│   └── vite.config.js
│
├── prisma/
│   └── schema.prisma                 # PostgreSQL database schema & relational models
│
├── src/                              # Backend Express.js REST API
│   ├── config/                       # Prisma client & database connectors
│   ├── controllers/                  # Auth, Employee, Leave, Attendance, Payroll
│   ├── middlewares/                  # JWT auth, error handlers, role-based ACL
│   ├── routes/                       # Express router endpoints
│   ├── services/                     # Business logic, tax computation engines
│   ├── utils/                        # Response formatters & helpers
│   └── index.js                      # Express server entrypoint (Port 5000)
│
├── .env.example                      # Environment variables template
├── package.json                      # Backend dependencies & scripts
├── run.bat                           # 1-Click Windows development launcher
└── README.md                         # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) `>= 18.0.0`
* [npm](https://www.npmjs.com/) `>= 9.0.0`
* [PostgreSQL](https://www.postgresql.org/) `>= 14.0` *(Optional for live DB; frontend includes graceful offline fallback)*

---

### Option 1: 1-Click Launch (Windows)
Double-click [`run.bat`](file:///d:/NexaHR/run.bat) in the project root. It will automatically:
1. Verify / generate `.env` configurations.
2. Install all root and client dependencies.
3. Concurrently start the Backend Server (`localhost:5000`) and Frontend Client (`localhost:5173`).

---

### Option 2: Manual Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/imumairakram/Nexa-HR.git
cd Nexa-HR
```

#### 2. Backend Setup & Environment Configuration
```bash
# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` to configure your PostgreSQL credentials and JWT secret:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nexahr?schema=public"
JWT_SECRET="nexahr_super_secure_jwt_secret_key_2026"
JWT_EXPIRES_IN="7d"
```

Initialize Prisma database migrations:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Database Migrations
npm run prisma:migrate
```

Start the Backend Server:
```bash
npm run dev
# Backend API active on http://localhost:5000
```

#### 3. Frontend Client Setup
In a new terminal window:
```bash
cd client

# Install frontend dependencies
npm install

# Start Vite Development Server
npm run dev
# Frontend UI active on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser to start exploring NexaHR!

---

## 📡 API Reference Overview

The backend exposes structured, authenticated REST endpoints under `/api`:

### 🔐 Authentication & Session
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | No |
| `POST` | `/api/auth/register-admin` | Bootstrap initial system administrator | No |
| `GET` | `/api/auth/me` | Fetch active user session profile | Yes |

### 👥 Personnel Information (PIM)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | List all employee records with filters | Yes |
| `GET` | `/api/employees/:id` | Fetch detailed employee dossier | Yes |
| `POST` | `/api/employees/onboard` | Onboard new employee & profile | Admin / HR |
| `PUT` | `/api/employees/:id` | Update employee information | Admin / HR |

### ⏱️ Attendance & Biometrics
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance` | Fetch attendance logs with date filtering | Yes |
| `POST` | `/api/attendance/log` | Register check-in / check-out punch | Yes |
| `POST` | `/api/attendance/sync-hardware` | Trigger biometric hardware gateway sync | Admin / HR |

### 🏖️ Leave Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leaves/types` | List leave policies & allowed quotas | Yes |
| `GET` | `/api/leaves/requests` | List leave applications & statuses | Yes |
| `POST` | `/api/leaves/request` | Submit new leave application | Yes |
| `PATCH` | `/api/leaves/requests/:id/status` | Approve or reject leave request | Admin / HR |

### 💰 Payroll & Compensation
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payroll/payslips` | List generated employee payslips | Yes |
| `GET` | `/api/payroll/payslips/:id` | Retrieve single payslip breakdown | Yes |
| `POST` | `/api/payroll/generate` | Run automated payroll batch calculation | Admin / HR |

---

## 🎨 Design Philosophy & Aesthetics

NexaHR is crafted adhering to world-class modern UI/UX principles:
* **Tailored Color Palettes**: Slate `#0B0F19` deep dark mode and `#F4F4F7` crisp porcelain light mode paired with vibrant emerald, indigo, and amber accents.
* **Fluid Glassmorphism**: Translucent backdrop-blur cards with subtle 1px border lighting.
* **Micro-Animations**: Smooth hover elevations, pulsating punch indicators, and animated modals.
* **Mobile Responsiveness**: Adaptive layouts spanning multi-column desktop displays down to mobile bottom-nav drawers.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **AI-Powered Resume Matcher**: Automated CV parsing and candidate scoring for the Recruitment module.
- [ ] **Real-Time WebSockets**: Instant notifications for leave approvals and kudos alerts.
- [ ] **Slack & MS Teams Webhooks**: Daily attendance reminders and holiday broadcast bots.
- [ ] **Native Mobile App (Capacitor/React Native)**: Native biometric fingerprint login on iOS & Android.

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

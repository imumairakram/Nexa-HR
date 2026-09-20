# 📄 NexaHR — Product Requirements Document (PRD)

**Product Name:** NexaHR Enterprise Human Resource Management System (HRMS)  
**Classification:** Single-Company Enterprise Core HR & Biometric Operations Platform  
**Version:** `2.0.0 Enterprise`  
**Document Status:** Approved & Active  
**Author:** NexaHR Core Product & Engineering Team  

---

## 1. Executive Summary & Vision

### 1.1 Product Vision
NexaHR is a modern, unified, and intuitive Human Resource Management System (HRMS) engineered specifically for medium-to-large enterprises. It consolidates employee lifecycle management, biometric time & attendance tracking, leave policy automation, multi-tier payroll calculation, recruitment pipeline tracking, and company-wide communications into a single, high-performance platform.

### 1.2 Core Business Objectives
- **Eliminate Fragmented HR Toolchains:** Replace disjointed spreadsheets, standalone attendance clock software, and disparate payroll calculators with an integrated system.
- **Operational Transparency:** Empower HR administrators and executives with real-time analytics across attendance adherence, payroll overhead, and workforce allocation.
- **Employee Self-Service (ESS):** Provide staff with an autonomous portal to clock attendance, submit leave applications, download encrypted payslips, view policy handbooks, and track company updates.
- **Compliance & Security:** Enforce strict Role-Based Access Control (RBAC), multi-channel OTP password recovery, audit-proof payroll formulas, and biometrics log validation.

---

## 2. Target Personas & Stakeholders

| Persona | Role & Responsibilities | Key Needs & Pain Points |
| :--- | :--- | :--- |
| **System Administrator (ADMIN)** | Full platform governance, database maintenance, user credential resets, role & permission binding, and audit monitoring. | Needs unified security controls, fast user provisioning, and non-bypassable RBAC gates. |
| **HR Manager (HR_MANAGER)** | Personnel administration, hiring pipeline, attendance verification, leave request adjudication, payroll runs, and department planning. | Needs quick bulk actions, accurate pro-rata leave & salary computations, and real-time dashboard notifications. |
| **Standard Employee (EMPLOYEE)** | Day-to-day operations, check-in / check-out, leave submissions, payslip review, helpdesk inquiries, and document access. | Needs clean, friction-free mobile/desktop UI, instant notification feedback, and transparent attendance metrics. |

---

## 3. Scope of Product Features

```
+-----------------------------------------------------------------------------------+
|                                  NEXAHR PLATFORM                                  |
+-----------------------------------------+-----------------------------------------+
|           ADMIN & HR PORTAL             |         EMPLOYEE SELF-SERVICE (ESS)     |
+-----------------------------------------+-----------------------------------------+
| * PIM (Personnel Information Mgmt)      | * Self-Service Dashboard                |
| * Biometric Attendance Engine           | * Single-Click Web Attendance Clock     |
| * Tiered Leave Management & Accruals    | * Leave Request & Status Tracker        |
| * Automated Gross-to-Net Payroll Run    | * Monthly Payslip Generation & Download |
| * End-to-End Recruitment ATS            | * Pinned Announcements & Event Calendar |
| * Department & Designation Governance   | * Document Repository & Org Directory   |
| * RBAC Access Control Matrix            | * Interactive Helpdesk & Ticket Center  |
+-----------------------------------------+-----------------------------------------+
```

### 3.1 Personnel Information Management (PIM)
- **Employee Records:** Centralized employee repository featuring personal info, corporate email, phone, joining date, emergency contacts, physical address, and department/designation links.
- **Profile Picture Uploads:** Direct-to-Cloudinary streaming pipeline with automatic aspect resizing, fallback to local buffers in test environments.
- **Status Lifecycles:** Active, On-Probation, Terminated, and On-Leave states with instant privilege revocation upon deactivation.

### 3.2 Time & Attendance Engine
- **Web Punching & Hardware Biometrics:** Real-time check-in and check-out tracking with IP and timestamp capture.
- **Auto-Status Calculation:** Automated classification of records as `PRESENT`, `LATE` (grace period configurable), `HALF_DAY`, `ABSENT`, or `ON_LEAVE`.
- **Work Hours Computation:** Precise working hour calculations factoring break policies and overtime allowances.

### 3.3 Leave Management Subsystem
- **Standard & Custom Leave Policies:** Pre-configured Paid Annual Leave (18 days), Medical/Sick Leave (12 days), and Casual Leave (8 days), with dynamic policy configuration.
- **Workflow Approvals:** Multi-stage approval/rejection workflows with mandatory rejection justification logs.
- **Real-Time Leave Balance Calculation:** Deduction of approved days against annual quotas; auto-flags unpaid leaves for payroll deductions.

### 3.4 Payroll & Compensation Engine
- **Salary Structure Binding:** Base salary + custom allowances (Housing, Transport, Other) - statutory deductions (Income Tax, Health, Pension).
- **Automated Monthly Payroll Calculation:**
  $$\text{Gross Salary} = \text{Basic Salary} + \sum \text{Allowances}$$
  $$\text{Unpaid Deduction} = \left(\frac{\text{Gross Salary}}{30}\right) \times \text{Unpaid Leave Days}$$
  $$\text{Net Salary} = \text{Gross Salary} - \text{Tax Deductions} - \text{Other Deductions} - \text{Unpaid Deduction}$$
- **Payslip Generation:** Printable, downloadable enterprise payslips with company seals, breakdowns, and audit hashes.

### 3.5 End-to-End Recruitment (ATS)
- **Job Posting Pipeline:** Configurable job requisitions by Category, Job Type (Full-time, Part-time, Remote), Experience level, and Skill tags.
- **Applicant Tracking:** Kanban-style or tabular applicant tracker progressing through *Applied*, *Screening*, *Interview Scheduled*, *Offered*, and *Hired*.
- **Interview Scheduling:** Integrated interview management with interviewer assignment and candidate rating cards.

### 3.6 Communications & Helpdesk
- **Broadcast Announcements:** High/Medium/Low priority announcements with department targeting and pinning features.
- **Notification Center:** In-app real-time notification feed coupled with transactional email/SMS alerts.
- **Employee Helpdesk:** Internal ticketing interface for IT, Payroll, and General HR inquiries.

---

## 4. Functional Requirements Matrix

| ID | Module | Requirement Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | Auth | Mandatory initial password change (`mustChangePassword = true`) upon first login. | P0 |
| **FR-02** | Auth | Multi-channel password recovery via 6-digit cryptographic OTP (Email & Twilio SMS). | P0 |
| **FR-03** | RBAC | Route and API-level authorization based on `ADMIN`, `HR_MANAGER`, and `EMPLOYEE` roles. | P0 |
| **FR-04** | PIM | CRUD operations for employees with auto-generated unique `EMP-XXX-NNN` identifiers. | P0 |
| **FR-05** | Attendance | Daily check-in/check-out with status triggers (`PRESENT`, `LATE`, `HALF_DAY`). | P0 |
| **FR-06** | Leaves | Leave application validation against remaining quota and conflict prevention. | P0 |
| **FR-07** | Payroll | Batch payroll calculation for all active employees for selected month/year. | P0 |
| **FR-08** | Recruitment | Full job requisition creation, applicant ingestion, and interview logging. | P1 |
| **FR-09** | Regional | Dynamic localization for Date Formats, Currency, Timezones, and Fiscal calendars. | P1 |
| **FR-10** | Theme | Dark / Light mode toggle with persistent local storage and CSS custom properties. | P1 |

---

## 5. Non-Functional Requirements (NFR)

- **Performance:** Sub-100ms API response time for all standard CRUD operations; sub-500ms for bulk payroll computations.
- **Security:** Bcrypt salted password hashing ($10\text{ rounds}$), JWT signed tokens with expiry, Helmet header hardening, express-rate-limit protection.
- **Reliability & Availability:** Zero data loss guarantee through ACID-compliant PostgreSQL transactions and relational foreign key cascades.
- **Scalability:** Stateless API design allowing horizontal container scaling behind load balancers.
- **Usability:** 100% responsive interface supporting 320px mobile viewports up to 4K desktop displays with WCAG AA contrast compliance.

---

## 6. Success Metrics & KPIs

1. **HR Administrative Time Saved:** $65\%$ reduction in monthly payroll processing and leave reconciliation time.
2. **Attendance Precision:** $99.9\%$ accuracy in daily check-in timestamps and automated late penalty calculations.
3. **Employee Adoption:** $>95\%$ active employee adoption of Employee Self-Service (ESS) within 30 days of deployment.
4. **Security Incidents:** Zero unauthorized privilege escalation incidents and zero unhashed credential exposures.

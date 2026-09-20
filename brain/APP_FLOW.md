# 🔄 NexaHR — Application Flow & User Journeys

**System Name:** NexaHR Enterprise Human Resource Management System (HRMS)  
**Version:** `2.0.0 Enterprise`  
**Document Classification:** User Journey Mapping & Operational Process Flows  

---

## 1. High-Level Flow Topology

```mermaid
flowchart TD
    Start([User Arrives at NexaHR]) --> Login[Secure Login Page '/']
    Login --> AuthCheck{Credentials Valid?}
    AuthCheck -- No --> LoginError[Display Error Message]
    AuthCheck -- Yes --> ForcePassCheck{mustChangePassword == true?}
    
    ForcePassCheck -- Yes --> FirstPassModal[Mandatory Password Change Modal]
    FirstPassModal --> UpdatePass[Save New Strong Password]
    UpdatePass --> RoleRoute
    
    ForcePassCheck -- No --> RoleRoute{User Role?}
    
    RoleRoute -- ADMIN / HR_MANAGER --> HRApp[/app/dashboard - HR Management Portal]
    RoleRoute -- EMPLOYEE --> EmpApp[/employee/dashboard - Employee Self-Service Portal]
    
    subgraph HR_PORTAL [HR Management Ecosystem]
        HRApp --> PIM[Employee Directory & Onboarding]
        HRApp --> AttendMgmt[Attendance & Biometric Logs]
        HRApp --> LeaveReview[Leave Approval Workflows]
        HRApp --> PayrollRun[Automated Monthly Payroll]
        HRApp --> Recruitment[ATS Recruitment Pipeline]
        HRApp --> SecControl[User Access & Security Control]
    end

    subgraph ESS_PORTAL [Employee Self-Service Ecosystem]
        EmpApp --> ClockInOut[Daily Attendance Punch In/Out]
        EmpApp --> ApplyLeave[Leave Application Submission]
        EmpApp --> ViewPayslip[Payslip Breakdown & PDF Export]
        EmpApp --> Helpdesk[Internal Inquiries & Tickets]
        EmpApp --> OrgDocs[Handbooks & Corporate News]
    end
```

---

## 2. Authentication & Credential Flows

### 2.1 First-Time Login & Mandatory Security Setup
```mermaid
sequenceDiagram
    autonumber
    actor User as New Employee
    participant Client as React Frontend
    participant Server as Express Backend
    participant DB as PostgreSQL Database

    User->>Client: Enters Initial Credentials (from HR email)
    Client->>Server: POST /api/auth/login { emailOrCode, password }
    Server->>DB: Query User record
    DB-->>Server: User record (mustChangePassword: true)
    Server->>Server: Validate password with bcrypt.compare()
    Server-->>Client: 200 OK + JWT + { mustChangePassword: true }
    Client->>Client: Intercept flag & display FirstLoginPasswordModal
    User->>Client: Enters New Password + Confirmation
    Client->>Server: POST /api/auth/change-password { currentPassword, newPassword }
    Server->>DB: Update password hash & set mustChangePassword = false
    DB-->>Server: Success
    Server-->>Client: 200 Password Updated
    Client->>Client: Route to Dashboard (/app or /employee)
```

### 2.2 Multi-Channel OTP Password Recovery Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as User Requesting Reset
    participant Client as React Frontend
    participant Server as Express Backend
    participant Mailer as Nodemailer / Twilio
    participant DB as PostgreSQL Database

    User->>Client: Clicks "Forgot Password?" & enters Email / Employee Code
    Client->>Server: POST /api/auth/request-reset { identifier, channel }
    Server->>DB: Lookup User & Role
    alt User is ADMIN
        Server->>Server: Force channel = EMAIL (Security Enforcement)
    else User is HR or EMPLOYEE
        Server->>Server: Allow selected channel (EMAIL or SMS)
    end
    Server->>Server: Generate 6-digit numeric OTP & SHA-256 Hash
    Server->>DB: Upsert OTP record (expires in 10 mins, attempts = 0)
    Server->>Mailer: Dispatch OTP to user's registered destination
    Server-->>Client: 200 OTP Sent Successfully
    User->>Client: Enters 6-digit OTP
    Client->>Server: POST /api/auth/verify-otp { email, otp }
    Server->>DB: Fetch active OTP record
    Server->>Server: Validate hash & check attempts < 3
    Server-->>Client: 200 OTP Validated (Issues short-lived Reset Authorization)
    User->>Client: Submits New Password
    Client->>Server: POST /api/auth/reset-password-otp { email, otp, newPassword }
    Server->>DB: Update password hash & mark OTP as used
    Server-->>Client: 200 Password Reset Complete (Redirect to Login)
```

---

## 3. Core HR Operational Workflows

### 3.1 Employee Onboarding & Lifecycle Management
1. **Initiation:** HR Manager navigates to `/app/hr/new-employee`.
2. **Data Ingestion:**
   - **Personal Information:** First Name, Last Name, Corporate Email, Phone, Date of Birth, Gender, Address, Emergency Contact.
   - **Organizational Alignment:** Department selection (auto-loads matching Designations), Employment Type (Full-time, Part-time, Contract), Shift schedule.
   - **Compensation Structure:** Basic Salary, Housing Allowance, Transport Allowance, Other Allowances, Statutory Tax, Deductions.
   - **Avatar Capture:** File upload with automatic Cloudinary stream and face crop.
3. **Atomic Persistence:** Backend executes an atomic transaction:
   - Creates `User` with auto-formatted `EMP-XXX-NNN` code and temporary password.
   - Creates `EmployeeProfile` linked to `Department` and `Designation`.
   - Creates `SalaryStructure` linked to `User`.
4. **Notification Dispatch:** System generates an in-app welcome notification and sends onboarding credentials to the employee's email.

### 3.2 Monthly Payroll Processing Lifecycle
```mermaid
flowchart LR
    Step1[1. Select Month & Year] --> Step2[2. Query Active Employees]
    Step2 --> Step3[3. Calculate Total Working Days & Unpaid Leaves]
    Step3 --> Step4[4. Apply Allowances & Tax Deductions]
    Step4 --> Step5[5. Compute Gross & Net Salary]
    Step5 --> Step6[6. Save Generated Payslips]
    Step6 --> Step7[7. Notify Employees & Publish PDF Payslips]
```

1. HR navigates to `/app/payroll/calculate`.
2. Selects Target Payroll Period (e.g. `September 2026`).
3. Clicks **"Process Payroll"**:
   - The engine iterates over every active employee with a registered `SalaryStructure`.
   - Checks `LeaveRequest` records for unpaid leave days within the period.
   - Formulates:
     $$\text{Gross} = \text{Basic} + \text{Housing} + \text{Transport} + \text{Other}$$
     $$\text{Unpaid Deduction} = \left(\frac{\text{Gross}}{30}\right) \times \text{Unpaid Days}$$
     $$\text{Net Salary} = \text{Gross} - \text{Tax} - \text{Other Deductions} - \text{Unpaid Deduction}$$
4. Results are previewed in an interactive table with options to inspect individual breakdowns.
5. HR clicks **"Finalize & Publish Payslips"**, which writes records to the `payslips` table with status `GENERATED` and broadcasts in-app notifications to all employees.

---

## 4. Employee Self-Service (ESS) Workflows

### 4.1 Daily Attendance Punch In / Out
```mermaid
flowchart TD
    EmpDash[Employee Dashboard /employee/dashboard] --> ClockWidget[Attendance Quick Clock Widget]
    ClockWidget --> StatusCheck{Current Daily Status?}
    
    StatusCheck -- No Punch Today --> ClickIn[Click 'Check In']
    ClickIn --> InAPI[POST /api/attendance/check-in]
    InAPI --> RecordPresent[Record Created: status = PRESENT or LATE]
    RecordPresent --> LiveTimer[Live Shift Timer Starts Running]
    
    StatusCheck -- Checked In --> ClickOut[Click 'Check Out']
    ClickOut --> OutAPI[POST /api/attendance/check-out]
    OutAPI --> CalcHours[Compute Total Shift Hours & Update Record]
    CalcHours --> LockPunch[Shift Completed for the Day]
```

### 4.2 Leave Application & Adjudication Flow
```mermaid
sequenceDiagram
    autonumber
    actor Emp as Employee
    participant ESS as Employee Portal (/employee/leaves)
    participant API as NexaHR Backend
    participant HR as HR Admin Portal (/app/leaves)

    Emp->>ESS: Opens "Request Leave" Form
    Emp->>ESS: Selects Leave Type, Start Date, End Date, Reason
    ESS->>API: POST /api/leaves/request
    API->>API: Verify leave balance quota & check for date overlap
    API->>API: Create LeaveRequest record (status = PENDING)
    API->>API: Create in-app notification for HR team
    API-->>ESS: 201 Created (Displays in "Pending Applications" table)
    
    HR->>API: GET /api/leaves/admin-list
    API-->>HR: Displays pending leave requests
    HR->>HR: Reviews balance & overlap calendar
    HR->>API: PUT /api/leaves/:id/status { status: 'APPROVED' or 'REJECTED', reason }
    API->>API: Update status and link approvedById
    API->>API: Dispatch real-time notification to Employee
    API-->>HR: 200 OK
    Emp->>ESS: Refreshes view -> Status updated to Approved/Rejected badge
```

---

## 5. Recruitment & Applicant Tracking (ATS) Flow

```mermaid
stateDiagram-v2
    [*] --> JobDraft: HR Creates Job Requisition
    JobDraft --> Published: Set to Active / Published
    Published --> Applied: Candidate Submits Application
    Applied --> Screening: HR Reviews Resume & Portfolio
    Screening --> InterviewScheduled: Candidate Shortlisted for Interview
    InterviewScheduled --> Evaluation: Interviewers Submit Feedback Score
    Evaluation --> OfferExtended: Final Approval from Hiring Head
    OfferExtended --> Hired: Candidate Accepts Offer
    OfferExtended --> Rejected: Candidate Declines / Fails
    Screening --> Rejected: Profile Unfit
    Hired --> [*]: Direct Convert to Employee Profile in PIM
```

---

## 6. Real-Time Notification & In-App Alerts Flow

1. **Trigger Event Occurs:**
   - Leave status updated (Approved / Rejected)
   - Monthly payslip published
   - Company announcement broadcasted
   - Security password changed
2. **Notification Dispatcher:**
   - Service writes a new row to `Notification` table with category (`LEAVE`, `PAYROLL`, `ANNOUNCEMENT`, `ATTENDANCE`).
   - If user has unread notifications, the header bell badge shows dynamic count and pulsing beacon.
   - Clicking notification navigates straight to deep-linked context route (`link: "/employee/payslips"`).

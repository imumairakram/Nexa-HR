# NexaHR Enterprise Security Audit Report (27-Step Checklist)

**Audit Mode:** READ-ONLY Static Code Analysis & Non-Destructive Local Verification  
**Target Platform:** NexaHR Human Resource, Payroll, Biometric & ATS Platform  
**Architecture:** Node.js (Express 4.21) + Prisma ORM (5.22) + PostgreSQL + React 19 / Vite 8 Client  
**Date of Audit:** November 1, 2026  
**Auditor:** Senior Application Security Engineer  

---

## A. Executive Summary

A comprehensive, read-only application security assessment was conducted against the NexaHR codebase across 27 distinct security control domains. NexaHR processes highly sensitive corporate human capital data, including employee identities, biometric attendance timestamps, banking and compensation structures, support tickets, candidate resumes, and AI-driven hiring decisions.

The platform exhibits several well-engineered security controls:
* Strict **Prisma ORM parameterization** eliminating SQL injection risks across all endpoints.
* Proper **Zod runtime schema validation** and prompt-boundary encapsulation (`<untrusted_candidate_resume>`) guarding the AI ATS screening engine.
* Pinned **HMAC-SHA256 (`HS256`) JWT verification** rejecting unsigned or algorithm-swapped tokens.
* Automated **test coverage (24/24 passing)** validating resume access RBAC and cache key user isolation.

However, the audit identified **several Critical and High-severity vulnerabilities** that require remediation before production deployment:
1. **Hardcoded Administrative Backdoor**: A hardcoded administrator account (`admin@nexahr.com` / `AdminPassword123!`) embedded in `src/controllers/auth.controller.js` permits unauthenticated access and automatically reactivates deactivated accounts.
2. **Permissive CORS with Credentials**: `src/index.js` returns `callback(null, true)` for arbitrary origins alongside `credentials: true`, allowing cross-origin requests from any site.
3. **Cross-Site Request Forgery (CSRF) on Cookie Auth**: The server accepts JWT authentication from HttpOnly cookies without CSRF tokens or origin checks.
4. **Hardcoded Biometric Secret in Frontend Bundle**: The biometric hardware sync secret (`'nexahr_biometric_hardware_secret_2026'`) is embedded in client JavaScript, allowing anyone to forge clock-in/out records.
5. **Plaintext OTP Logging**: Ephemeral 6-digit OTP codes and password reset links are printed to stdout (`console.log`), exposing them in server log streams.
6. **Public User Enumeration & PII Disclosure**: `/api/auth/forgot-password/check` reveals unmasked phone numbers, emails, full names, and roles to unauthenticated callers.
7. **Missing Trust Proxy & Reverse-Proxy Rate Limit Failures**: Lack of `app.set('trust proxy', 1)` renders rate limiters vulnerable to global Denial of Service on Render.
8. **Vertical Privilege Escalation**: An `HR_MANAGER` can elevate user accounts to `ADMIN` via `PUT /api/employees/:id`.

---

## B. 27-Step Security Checklist Status & Evidence Matrix

| Check # | Focus Domain | Status | Evidence Type | Key Finding / Evidence Reference |
| :---: | :--- | :---: | :---: | :--- |
| **1** | Authentication & Session Management | **FAIL** | Code Inspection | Hardcoded `AdminPassword123!` in `auth.controller.js:35`; fallback JWT secret in `jwt.js:3`; no token revocation on logout. |
| **2** | API Key & Secret Protection | **FAIL** | Code Inspection | `x-hardware-key` hardcoded in `client/src/services/api.js:347` & `Settings.jsx:100`. |
| **3** | Database Security & Supabase Config | **NEEDS REVIEW** | Code Inspection | Prisma connects via direct database URL; Supabase RLS is bypassed by Prisma; direct PostgREST status requires manual dashboard review. |
| **4** | HTTPS Enforcement & Proxy Trust | **FAIL** | Code Inspection | Missing `app.set('trust proxy', 1)` in `src/index.js`; no HTTP->HTTPS redirection middleware. |
| **5** | Password Hashing & Seed Credentials | **FAIL** | Code Inspection | Demo credentials locked in `auth.controller.js:1097`; `mustChangePassword` not enforced by backend middleware. |
| **6** | Server-Side Validation & Mass Assignment | **FAIL** | Code Inspection | Only 4 auth endpoints use `express-validator`; `HR_MANAGER` can assign `ADMIN` role in `employee.controller.js:452`. |
| **7** | Cross-Site Scripting (XSS) & CSP | **FAIL** | Code Inspection | Dynamic `href={iv.link}` in `ATSPipeline.jsx:878` allows `javascript:` execution; frontend `vercel.json` lacks CSP. |
| **8** | Logging, Auditing & PII Redaction | **FAIL** | Code Inspection | Plaintext OTPs printed to stdout in `notification.service.js:855, 917`; lack of audit logging for administrative mutations. |
| **9** | Admin Routes, RBAC & Tenant Isolation | **FAIL** | Code Inspection | `tenant.middleware.js` is an empty stub (`next()`); zero tenant isolation in DB schema; vertical privilege escalation. |
| **10** | SQL Injection Mitigation | **PASS** | Code Inspection | 100% Prisma parameterized queries; single `$queryRaw` is static `SELECT 1` in `src/index.js:135`; whitelisted `orderBy`. |
| **11** | Environment Variables & Info Leakage | **FAIL** | Code Inspection | `/api/health` leaks `error.message` on database failure; `.env.example` contains personal email. |
| **12** | Rate Limiting & DoS Mitigation | **FAIL** | Code Inspection | Missing `trust proxy` breaks IP keys; no rate limits on hardware sync, AI screening sync, or file uploads. |
| **13** | Cross-Origin Resource Sharing (CORS) | **FAIL** | Code Inspection | `src/index.js:78` reflects all origins with `credentials: true`. |
| **14** | Security Headers & Hardening | **FAIL** | Code Inspection | Frontend `client/vercel.json` lacks all security headers; backend Helmet active. |
| **15** | Session & Token Storage | **FAIL** | Code Inspection | JWT token duplicated in `localStorage` (`api.js:66`), vulnerable to XSS theft. |
| **16** | Cross-Site Request Forgery (CSRF) | **FAIL** | Code Inspection | Cookie-based JWT auth accepted with zero anti-CSRF token verification and permissive CORS. |
| **17** | Password Recovery & OTP Verification | **FAIL** | Code Inspection | `/api/auth/forgot-password/check` returns unmasked PII; non-constant-time string compare (`!==`) in `auth.controller.js:712`. |
| **18** | File Uploads & Document Security | **FAIL** | Code Inspection | MIME type verified via client header without magic bytes; `uploadEmployeeDocument` accepts raw unvalidated URLs. |
| **19** | Server-Side Payroll & Computation | **PASS** | Code Inspection | Payroll calculations computed 100% server-side in `payroll.service.js`; upsert compound keys prevent duplication. |
| **20** | Production Debug Mode & Errors | **FAIL** | Code Inspection | Controller catch blocks return raw `error.message` to clients in production. |
| **21** | Dependency Vulnerabilities | **FAIL** | Non-Destructive CLI | `npm audit` reports 12 vulnerabilities on backend (3 Critical, 5 High) and 3 High on client. |
| **22** | Unused Code & Leftover Scripts | **FAIL** | Code Inspection | `scripts/gmail-auth.js` CLI script packaged with production files; dead `tenant.middleware.js`. |
| **23** | Exposed Backups, Dumps & Configs | **PASS** | Code Inspection | No committed `.bak`, `.sql`, or `.git` files; `.env` is properly ignored. |
| **24** | Git History Secret Scanning | **PASS** | Non-Destructive CLI | Full `git log -p` scan found no committed production database passwords or live third-party API tokens. |
| **25** | Compromised Credential Inventory | **FAIL** | Code Inspection | Hardcoded secrets in source files require immediate rotation (`HARDWARE_SECRET_KEY`, default JWT secret). |
| **26** | AI ATS & Gmail Pipeline Surface | **FAIL** | Code Inspection | Unsanitized candidate CVs sent to third-party AI APIs without data minimization; email sender spoofing risk. |
| **27** | Automated Security Protection Tests | **PASS** | Tests Executed | Executed `npm test`: 24/24 unit & security integration tests passed (`aiScreening.test.js`, `atsHardening.test.js`). |

---

## C. Findings Count by Severity

| Severity Level | Count | Definition |
| :--- | :---: | :--- |
| 🔴 **Critical** | **5** | Immediate threat to account integrity, remote access, or total system compromise. |
| 🟠 **High** | **11** | Privilege escalation, data leakage, denial of service, or severe access control bypass. |
| 🟡 **Medium** | **7** | Configuration weaknesses, timing attacks, lack of defense-in-depth, or third-party risks. |
| 🔵 **Low / Informational** | **4** | Minor information disclosures, code hygiene, and header optimizations. |
| **Total Findings** | **27** | |

---

## D. Top 5 Systemic Security Risks

1. **Hardcoded Administrative Backdoor (`auth.controller.js:35-43, 147-195`)**  
   *Risk:* Any user possessing the hardcoded credentials can log into any deployment as a top-level `ADMIN`. If the user does not exist or was deactivated, the code creates or reactivates it with `isActive: true` and bypasses password rotation.
2. **Permissive CORS with Credentials & Missing CSRF Protection (`index.js:71-85`, `auth.middleware.js:14`)**  
   *Risk:* The API allows any origin to send requests with credentials (`callback(null, true)` + `credentials: true`). Because session cookies are accepted without CSRF tokens, an attacker hosting a malicious webpage can execute unauthorized actions (issuing payroll, deleting records, altering profiles) on behalf of logged-in administrators.
3. **Hardware Biometric Secret Leaked in Client Bundle (`client/src/services/api.js:347`)**  
   *Risk:* The private key used to authenticate physical IoT turnstiles and biometric terminals (`x-hardware-key: nexahr_biometric_hardware_secret_2026`) is delivered in the public JavaScript bundle, enabling any user to spoof attendance logs for any employee code.
4. **Plaintext OTP & Password Reset URL Logging (`src/services/notification.service.js:855, 917`)**  
   *Risk:* All 6-digit OTP verification codes and reset URLs are printed directly to stdout via `console.log`. In managed cloud environments (Render, Datadog, Papertrail), logs are frequently accessible to non-admin staff or third-party integrations, nullifying two-factor and recovery security.
5. **Unauthenticated PII Harvesting & User Enumeration (`auth.controller.js:468-485`)**  
   *Risk:* Calling `/api/auth/forgot-password/check` with any email or employee code returns the user's full name, role, employee ID, and unmasked personal phone number, creating a severe GDPR/privacy violation and enabling targeted social engineering.

---

## E. Detailed Vulnerability Findings & Actionable Remediations

---

### Finding 1 [Check 1] — Hardcoded System Administrator Backdoor
* **Severity:** 🔴 Critical (CVSS 9.8)
* **Affected File:** [`src/controllers/auth.controller.js`](file:///d:/NexaHR/src/controllers/auth.controller.js#L35-L43), lines 35–43, 147–195
* **Explanation:** A static credentials object `HARDCODED_SYSTEM_ADMIN` (`admin@nexahr.com` / `AdminPassword123!`) is compiled into backend code. During login, if this email is provided, the controller verifies the plaintext string, forces user creation or reactivation in PostgreSQL, and generates an `ADMIN` JWT.
* **Impact:** Complete administrative takeover of any deployment running this code.
* **Recommended Fix:** Completely remove `HARDCODED_SYSTEM_ADMIN` and its special bypass branch in `login`. Administrators must be created exclusively via the secured initial registration endpoint or database seeding with cryptographically hashed passwords.
* **Secure Code Example:**
  ```javascript
  // Remove lines 35-43 entirely
  // In login(): remove the if (cleanEmail === HARDCODED_SYSTEM_ADMIN.email) block
  // Authenticate exclusively against prisma.user.findUnique
  ```
* **Verification Steps:** Attempt to log in with `admin@nexahr.com` and `AdminPassword123!`; verify that the server returns `401 Invalid credentials.` unless explicitly registered in the database with that password.

---

### Finding 2 [Check 13 & 16] — Permissive CORS with Credentials & Missing CSRF Protection
* **Severity:** 🔴 Critical (CVSS 9.1)
* **Affected File:** [`src/index.js`](file:///d:/NexaHR/src/index.js#L71-L85), lines 71–85; [`src/middlewares/auth.middleware.js`](file:///d:/NexaHR/src/middlewares/auth.middleware.js#L14), lines 14–16
* **Explanation:** Line 78 of `src/index.js` invokes `callback(null, true)` for origins not in `allowedOrigins`. Because `credentials: true` is configured, any third-party domain can make credentialed XMLHttpRequests/fetch requests to the API. In addition, `auth.middleware.js` automatically reads the session token from `req.cookies.token` without validating an anti-CSRF token or verifying the `Origin`/`Sec-Fetch-Site` header.
* **Impact:** Cross-Site Request Forgery (CSRF). Any website visited by an authenticated administrator can submit mutations (e.g. approve leaves, run payroll, onboard employees) using the browser's ambient cookie credentials.
* **Recommended Fix:** 
  1. Enforce strict origin rejection in CORS: reject non-whitelisted origins.
  2. If using cookies, implement anti-CSRF tokens (Double Submit Cookie or custom header such as `X-Requested-With` / `X-CSRF-Token`) and enforce `SameSite=Strict`.
* **Secure Code Example:**
  ```javascript
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS policy'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-hardware-key', 'x-csrf-token'],
    })
  );
  ```
* **Verification Steps:** Run a curl or browser request from origin `https://evil-site.com` with credentials and confirm Express rejects the preflight and GET/POST with a CORS error.

---

### Finding 3 [Check 2] — Biometric Hardware Secret Hardcoded in Frontend Bundle
* **Severity:** 🔴 Critical (CVSS 9.1)
* **Affected File:** [`client/src/services/api.js`](file:///d:/NexaHR/client/src/services/api.js#L347), line 347; [`client/src/pages/app/Settings.jsx`](file:///d:/NexaHR/client/src/pages/app/Settings.jsx#L100), line 100; [`src/controllers/attendance.controller.js`](file:///d:/NexaHR/src/controllers/attendance.controller.js#L12), line 12
* **Explanation:** The header `'x-hardware-key': 'nexahr_biometric_hardware_secret_2026'` is hardcoded in the client API service, and a fallback string matches it in the backend controller.
* **Impact:** Physical attendance integrity failure. Anyone can inspect client source code, extract the key, and forge attendance records for any employee code in the company.
* **Recommended Fix:** 
  1. Remove `syncBiometricHardware` from client-side code (physical hardware devices should talk directly to the backend API, not through the web browser).
  2. Enforce `HARDWARE_SECRET_KEY` strictly from `process.env` without fallback. If unset, the server must fail closed (`500 Misconfigured`).
  3. Compare keys using `crypto.timingSafeEqual`.
* **Verification Steps:** Search the built client bundle (`client/dist`) and verify no occurrences of the hardware key string exist.

---

### Finding 4 [Check 8] — Plaintext 6-Digit OTP and Password Reset Tokens Logged to Stdout
* **Severity:** 🔴 Critical (CVSS 8.6)
* **Affected File:** [`src/services/notification.service.js`](file:///d:/NexaHR/src/services/notification.service.js#L705), lines 704–708, 852–858, 914–920
* **Explanation:** In `notification.service.js`, the plaintext OTP code and reset token URLs are logged directly to the console:
  `console.log(`OTP Verification Code: [ ${otp} ]`);`
* **Impact:** Anyone with read access to server logs (Render dashboard, log drains, CI/CD runners) can intercept valid OTPs and reset tokens, bypassing two-factor authentication and resetting passwords of any user.
* **Recommended Fix:** Redact OTP codes and reset tokens from logs completely. Log only the masked identifier and an event timestamp: `[OTP DISPATCH] Dispatched OTP to ${maskEmail(email)}`.
* **Verification Steps:** Initiate a password recovery request; check stdout and ensure no OTP digits or token query parameters appear in log outputs.

---

### Finding 5 [Check 17] — Unauthenticated User Enumeration & PII Harvesting Endpoint
* **Severity:** 🔴 Critical (CVSS 8.2)
* **Affected File:** [`src/controllers/auth.controller.js`](file:///d:/NexaHR/src/controllers/auth.controller.js#L468-L485), lines 468–485
* **Explanation:** The endpoint `POST /api/auth/forgot-password/check` is completely unauthenticated and returns:
  `{ email: user.email, employeeCode: user.employeeCode, fullName: '...', role: user.role, phone: user.phone }`
* **Impact:** Attackers can enumerate all valid employee emails/IDs and harvest employee full names, internal roles, and personal phone numbers without credentials.
* **Recommended Fix:** Remove `/api/auth/forgot-password/check` entirely or return only masked identifiers (`maskedEmail`, `maskedPhone`) without disclosing whether the account exists or its internal role.
* **Verification Steps:** Send a POST request to `/api/auth/forgot-password/check` with a known email; verify that unmasked phone numbers and full names are never returned.

---

### Finding 6 [Check 1 & Check 25] — Default Fallback JWT Secret in Application Code
* **Severity:** 🟠 High (CVSS 8.5)
* **Affected File:** [`src/utils/jwt.js`](file:///d:/NexaHR/src/utils/jwt.js#L3), line 3; [`src/controllers/auth.controller.js`](file:///d:/NexaHR/src/controllers/auth.controller.js#L736), line 736
* **Explanation:** Both files use `'nexahr_saas_super_secret_jwt_key_2026'` as a default fallback if `process.env.JWT_SECRET` is undefined.
* **Impact:** If `JWT_SECRET` is omitted from the deployment environment, any attacker knowing the source code can forge arbitrary JWT tokens with `{ role: 'ADMIN' }`.
* **Recommended Fix:** Throw an immediate startup exception if `process.env.JWT_SECRET` is missing or shorter than 32 characters.
* **Secure Code Example:**
  ```javascript
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('FATAL: JWT_SECRET environment variable must be set with at least 32 characters.');
  }
  ```
* **Verification Steps:** Start the server with `JWT_SECRET` unset; verify that Express crashes immediately upon boot rather than starting with a fallback key.

---

### Finding 7 [Check 4 & Check 12] — Missing Trust Proxy Configuration Breaks Reverse Proxy Protection
* **Severity:** 🟠 High (CVSS 7.5)
* **Affected File:** [`src/index.js`](file:///d:/NexaHR/src/index.js#L36), line 36
* **Explanation:** Express is not configured with `app.set('trust proxy', 1)`. When running behind Render or Vercel reverse proxies, `req.ip` resolves to the internal load balancer's IP address rather than the client's public IP.
* **Impact:** 
  1. `express-rate-limit` will group all platform users under a single IP address. A single user exhausting 10 failed login attempts triggers a platform-wide lockout for all users (Denial of Service).
  2. Secure cookies (`secure: isProduction`) may fail to be delivered or recognized properly.
* **Recommended Fix:** Add `app.set('trust proxy', 1);` immediately after `const app = express();`.
* **Verification Steps:** Send requests through a proxy with `X-Forwarded-For`; confirm `req.ip` reflects the forwarded client IP.

---

### Finding 8 [Check 6 & Check 9] — Vertical Privilege Escalation via Employee Update
* **Severity:** 🟠 High (CVSS 8.8)
* **Affected File:** [`src/controllers/employee.controller.js`](file:///d:/NexaHR/src/controllers/employee.controller.js#L452), line 452; [`src/routes/employee.routes.js`](file:///d:/NexaHR/src/routes/employee.routes.js#L24), line 24
* **Explanation:** `PUT /api/employees/:id` is accessible to users with the `HR_MANAGER` role. Line 452 permits updating `role`:
  `if (role && ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'].includes(role)) userUpdates.role = role;`
* **Impact:** An `HR_MANAGER` can promote themselves or another user to `ADMIN`, bypassing organizational access separation.
* **Recommended Fix:** Restrict role modifications strictly to users who already possess the `ADMIN` role. An `HR_MANAGER` should only be allowed to modify personal details, departments, and designations.
* **Secure Code Example:**
  ```javascript
  if (role !== undefined) {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only System Administrators can modify user roles.' });
    }
    userUpdates.role = role;
  }
  ```
* **Verification Steps:** Log in as `HR_MANAGER` and attempt to update an employee's role to `ADMIN`; verify that a `403 Forbidden` response is returned.

---

### Finding 9 [Check 5] — Backend Fails to Enforce `mustChangePassword` Requirement
* **Severity:** 🟠 High (CVSS 7.4)
* **Affected File:** [`src/middlewares/auth.middleware.js`](file:///d:/NexaHR/src/middlewares/auth.middleware.js#L5)
* **Explanation:** The database field `User.mustChangePassword` is set to `true` during onboarding. However, no backend middleware inspects this flag. Only the React client displays a modal (`FirstLoginPasswordModal.jsx`).
* **Impact:** An attacker who obtains an initial temporary password can bypass the frontend modal (via curl, Postman, or disabling client JavaScript) and make authenticated calls to all protected API endpoints without ever changing the password.
* **Recommended Fix:** In `verifyToken` middleware, if `user.mustChangePassword === true` and the request is not targeted at `PUT /api/auth/change-password` or `POST /api/auth/logout`, reject the request with `403 Forbidden` and error code `PASSWORD_CHANGE_REQUIRED`.
* **Verification Steps:** Authenticate with a user having `mustChangePassword: true`; verify that direct API calls to `/api/employees` return `403`.

---

### Finding 10 [Check 9] — Non-Existent Multi-Tenant Isolation
* **Severity:** 🟠 High (CVSS 7.5)
* **Affected File:** [`src/middlewares/tenant.middleware.js`](file:///d:/NexaHR/src/middlewares/tenant.middleware.js#L1-L4), lines 1–4; [`prisma/schema.prisma`](file:///d:/NexaHR/prisma/schema.prisma#L1-L10)
* **Explanation:** The middleware `requireTenant` was converted to a no-op: `const requireTenant = (req, res, next) => next();`. Furthermore, `prisma/schema.prisma` contains no `tenantId` columns on any model.
* **Impact:** If deployed as a multi-tenant SaaS application, all customer organizations share the same global tables without tenant scoping, leading to total cross-tenant data compromise.
* **Recommended Fix:** If NexaHR is strictly single-tenant internal software, document this explicitly, remove all misleading references to "multi-tenant" in `package.json` and documentation, and delete the dead `tenant.middleware.js`. If multi-tenancy is intended, add `tenantId` to all models and enforce row-level scoping.
* **Verification Steps:** Verify codebase documentation and scripts accurately reflect single-company deployment architecture.

---

### Finding 11 [Check 15] — JWT Duplicated in LocalStorage Vulnerable to XSS
* **Severity:** 🟠 High (CVSS 7.2)
* **Affected File:** [`client/src/services/api.js`](file:///d:/NexaHR/client/src/services/api.js#L66), line 66; [`client/src/pages/website/Login.jsx`](file:///d:/NexaHR/client/src/pages/website/Login.jsx#L224), line 224
* **Explanation:** The client stores the JWT session token in browser `localStorage.getItem('token')` and transmits it in the `Authorization: Bearer` header.
* **Impact:** Any XSS vulnerability (or rogue browser extension) can read `localStorage` and exfiltrate the JWT.
* **Recommended Fix:** Rely exclusively on the HttpOnly, Secure, SameSite cookie already generated by the server. Remove `localStorage.setItem('token', ...)` and the `Authorization` header injection from the client.
* **Verification Steps:** Check browser `Application -> Local Storage` upon login and verify `token` is absent, while session authentication continues working via HttpOnly cookies.

---

### Finding 12 [Check 14] — Missing Security Headers on Frontend Deployment
* **Severity:** 🟠 High (CVSS 7.0)
* **Affected File:** [`client/vercel.json`](file:///d:/NexaHR/client/vercel.json#L1-L8), lines 1–8
* **Explanation:** `client/vercel.json` contains only route rewrites and zero HTTP response headers.
* **Impact:** The client is vulnerable to Clickjacking (`X-Frame-Options` / `frame-ancestors` missing), MIME sniffing (`X-Content-Type-Options` missing), and lacks a frontend Content Security Policy.
* **Recommended Fix:** Add standard security headers into `client/vercel.json`.
* **Secure Code Example:**
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ]
  }
  ```
* **Verification Steps:** Inspect HTTP response headers of the deployed Vercel frontend using `curl -I https://<app>.vercel.app`.

---

### Finding 13 [Check 18] — Incomplete File MIME Validation in Multer Upload Middleware
* **Severity:** 🟠 High (CVSS 7.1)
* **Affected File:** [`src/middlewares/upload.middleware.js`](file:///d:/NexaHR/src/middlewares/upload.middleware.js#L7-L26), lines 7–26
* **Explanation:** `fileFilter` validates uploads based strictly on `file.mimetype` (`image/jpeg`, `image/png`, etc.). The MIME type is provided directly by the client in the `Content-Type` multipart boundary and can be forged.
* **Impact:** An attacker can upload non-image or polyglot files disguised as JPEGs.
* **Recommended Fix:** Validate magic bytes (file signature) directly from `req.file.buffer` using a library like `file-type` before streaming to Cloudinary or disk.
* **Verification Steps:** Attempt to upload an HTML file with multipart header `Content-Type: image/jpeg`; verify that the backend rejects it based on buffer inspection.

---

### Finding 14 [Check 21] — Critical Vulnerabilities in Third-Party Dependencies
* **Severity:** 🔴 Critical (CVSS 9.1)
* **Affected File:** [`package.json`](file:///d:/NexaHR/package.json), [`client/package.json`](file:///d:/NexaHR/client/package.json)
* **Explanation:** Non-destructive `npm audit` reported:
  * **Backend (12 vulnerabilities):**
    * 🔴 `shell-quote` (via `concurrently`): Command injection (CWE-78, CVSS 8.1).
    * 🔴 `proxy-addr`: IP spoofing via IPv4-mapped IPv6 trust subnet (CWE-290, CVSS 9.1).
    * 🟠 `body-parser`: DoS via trailing bytes after compressed request body (CWE-248, CVSS 7.5).
    * 🟠 `brace-expansion`: Stack exhaustion DoS via uncontrolled recursion (CWE-400, CVSS 7.5).
    * 🟠 `nodemailer`: Regular expression / parser Denial of Service (CWE-400).
    * 🟠 `follow-redirects`: Header leakage on cross-origin redirects.
  * **Frontend (3 vulnerabilities):**
    * 🟠 `vite`: Command execution in Windows launch-editor and file serving outside root.
* **Impact:** Potential remote code execution via development tooling, IP spoofing, and remote Denial of Service.
* **Recommended Fix:** Run `npm audit fix` for non-breaking semver updates, update `concurrently` and `vite` to their latest patched releases, and override nested dependencies.
* **Verification Steps:** Run `npm audit` and confirm zero critical or high severity vulnerabilities remain.

---

### Finding 15 [Check 7] — Dynamic URL in Interview Links Allows Pseudo-Protocol Execution
* **Severity:** 🟡 Medium (CVSS 6.1)
* **Affected File:** [`client/src/pages/app/recruitment/ATSPipeline.jsx`](file:///d:/NexaHR/client/src/pages/app/recruitment/ATSPipeline.jsx#L878), lines 878, 950, 1198; [`client/src/pages/app/recruitment/JobInterview.jsx`](file:///d:/NexaHR/client/src/pages/app/recruitment/JobInterview.jsx#L310), line 310
* **Explanation:** The frontend renders interview links directly in anchor tags: `<a href={iv.link} target="_blank">`. If an interview is scheduled with a link beginning with `javascript:`, clicking the link will execute script in the recruiter's session context.
* **Impact:** Stored Cross-Site Scripting (XSS).
* **Recommended Fix:** Validate that interview URLs strictly begin with `https://` (or specifically `https://meet.google.com/`, `https://teams.microsoft.com/`, `https://zoom.us/`).
* **Verification Steps:** Schedule an interview with link `javascript:alert(1)`; verify that the link is sanitized or rejected upon input.

---

### Finding 16 [Check 17] — Non-Constant-Time OTP Hash Comparison
* **Severity:** 🟡 Medium (CVSS 5.3)
* **Affected File:** [`src/controllers/auth.controller.js`](file:///d:/NexaHR/src/controllers/auth.controller.js#L712), line 712
* **Explanation:** `verifyResetOtp` uses standard string inequality: `if (inputHash !== otpRecord.otpHash)`.
* **Impact:** Measurable execution time differences could theoretically allow an attacker to infer hash character prefixes via high-precision timing attacks.
* **Recommended Fix:** Use `crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(otpRecord.otpHash, 'hex'))`.
* **Verification Steps:** Code inspection confirming `crypto.timingSafeEqual` is employed for hash validation.

---

### Finding 17 [Check 11] — Database Error Message Leakage on Health Check
* **Severity:** 🟡 Medium (CVSS 5.3)
* **Affected File:** [`src/index.js`](file:///d:/NexaHR/src/index.js#L147), line 147
* **Explanation:** When database connectivity fails in `GET /api/health`, the response outputs `{ success: false, status: 'DOWN', error: error.message }`.
* **Impact:** Leaks internal hostnames, PostgreSQL usernames, ports, or network topology to unauthenticated callers.
* **Recommended Fix:** In production, return a generic message: `message: 'Database service is currently unreachable'`.
* **Verification Steps:** Stop the database container and invoke `GET /api/health`; ensure no internal connection strings or driver details are returned.

---

### Finding 18 [Check 26] — Lack of Data Minimization When Calling External AI Models
* **Severity:** 🟡 Medium (CVSS 5.3)
* **Affected File:** [`src/services/aiScreening.service.js`](file:///d:/NexaHR/src/services/aiScreening.service.js#L486), lines 485–487
* **Explanation:** Up to 12,000 characters of raw resume text is transmitted to Google Gemini / OpenAI / Anthropic without stripping candidate personal identifiable information (PII) such as personal phone numbers, physical home addresses, and government ID numbers.
* **Impact:** Potential regulatory exposure under GDPR / CPRA regarding cross-border transmission and processing of employee PII by third-party AI providers.
* **Recommended Fix:** Apply regex sanitization to strip detected phone numbers, email addresses, and postal addresses from `resumeText` before submitting to the AI scoring prompt.
* **Verification Steps:** Inspect outgoing AI payload logs in development; confirm candidate contact identifiers are replaced with generic placeholders (`[REDACTED_PHONE]`).

---

### Finding 19 [Check 6] — Mass-Assignment Vulnerability in Profile Updates
* **Severity:** 🟡 Medium (CVSS 6.5)
* **Affected File:** [`src/controllers/auth.controller.js`](file:///d:/NexaHR/src/controllers/auth.controller.js#L955-L956), lines 955–956
* **Explanation:** In `updateMyProfile`, an employee can supply `departmentId` and `designationId` in the request body, which the backend assigns directly to their profile.
* **Impact:** Any employee can reassign themselves to executive departments or senior designations without administrative authorization.
* **Recommended Fix:** Strip `departmentId` and `designationId` from `updateMyProfile`; allow these fields to be modified only by administrators via `PUT /api/employees/:id`.
* **Verification Steps:** As an employee, submit `PUT /api/auth/profile` with another `departmentId`; verify that the change is ignored.

---

### Finding 20 [Check 9] — Flat JSON File Storage for Document Vault
* **Severity:** 🟡 Medium (CVSS 5.9)
* **Affected File:** [`src/controllers/document.controller.js`](file:///d:/NexaHR/src/controllers/document.controller.js#L10), line 10
* **Explanation:** Issued documents and policies are stored in a local JSON file (`src/data/documents_vault.json`) using synchronous `fs.readFileSync` / `fs.writeFileSync`.
* **Impact:** 
  1. On ephemeral hosting environments like Render or Vercel, server restarts or redeployments will permanently wipe all issued documents and employee uploads.
  2. Concurrent requests can lead to race conditions and corrupt the file.
* **Recommended Fix:** Migrate `Document` and `Policy` storage to relational PostgreSQL tables defined in `prisma/schema.prisma`.
* **Verification Steps:** Create a document; verify persistence occurs in PostgreSQL rather than the local filesystem.

---

### Finding 21 [Check 1] — Lack of Server-Side Token Revocation on Logout
* **Severity:** 🟡 Medium (CVSS 5.4)
* **Affected File:** [`src/controllers/auth.controller.js`](file:///d:/NexaHR/src/controllers/auth.controller.js#L307-L320), lines 307–320
* **Explanation:** `POST /api/auth/logout` only clears the client-side cookie (`res.clearCookie('token')`). If an attacker has copied the JWT (from `localStorage` or headers), the token remains valid until its 1-hour expiration.
* **Impact:** Compromised sessions cannot be terminated immediately upon logout.
* **Recommended Fix:** Maintain a Redis or in-memory TTL blacklist for revoked token `jti` identifiers.
* **Verification Steps:** Log out, then immediately replay the previous token in a `Bearer` header; verify access is rejected.

---

### Finding 22 [Check 12] — Unprotected Critical Endpoints Lacking Dedicated Rate Limits
* **Severity:** 🟡 Medium (CVSS 5.3)
* **Affected File:** [`src/routes/attendance.routes.js`](file:///d:/NexaHR/src/routes/attendance.routes.js#L14), line 14; [`src/routes/recruitment.routes.js`](file:///d:/NexaHR/src/routes/recruitment.routes.js#L34), line 34
* **Explanation:** While general endpoints have a 300 req/15 min limit, high-cost endpoints (`POST /api/attendance/hardware-sync`, `POST /api/recruitment/ai-screening/sync`, `POST /api/recruitment/applications/:id/rescan`) have no specific rate limiters.
* **Impact:** Attackers can flood the AI screening endpoint to exhaust third-party API quotas and generate substantial financial charges.
* **Recommended Fix:** Apply strict rate limiters (e.g. 5 requests per 10 minutes) on AI screening triggers.
* **Verification Steps:** Trigger `/api/recruitment/ai-screening/sync` 6 times rapidly; verify that subsequent requests are throttled with `429 Too Many Requests`.

---

### Finding 23 [Check 20] — Error Message Leakage Across Controller Catch Blocks
* **Severity:** 🔵 Low (CVSS 4.3)
* **Affected File:** Various backend controllers (e.g. `department.controller.js:43`, `leave.controller.js:52`)
* **Explanation:** Many controllers return `error: error.message` in 500 responses without checking `NODE_ENV === 'production'`.
* **Impact:** Database constraint violations, table names, and column types are leaked to callers.
* **Recommended Fix:** Ensure all controller catch blocks delegate to `next(error)` so the centralized sanitized error handler in `src/index.js` handles formatting.
* **Verification Steps:** Trigger a database failure; verify the response contains only `An internal server error occurred.` in production.

---

### Finding 24 [Check 17] — Absence of Cooldown on Password Reset Dispatch
* **Severity:** 🔵 Low (CVSS 4.3)
* **Affected File:** [`src/controllers/auth.controller.js`](file:///d:/NexaHR/src/controllers/auth.controller.js#L502)
* **Explanation:** While an IP-level rate limit of 15 requests exists, there is no per-account cooldown period (e.g. 60 seconds) between successive OTP dispatch requests.
* **Impact:** An attacker could trigger 15 SMS/WhatsApp messages in rapid succession to a victim's phone (SMS bombing / notification flooding).
* **Recommended Fix:** Enforce a minimum 60-second cooldown between OTP requests for the same account.
* **Verification Steps:** Request an OTP twice within 10 seconds for the same account; verify the second attempt is rejected with a cooldown message.

---

### Finding 25 [Check 22] — Standalone OAuth Utility Script in Production Source Tree
* **Severity:** 🔵 Low (CVSS 3.1)
* **Affected File:** [`scripts/gmail-auth.js`](file:///d:/NexaHR/scripts/gmail-auth.js#L1-L76)
* **Explanation:** `scripts/gmail-auth.js` is an interactive CLI script for generating Google OAuth tokens.
* **Impact:** Increases deployment footprint and could be misused if executed in an unauthorized terminal session.
* **Recommended Fix:** Exclude `scripts/` from production Docker / deployment builds.
* **Verification Steps:** Confirm `scripts/` is omitted in the production deployment artifact.

---

### Finding 26 [Check 11] — Personal Email Address Committed to `.env.example`
* **Severity:** 🔵 Informational
* **Affected File:** [`.env.example`](file:///d:/NexaHR/.env.example#L61), line 61
* **Explanation:** `GMAIL_HR_ADDRESS="umairdevelop@gmail.com"` was committed to `.env.example`.
* **Impact:** Minor privacy exposure of developer personal email address.
* **Recommended Fix:** Replace with a generic template placeholder: `GMAIL_HR_ADDRESS="hr@company.com"`.
* **Verification Steps:** Verify `.env.example` contains only placeholder values.

---

### Finding 27 [Check 3] — Database Direct URL SSL Mode Verification
* **Severity:** 🔵 Informational
* **Affected File:** [`.env.example`](file:///d:/NexaHR/.env.example#L7), line 7
* **Explanation:** PostgreSQL connection templates should explicitly recommend `sslmode=require` to prevent unencrypted transit across cloud VPCs.
* **Recommended Fix:** Document `sslmode=require` in connection templates.
* **Verification Steps:** Code inspection of `.env.example`.

---

## F. Recommended Fixes in Priority Order

### Phase 1: Critical & Immediate (Blockers for Production)
1. **Remove Hardcoded Backdoor**: Delete `HARDCODED_SYSTEM_ADMIN` and all bypass logic from `src/controllers/auth.controller.js`.
2. **Harden CORS & Enable CSRF Protection**:
   * Reject non-whitelisted origins in `src/index.js` (`callback(new Error('CORS blocked'))`).
   * Enforce `SameSite=Strict` on cookies and add custom header checks (`X-Requested-With` or `X-CSRF-Token`).
3. **Purge Plaintext OTP Logs**: Remove all `console.log` calls printing raw OTP digits or reset token URLs in `src/services/notification.service.js`.
4. **Remove Hardware Key from Client**: Remove `'x-hardware-key'` from `client/src/services/api.js` and enforce backend verification without fallbacks.
5. **Secure Recovery Endpoint**: Strip unmasked phone numbers, roles, and full names from `/api/auth/forgot-password/check`.

### Phase 2: High Severity (Privilege & Architectural Hardening)
6. **Configure Trust Proxy**: Add `app.set('trust proxy', 1)` to `src/index.js` to ensure rate limiters and secure cookies function behind Render/Vercel.
7. **Fix Vertical Privilege Escalation**: Restrict `role` assignment in `updateEmployee` strictly to `ADMIN` callers.
8. **Enforce Password Change Server-Side**: Add backend middleware rejecting calls when `mustChangePassword === true`.
9. **Eliminate LocalStorage JWT**: Migrate client authentication entirely to HttpOnly cookies.
10. **Add Frontend Security Headers**: Configure CSP and anti-clickjacking headers in `client/vercel.json`.
11. **Update Vulnerable Dependencies**: Run `npm audit fix` and upgrade `concurrently`, `vite`, `proxy-addr`, and `body-parser`.

### Phase 3: Medium & Low Severity
12. **Sanitize Interview URLs**: Enforce `https://` validation on all interview meeting links.
13. **Apply Magic-Byte Upload Validation**: Integrate `file-type` into upload middleware.
14. **Add Specific Rate Limits**: Throttle `/api/recruitment/ai-screening/sync` and `/api/attendance/hardware-sync`.
15. **Migrate Document Vault to PostgreSQL**: Replace flat `documents_vault.json` with a Prisma-backed relational table.
16. **Sanitize Health Check Output**: Ensure `/api/health` does not leak internal driver error details.

---

## G. Suggested Security Testing Plan

To ensure long-term regression protection, the following automated security tests should be added to `src/tests/`:

1. **Authentication & Backdoor Test**:
   * Attempt login with `admin@nexahr.com` and `AdminPassword123!`; assert `401 Unauthorized`.
   * Attempt token generation with empty or short `JWT_SECRET`; assert server throws on startup.
2. **CORS & CSRF Test**:
   * Send request with `Origin: https://attacker.com` to `/api/employees`; assert preflight rejection.
   * Send state-mutating POST with cookie auth without custom header; assert `403 Forbidden`.
3. **RBAC & Privilege Escalation Test**:
   * Authenticate as `HR_MANAGER`; attempt `PUT /api/employees/:id` with `{ role: 'ADMIN' }`; assert `403 Forbidden`.
   * Authenticate as `EMPLOYEE`; attempt `GET /api/payroll/salary-structure/:otherId`; assert `403 Forbidden`.
4. **Password Reset Security Test**:
   * Call `POST /api/auth/forgot-password/check`; assert response body never contains raw phone numbers.
   * Attempt OTP verification 6 times with wrong code; assert OTP is invalidated on attempt 5.
5. **Reverse Proxy & Rate Limit Test**:
   * Simulate multiple IPs via `X-Forwarded-For`; verify each IP maintains independent rate limits when `trust proxy` is enabled.

---

## H. Unresolved Risks & Audit Limitations

1. **Read-Only Constraint**: No active penetration testing or fuzzing was performed against deployed staging/production URLs. All findings are derived from source code analysis, static pattern searches, and local non-destructive unit test runs.
2. **Ephemeral Document Vault**: Storing documents in a flat JSON file on disk represents a high operational risk of data loss on Render/Vercel that must be resolved via a database migration.
3. **Third-Party AI Data Processing**: Compliance with regional privacy mandates (GDPR/HIPAA/CPRA) regarding candidate resumes depends on the data retention policies of Google Cloud / OpenAI / Anthropic.

---

## I. "Needs Manual Action by the Owner" Checklist

The following actions cannot be performed by automated code changes and must be completed by the repository owner in cloud consoles:

* [ ] **Google Cloud Console (Gmail OAuth)**:
  * Review authorized redirect URIs for your OAuth 2.0 Client ID.
  * Rotate `GOOGLE_CLIENT_SECRET` and generate a fresh `GMAIL_REFRESH_TOKEN` via `node scripts/gmail-auth.js`.
* [ ] **Supabase Dashboard**:
  * Verify that PostgreSQL connection strings in Render use `sslmode=require`.
  * In the Supabase API Settings, verify whether the public PostgREST API is exposed. If unused, restrict API access or enable RLS on all tables so public anon keys cannot query tables directly.
* [ ] **Cloudinary Management Console**:
  * In Cloudinary Settings -> Security, verify that the delivery type for `nexahr/resumes` is set to **Authenticated / Private** and that unsigned public URL access is restricted.
* [ ] **Render Environment Settings**:
  * Set `NODE_ENV=production`.
  * Ensure a cryptographically random `JWT_SECRET` (minimum 64 characters) is configured.
  * Ensure a unique `HARDWARE_SECRET_KEY` is configured and configured only on physical biometric terminals.
* [ ] **Vercel Project Settings**:
  * Verify `VITE_API_URL` points to your production backend domain.
  * Enable Vercel Deployment Protection to prevent public access to preview environments containing mock data.

---

*(Report generated and saved as `SECURITY_AUDIT.md`. Code changes remain on hold awaiting owner approval.)*


/**
 * scripts/seed-demo-data.js
 *
 * Seeds a clean, dedicated demo database with realistic sample data:
 * - 2 demo accounts (guest-hr@demo.invalid, guest-employee@demo.invalid)
 * - 15 realistic employees across 4 departments with full profiles & salary structures
 * - 30 days of daily attendance punches
 * - Leave types and leave requests
 * - 3 active job openings and 6 candidate applications with parsed CV text & AI match scores
 * - 15 payslips for the previous month
 * - Company announcements and helpdesk tickets
 *
 * Safety Guards:
 * - REFUSES to run unless target DB is explicitly provided via DEMO_DATABASE_URL
 *   or the explicit flag --i-know-this-is-the-demo-db is passed.
 * - REFUSES to run if the database contains ANY non-demo user (isDemo: false).
 * - Generates cryptographically random non-loginable passwords for demo users.
 * - Never prints real secret values.
 *
 * Usage:
 *   DEMO_DATABASE_URL="postgresql://..." node scripts/seed-demo-data.js
 *   node scripts/seed-demo-data.js --i-know-this-is-the-demo-db
 */

require('dotenv').config();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

async function main() {
  const isDemoDbFlag = process.argv.includes('--i-know-this-is-the-demo-db');
  const targetDbUrl = process.env.DEMO_DATABASE_URL || (isDemoDbFlag ? process.env.DATABASE_URL : null);

  if (!targetDbUrl) {
    console.error('========================================================================');
    console.error('[SAFETY ERROR] No demo database target specified.');
    console.error('To run this seed script, you must either:');
    console.error('  1. Set the DEMO_DATABASE_URL environment variable, OR');
    console.error('  2. Pass the explicit flag: --i-know-this-is-the-demo-db');
    console.error('========================================================================');
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: { url: targetDbUrl },
    },
    log: ['error'],
  });

  try {
    // 1. Safety Guard: Check if target DB contains ANY non-demo user
    const nonDemoUserCount = await prisma.user.count({
      where: { isDemo: false },
    });

    if (nonDemoUserCount > 0) {
      console.error('========================================================================');
      console.error(`[SAFETY REFUSAL] Target database contains ${nonDemoUserCount} non-demo user(s).`);
      console.error('Aborting immediately to protect production/real database.');
      console.error('Demo seeding is ONLY permitted on an empty or dedicated demo database.');
      console.error('========================================================================');
      process.exit(1);
    }

    console.log('[NexaHR Demo Seed] Target database verified safe (0 non-demo users). Seeding demo dataset...');

    // 2. Departments
    const deptNames = [
      { name: 'Engineering', code: 'ENG', description: 'Software engineering, cloud infrastructure & DevOps' },
      { name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee welfare & payroll' },
      { name: 'Marketing', code: 'MKT', description: 'Brand strategy, content marketing & growth' },
      { name: 'Finance & Operations', code: 'FIN', description: 'Financial accounting, compliance & corporate operations' },
    ];

    const departments = [];
    for (const d of deptNames) {
      let dept = await prisma.department.findUnique({ where: { name: d.name } });
      if (!dept) {
        dept = await prisma.department.create({ data: d });
      }
      departments.push(dept);
    }

    // 3. Designations
    const designationsList = [
      { title: 'VP of Software Engineering', departmentId: departments[0].id },
      { title: 'Senior Full-Stack Developer', departmentId: departments[0].id },
      { title: 'DevOps & Cloud Architect', departmentId: departments[0].id },
      { title: 'QA Automation Lead', departmentId: departments[0].id },
      { title: 'HR Lead Manager', departmentId: departments[1].id },
      { title: 'Talent Acquisition Partner', departmentId: departments[1].id },
      { title: 'Brand Marketing Manager', departmentId: departments[2].id },
      { title: 'Financial Controller', departmentId: departments[3].id },
    ];

    const designations = [];
    for (const des of designationsList) {
      let desRecord = await prisma.designation.findFirst({
        where: { title: des.title, departmentId: des.departmentId },
      });
      if (!desRecord) {
        desRecord = await prisma.designation.create({ data: des });
      }
      designations.push(desRecord);
    }

    // 4. Leave Types
    const leaveTypesList = [
      { name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18, isPaid: true },
      { name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 10, isPaid: true },
      { name: 'Casual Leave', code: 'CASUAL', daysAllowed: 8, isPaid: true },
    ];

    const leaveTypes = [];
    for (const lt of leaveTypesList) {
      let rec = await prisma.leaveType.findUnique({ where: { code: lt.code } });
      if (!rec) {
        rec = await prisma.leaveType.create({ data: lt });
      }
      leaveTypes.push(rec);
    }

    // Helper: random high-entropy unprintable password
    const createRandomHash = async () => {
      const secret = crypto.randomBytes(32).toString('hex');
      return await hashPassword(secret);
    };

    // 5. Dedicated Demo Users
    // 5a. Guest HR
    const hrPassHash = await createRandomHash();
    let guestHr = await prisma.user.findUnique({ where: { email: 'guest-hr@demo.invalid' } });
    if (!guestHr) {
      guestHr = await prisma.user.create({
        data: {
          employeeCode: 'DEMO-HR-001',
          email: 'guest-hr@demo.invalid',
          password: hrPassHash,
          firstName: 'Guest',
          lastName: 'HR Admin',
          phone: '+92 300 0000001',
          role: 'ADMIN',
          isActive: true,
          mustChangePassword: false,
          isDemo: true,
          profile: {
            create: {
              departmentId: departments[1].id,
              designationId: designations[4].id,
              joiningDate: new Date('2025-01-15'),
            },
          },
        },
      });
    }

    // 5b. Guest Employee
    const empPassHash = await createRandomHash();
    let guestEmp = await prisma.user.findUnique({ where: { email: 'guest-employee@demo.invalid' } });
    if (!guestEmp) {
      guestEmp = await prisma.user.create({
        data: {
          employeeCode: 'DEMO-EMP-001',
          email: 'guest-employee@demo.invalid',
          password: empPassHash,
          firstName: 'Guest',
          lastName: 'Employee',
          phone: '+92 300 0000002',
          role: 'EMPLOYEE',
          isActive: true,
          mustChangePassword: false,
          isDemo: true,
          profile: {
            create: {
              departmentId: departments[0].id,
              designationId: designations[1].id,
              joiningDate: new Date('2025-03-01'),
            },
          },
        },
      });
    }

    // 6. 15 Realistic Demo Employees
    const sampleEmployees = [
      { code: 'DEMO-EMP-002', first: 'Ayesha', last: 'Khan', email: 'ayesha.khan@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 1, salary: 140000 },
      { code: 'DEMO-EMP-003', first: 'Bilal', last: 'Ahmed', email: 'bilal.ahmed@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 2, salary: 180000 },
      { code: 'DEMO-EMP-004', first: 'Sara', last: 'Malik', email: 'sara.malik@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 3, salary: 120000 },
      { code: 'DEMO-EMP-005', first: 'Tariq', last: 'Mehmood', email: 'tariq.mehmood@demo.invalid', role: 'HR_MANAGER', deptIdx: 1, desIdx: 5, salary: 130000 },
      { code: 'DEMO-EMP-006', first: 'Fatima', last: 'Noor', email: 'fatima.noor@demo.invalid', role: 'EMPLOYEE', deptIdx: 2, desIdx: 6, salary: 125000 },
      { code: 'DEMO-EMP-007', first: 'Hamza', last: 'Ali', email: 'hamza.ali@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 1, salary: 135000 },
      { code: 'DEMO-EMP-008', first: 'Zainab', last: 'Bibi', email: 'zainab.bibi@demo.invalid', role: 'EMPLOYEE', deptIdx: 3, desIdx: 7, salary: 160000 },
      { code: 'DEMO-EMP-009', first: 'Omar', last: 'Farooq', email: 'omar.farooq@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 2, salary: 175000 },
      { code: 'DEMO-EMP-010', first: 'Hira', last: 'Qureshi', email: 'hira.qureshi@demo.invalid', role: 'EMPLOYEE', deptIdx: 2, desIdx: 6, salary: 115000 },
      { code: 'DEMO-EMP-011', first: 'Usman', last: 'Javed', email: 'usman.javed@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 3, salary: 110000 },
      { code: 'DEMO-EMP-012', first: 'Rabia', last: 'Tariq', email: 'rabia.tariq@demo.invalid', role: 'EMPLOYEE', deptIdx: 1, desIdx: 5, salary: 105000 },
      { code: 'DEMO-EMP-013', first: 'Saad', last: 'Rizwan', email: 'saad.rizwan@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 1, salary: 145000 },
      { code: 'DEMO-EMP-014', first: 'Sana', last: 'Sheikh', email: 'sana.sheikh@demo.invalid', role: 'EMPLOYEE', deptIdx: 3, desIdx: 7, salary: 155000 },
      { code: 'DEMO-EMP-015', first: 'Haris', last: 'Munir', email: 'haris.munir@demo.invalid', role: 'EMPLOYEE', deptIdx: 0, desIdx: 2, salary: 190000 },
      { code: 'DEMO-EMP-016', first: 'Mahnoor', last: 'Shah', email: 'mahnoor.shah@demo.invalid', role: 'EMPLOYEE', deptIdx: 2, desIdx: 6, salary: 130000 },
    ];

    const allUsers = [guestHr, guestEmp];

    for (const e of sampleEmployees) {
      let u = await prisma.user.findUnique({ where: { email: e.email } });
      if (!u) {
        const pass = await createRandomHash();
        u = await prisma.user.create({
          data: {
            employeeCode: e.code,
            email: e.email,
            password: pass,
            firstName: e.first,
            lastName: e.last,
            role: e.role,
            isActive: true,
            mustChangePassword: false,
            isDemo: true,
            profile: {
              create: {
                departmentId: departments[e.deptIdx].id,
                designationId: designations[e.desIdx].id,
                joiningDate: new Date('2025-02-01'),
              },
            },
            salaryStructure: {
              create: {
                basicSalary: e.salary,
                housingAllowance: Math.round(e.salary * 0.2),
                transportAllowance: Math.round(e.salary * 0.1),
              },
            },
          },
        });
      }
      allUsers.push(u);
    }

    // 7. Attendance for last 30 days
    const today = new Date();
    let attendanceCount = 0;

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      if (d.getDay() === 0) continue; // Skip Sundays

      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      for (const u of allUsers) {
        const existing = await prisma.attendance.findUnique({
          where: { userId_date: { userId: u.id, date: dateOnly } },
        });

        if (!existing) {
          const checkIn = new Date(dateOnly);
          checkIn.setHours(9, Math.floor(Math.random() * 20), 0);
          const checkOut = new Date(dateOnly);
          checkOut.setHours(17, 30 + Math.floor(Math.random() * 45), 0);
          const totalHours = Number(((checkOut - checkIn) / 3600000).toFixed(2));

          await prisma.attendance.create({
            data: {
              userId: u.id,
              date: dateOnly,
              checkInTime: checkIn,
              checkOutTime: checkOut,
              status: Math.random() > 0.08 ? 'PRESENT' : 'LATE',
              totalHours,
            },
          });
          attendanceCount++;
        }
      }
    }

    // 8. Sample Leave Requests
    let leaveCount = 0;
    const leaveReasons = [
      'Attending family wedding ceremony',
      'Mild fever and medical consultation',
      'Personal urgent family errand',
      'Dental procedure recovery',
    ];

    for (let i = 2; i < 7; i++) {
      const u = allUsers[i];
      const start = new Date(today);
      start.setDate(start.getDate() + (i * 2));
      const end = new Date(start);
      end.setDate(end.getDate() + 2);

      const exists = await prisma.leaveRequest.findFirst({
        where: { userId: u.id },
      });

      if (!exists) {
        await prisma.leaveRequest.create({
          data: {
            userId: u.id,
            leaveTypeId: leaveTypes[i % leaveTypes.length].id,
            startDate: start,
            endDate: end,
            totalDays: 3,
            reason: leaveReasons[i % leaveReasons.length],
            status: i % 2 === 0 ? 'APPROVED' : 'PENDING',
            approvedById: i % 2 === 0 ? guestHr.id : null,
          },
        });
        leaveCount++;
      }
    }

    // 9. Job Openings
    const jobList = [
      {
        jobCode: 'JOB-DEMO-101',
        title: 'Senior Full-Stack Engineer (React / Node)',
        department: 'Engineering',
        location: 'Islamabad HQ (Hybrid)',
        type: 'Full Time',
        experience: '4+ Years',
        salary: 'PKR 250k - 350k',
        status: 'ACTIVE',
        description: 'Leading architecture for modern SaaS modules, microservices, and high-performance databases.',
        requirements: 'Expert React 19, Node.js Express, PostgreSQL, Prisma, Redis cache and distributed queue.',
        skills: ['React', 'Node.js', 'PostgreSQL', 'Prisma', 'TypeScript'],
        urgent: true,
      },
      {
        jobCode: 'JOB-DEMO-102',
        title: 'HR Talent Acquisition Partner',
        department: 'Human Resources',
        location: 'Islamabad HQ',
        type: 'Full Time',
        experience: '3+ Years',
        salary: 'PKR 140k - 190k',
        status: 'ACTIVE',
        description: 'Managing end-to-end technical recruiting pipelines, candidate screening, and onboarding.',
        requirements: 'Proven track record in tech recruiting, ATS workflows, and talent networking.',
        skills: ['Recruitment', 'ATS', 'HR Operations', 'Interviews'],
        urgent: false,
      },
      {
        jobCode: 'JOB-DEMO-103',
        title: 'DevOps & Site Reliability Architect',
        department: 'Engineering',
        location: 'Remote / Hybrid',
        type: 'Full Time',
        experience: '5+ Years',
        salary: 'PKR 300k - 420k',
        status: 'ACTIVE',
        description: 'Hardening multi-cloud deployments, CI/CD automation, monitoring, and zero-trust security.',
        requirements: 'Strong Docker, Kubernetes, Terraform, AWS/GCP, reverse proxy hardening, and observability.',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Security'],
        urgent: true,
      },
    ];

    const jobs = [];
    for (const j of jobList) {
      let job = await prisma.jobOpening.findUnique({ where: { jobCode: j.jobCode } });
      if (!job) {
        job = await prisma.jobOpening.create({ data: j });
      }
      jobs.push(job);
    }

    // 10. Fake Candidates with CV text and AI scores
    const candidates = [
      {
        appId: 'APP-DEMO-201',
        name: 'Kashif Mehmood',
        email: 'kashif.engineer@demo.invalid',
        phone: '+92 321 5550101',
        role: jobs[0].title,
        jobId: jobs[0].id,
        aiScore: 92,
        stage: 'INTERVIEW',
        aiStatus: 'COMPLETED',
        aiSummary: 'Outstanding candidate with 5 years building scalable Node.js and React enterprise architectures. Demonstrates deep understanding of PostgreSQL pooling and high-throughput APIs.',
        resumeSummary: 'Full-Stack Lead with 5+ years experience building cloud applications, automated pipelines, and responsive frontend systems.',
      },
      {
        appId: 'APP-DEMO-202',
        name: 'Nida Arshad',
        email: 'nida.dev@demo.invalid',
        phone: '+92 333 5550202',
        role: jobs[0].title,
        jobId: jobs[0].id,
        aiScore: 84,
        stage: 'SCREENING',
        aiStatus: 'COMPLETED',
        aiSummary: 'Strong frontend focus with 3+ years in React, Tailwind, state management and REST APIs. Good culture fit and solid problem-solving fundamentals.',
        resumeSummary: 'Frontend Specialist focusing on modern React, component libraries, design systems and seamless UX.',
      },
      {
        appId: 'APP-DEMO-203',
        name: 'Waleed Siddiqui',
        email: 'waleed.devops@demo.invalid',
        phone: '+92 345 5550303',
        role: jobs[2].title,
        jobId: jobs[2].id,
        aiScore: 89,
        stage: 'INTERVIEW',
        aiStatus: 'COMPLETED',
        aiSummary: 'Excellent background in Docker containerization, Kubernetes clusters, monitoring, and automated deployment pipelines.',
        resumeSummary: 'DevOps Engineer with 4 years designing automated CI/CD workflows and resilient microservice architectures.',
      },
      {
        appId: 'APP-DEMO-204',
        name: 'Anam Fatima',
        email: 'anam.hr@demo.invalid',
        phone: '+92 312 5550404',
        role: jobs[1].title,
        jobId: jobs[1].id,
        aiScore: 78,
        stage: 'SCREENING',
        aiStatus: 'COMPLETED',
        aiSummary: 'Experienced recruiter with 3 years leading hiring cycles, sourcing technical talent, and coordinating stakeholder reviews.',
        resumeSummary: 'Talent Acquisition Specialist passionate about candidate experience, structured interviewing, and data-driven recruiting.',
      },
      {
        appId: 'APP-DEMO-205',
        name: 'Danish Raza',
        email: 'danish.r@demo.invalid',
        phone: '+92 301 5550505',
        role: jobs[0].title,
        jobId: jobs[0].id,
        aiScore: 58,
        stage: 'REJECTED',
        aiStatus: 'COMPLETED',
        aiSummary: 'Junior developer with foundational JavaScript knowledge but lacks required production experience with PostgreSQL and distributed state.',
        resumeSummary: 'Junior Developer familiar with HTML, CSS, JavaScript, and basic Node.js prototypes.',
      },
      {
        appId: 'APP-DEMO-206',
        name: 'Maryam Tahir',
        email: 'maryam.t@demo.invalid',
        phone: '+92 308 5550606',
        role: jobs[1].title,
        jobId: jobs[1].id,
        aiScore: 86,
        stage: 'OFFER',
        aiStatus: 'COMPLETED',
        aiSummary: 'Proven HR manager with strong communication, onboarding leadership, and thorough understanding of employment laws and benefits.',
        resumeSummary: 'HR Professional with expertise in talent management, payroll coordination, and employee retention programs.',
      },
    ];

    for (const c of candidates) {
      let appRecord = await prisma.jobApplication.findUnique({ where: { applicationId: c.appId } });
      if (!appRecord) {
        await prisma.jobApplication.create({
          data: {
            applicationId: c.appId,
            jobOpeningId: c.jobId,
            name: c.name,
            email: c.email,
            phone: c.phone,
            role: c.role,
            department: 'Engineering',
            location: 'Islamabad HQ',
            experience: '3+ Years',
            stage: c.stage,
            status: 'ACTIVE',
            aiScore: c.aiScore,
            aiStatus: c.aiStatus,
            aiSummary: c.aiSummary,
            resumeSummary: c.resumeSummary,
          },
        });
      }
    }

    // 11. Announcements
    const announcements = [
      {
        title: 'NexaHR Annual Tech Summit 2026',
        category: 'EVENTS',
        priority: 'HIGH',
        content: 'Join us next month for our internal technical summit covering AI innovations, microservice patterns, and 2026 product roadmap.',
        summary: 'Annual company-wide technology summit and hackathon event.',
        author: 'People Operations',
        pinned: true,
      },
      {
        title: 'Updated Hybrid Workplace & Wellness Policy',
        category: 'BENEFITS',
        priority: 'MEDIUM',
        content: 'Our updated wellness allowance and flexible remote guidelines are now effective across all offices. Check your employee portal for details.',
        summary: 'Details regarding flexible remote days and expanded medical wellness coverage.',
        author: 'Human Resources',
        pinned: false,
      },
      {
        title: 'Q4 All-Hands Company Townhall',
        category: 'MEETINGS',
        priority: 'HIGH',
        content: 'All team members are invited to attend the quarterly company-wide all-hands meeting this Friday at 3:00 PM PKT.',
        summary: 'Executive leadership briefing on corporate performance, company milestones, and upcoming hiring targets.',
        author: 'Executive Leadership',
        pinned: true,
      },
    ];

    for (const a of announcements) {
      const exists = await prisma.announcement.findFirst({ where: { title: a.title } });
      if (!exists) {
        await prisma.announcement.create({ data: a });
      }
    }

    // 12. Support & Helpdesk Tickets
    const sampleTickets = [
      {
        ticketNumber: 'TICK-DEMO-801',
        userId: guestEmp.id,
        subject: 'Request for secondary monitor for development workstation',
        category: 'IT_HARDWARE',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        description: 'Kindly provision an additional 27-inch 4K monitor for frontend layout debugging and mobile testing.',
      },
      {
        ticketNumber: 'TICK-DEMO-802',
        userId: allUsers[2].id,
        subject: 'Tax deduction clarification on last month payslip',
        category: 'PAYROLL',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        description: 'Noticed a discrepancy in medical tax rebate on the September payslip. Please verify with accounting.',
      },
      {
        ticketNumber: 'TICK-DEMO-803',
        userId: allUsers[3].id,
        subject: 'Biometric fingerprint reader registration at floor 2 entrance',
        category: 'WORKPLACE',
        priority: 'LOW',
        status: 'OPEN',
        description: 'Newly issued RFID badge occasionally fails on floor 2 turnstile. Please re-sync terminal profile.',
      },
    ];

    for (const t of sampleTickets) {
      const exists = await prisma.ticket.findUnique({ where: { ticketNumber: t.ticketNumber } });
      if (!exists) {
        const ticket = await prisma.ticket.create({ data: t });
        await prisma.ticketReply.create({
          data: {
            ticketId: ticket.id,
            userId: guestHr.id,
            message: 'Your ticket has been acknowledged by People Operations and is currently being processed.',
          },
        });
      }
    }

    // 13. Payslips for previous month
    const prevMonth = today.getMonth() === 0 ? 12 : today.getMonth();
    const prevYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

    for (const u of allUsers) {
      const exists = await prisma.legacyPayslip.findUnique({
        where: { userId_month_year: { userId: u.id, month: prevMonth, year: prevYear } },
      });

      if (!exists) {
        const base = 120000;
        await prisma.legacyPayslip.create({
          data: {
            userId: u.id,
            month: prevMonth,
            year: prevYear,
            basicSalary: base,
            allowances: 30000,
            deductions: 5000,
            netSalary: 145000,
            status: 'PAID',
            paymentDate: new Date(prevYear, prevMonth - 1, 28),
          },
        });
      }
    }

    console.log('========================================================================');
    console.log('[NexaHR Demo Seed SUCCESS] Demo database populated cleanly:');
    console.log(`  - Demo Users: 2 accounts (guest-hr@demo.invalid, guest-employee@demo.invalid)`);
    console.log(`  - Sample Employees: ${sampleEmployees.length} realistic profiles across 4 departments`);
    console.log(`  - Attendance Records: ~${attendanceCount} daily logs over last 30 days`);
    console.log(`  - Leave Requests: ${leaveCount} records`);
    console.log(`  - Job Openings: ${jobs.length} postings`);
    console.log(`  - Job Applications: ${candidates.length} candidates with AI screening scores`);
    console.log(`  - Company Announcements: ${announcements.length} notices`);
    console.log(`  - Support Tickets: ${sampleTickets.length} tickets with admin replies`);
    console.log(`  - Payslips: ${allUsers.length} records generated for previous month`);
    console.log('========================================================================');
  } catch (error) {
    console.error('[NexaHR Demo Seed ERROR]:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


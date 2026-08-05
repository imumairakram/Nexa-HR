const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting NexaHR Database Seeding...');

  // 1. Clear Existing Data
  await prisma.payslip.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.designation.deleteMany();
  await prisma.department.deleteMany();
  await prisma.leaveType.deleteMany();

  console.log('Cleared previous database records.');

  // 2. Hash Default Password
  const defaultPassword = await bcrypt.hash('admin123', 10);

  // 3. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      employeeCode: 'EMP-ADMIN-001',
      email: 'admin@company.com',
      password: defaultPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1 (555) 019-2831',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`Created Admin User: ${adminUser.email}`);

  // 4. Create Departments
  const deptEng = await prisma.department.create({
    data: { name: 'Engineering', code: 'ENG', description: 'Software Development, DevOps & Cloud Systems' },
  });
  const deptHR = await prisma.department.create({
    data: { name: 'Human Resources', code: 'HR', description: 'Talent Acquisition, Employee Welfare & Operations' },
  });
  const deptDesign = await prisma.department.create({
    data: { name: 'Product & Design', code: 'PRD', description: 'UI/UX Design, Product Strategy & Research' },
  });
  const deptFinance = await prisma.department.create({
    data: { name: 'Finance & Accounts', code: 'FIN', description: 'Payroll, Financial Audits & Accounting' },
  });
  const deptMarketing = await prisma.department.create({
    data: { name: 'Sales & Marketing', code: 'MKT', description: 'Brand Strategy, Digital Marketing & Enterprise Sales' },
  });
  console.log('Created 5 Departments.');

  // 5. Create Designations
  const desigVPEng = await prisma.designation.create({
    data: { title: 'VP of Software Engineering', departmentId: deptEng.id },
  });
  const desigSeniorDev = await prisma.designation.create({
    data: { title: 'Senior Full-Stack Engineer', departmentId: deptEng.id },
  });
  const desigHRHead = await prisma.designation.create({
    data: { title: 'HR Lead Manager', departmentId: deptHR.id },
  });
  const desigLeadDesigner = await prisma.designation.create({
    data: { title: 'Lead UI/UX Designer', departmentId: deptDesign.id },
  });
  const desigFinAnalyst = await prisma.designation.create({
    data: { title: 'Senior Financial Analyst', departmentId: deptFinance.id },
  });
  const desigSalesExec = await prisma.designation.create({
    data: { title: 'Enterprise Account Executive', departmentId: deptMarketing.id },
  });
  console.log('Created 6 Designations.');

  // 6. Create Staff Employees
  const employeesData = [
    {
      code: 'EMP-101',
      email: 'sarah.connor@acme.com',
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '+1 (555) 987-6543',
      role: 'ADMIN',
      deptId: deptEng.id,
      desigId: desigVPEng.id,
      salary: 12500,
    },
    {
      code: 'EMP-102',
      email: 'john.doe@acme.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 (555) 800-5550',
      role: 'HR_MANAGER',
      deptId: deptHR.id,
      desigId: desigHRHead.id,
      salary: 8500,
    },
    {
      code: 'EMP-103',
      email: 'alex.mercer@acme.com',
      firstName: 'Alex',
      lastName: 'Mercer',
      phone: '+1 (555) 415-8882',
      role: 'EMPLOYEE',
      deptId: deptEng.id,
      desigId: desigSeniorDev.id,
      salary: 9500,
    },
    {
      code: 'EMP-104',
      email: 'emily.w@acme.com',
      firstName: 'Emily',
      lastName: 'Watson',
      phone: '+1 (555) 212-9994',
      role: 'EMPLOYEE',
      deptId: deptDesign.id,
      desigId: desigLeadDesigner.id,
      salary: 8800,
    },
    {
      code: 'EMP-105',
      email: 'michael.s@acme.com',
      firstName: 'Michael',
      lastName: 'Scott',
      phone: '+1 (555) 570-4211',
      role: 'EMPLOYEE',
      deptId: deptMarketing.id,
      desigId: desigSalesExec.id,
      salary: 7200,
    },
    {
      code: 'EMP-106',
      email: 'david.b@acme.com',
      firstName: 'David',
      lastName: 'Brent',
      phone: '+1 (555) 171-8890',
      role: 'EMPLOYEE',
      deptId: deptFinance.id,
      desigId: desigFinAnalyst.id,
      salary: 7900,
    },
  ];

  const createdUsers = [];

  for (const emp of employeesData) {
    const user = await prisma.user.create({
      data: {
        employeeCode: emp.code,
        email: emp.email,
        password: defaultPassword,
        firstName: emp.firstName,
        lastName: emp.lastName,
        phone: emp.phone,
        role: emp.role,
        isActive: true,
      },
    });

    await prisma.employeeProfile.create({
      data: {
        userId: user.id,
        joiningDate: new Date('2023-01-15'),
        departmentId: emp.deptId,
        designationId: emp.desigId,
        address: '742 Evergreen Terrace, Tech Park, CA',
        emergencyContact: '+1 (555) 000-1122',
      },
    });

    await prisma.salaryStructure.create({
      data: {
        userId: user.id,
        basicSalary: emp.salary * 0.7,
        housingAllowance: emp.salary * 0.15,
        transportAllowance: emp.salary * 0.1,
        otherAllowances: emp.salary * 0.05,
        taxDeductions: emp.salary * 0.08,
      },
    });

    createdUsers.push(user);
  }
  console.log(`Created ${createdUsers.length} staff employees with Profiles & Salary Structures.`);

  // 7. Create Leave Types
  const leaveAnnual = await prisma.leaveType.create({
    data: { name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18, isPaid: true },
  });
  const leaveSick = await prisma.leaveType.create({
    data: { name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 12, isPaid: true },
  });
  const leaveCasual = await prisma.leaveType.create({
    data: { name: 'Casual Leave', code: 'CASUAL', daysAllowed: 8, isPaid: true },
  });
  console.log('Created Leave Types.');

  // 8. Create Attendance Logs for Today & Past Days
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const u of [adminUser, ...createdUsers]) {
    // Today's attendance
    const inTime = new Date(today);
    inTime.setHours(8, 50 + Math.floor(Math.random() * 20), 0);
    const outTime = new Date(today);
    outTime.setHours(17, 30 + Math.floor(Math.random() * 30), 0);

    const isLate = inTime.getMinutes() > 10 && inTime.getHours() >= 9;

    await prisma.attendance.create({
      data: {
        userId: u.id,
        date: today,
        checkInTime: inTime,
        checkOutTime: outTime,
        status: isLate ? 'LATE' : 'PRESENT',
        totalHours: 8.5,
        notes: isLate ? 'Late arrival due to traffic' : 'Biometric Face-ID verified',
      },
    });
  }
  console.log('Seeded Attendance logs.');

  // 9. Create Sample Leave Requests
  await prisma.leaveRequest.create({
    data: {
      userId: createdUsers[2].id, // Alex Mercer
      leaveTypeId: leaveAnnual.id,
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-14'),
      totalDays: 5,
      reason: 'Summer family vacation trip',
      status: 'PENDING',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      userId: createdUsers[3].id, // Emily Watson
      leaveTypeId: leaveSick.id,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-02'),
      totalDays: 2,
      reason: 'Doctor recommended bed rest',
      status: 'APPROVED',
      approvedById: adminUser.id,
    },
  });
  console.log('Seeded Leave Requests.');

  // 10. Seed Payslips for current month
  for (const u of createdUsers) {
    await prisma.payslip.create({
      data: {
        userId: u.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        basicSalary: 6000,
        totalAllowances: 2000,
        taxDeductions: 500,
        unpaidLeaveDays: 0,
        unpaidLeaveDeduction: 0,
        otherDeductions: 100,
        grossSalary: 8000,
        netSalary: 7400,
        status: 'GENERATED',
      },
    });
  }
  console.log('Seeded Payslips.');

  console.log('✅ NexaHR Database Seeding Completed Successfully!');
}

seed()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

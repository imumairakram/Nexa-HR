const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting NexaHR Database Seeding (Clean Baseline System)...');

  // 1. Clear Existing Data
  await prisma.passwordResetOtp.deleteMany();
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

  // 2. Create Departments
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

  // 3. Create Designations
  await prisma.designation.createMany({
    data: [
      { title: 'VP of Software Engineering', departmentId: deptEng.id },
      { title: 'Senior Full-Stack Engineer', departmentId: deptEng.id },
      { title: 'HR Lead Manager', departmentId: deptHR.id },
      { title: 'Lead UI/UX Designer', departmentId: deptDesign.id },
      { title: 'Senior Financial Analyst', departmentId: deptFinance.id },
      { title: 'Enterprise Account Executive', departmentId: deptMarketing.id },
    ],
  });
  console.log('Created 6 Designations.');

  // 4. Create Leave Types
  await prisma.leaveType.createMany({
    data: [
      { name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18, isPaid: true },
      { name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 12, isPaid: true },
      { name: 'Casual Leave', code: 'CASUAL', daysAllowed: 8, isPaid: true },
    ],
  });
  console.log('Created Leave Types.');

  console.log('✅ NexaHR Baseline Seeding Completed (0 Dummy Users Created)!');
}

seed()
  .catch((e) => {
    console.error('Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

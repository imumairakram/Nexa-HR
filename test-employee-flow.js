const prisma = require('./src/config/prisma');
const { hashPassword } = require('./src/utils/password');

async function verifyEmployeeFlow() {
  console.log('--- Testing Employee Flow (Onboarding + Update + Salary Structure) ---');
  try {
    const testCode = 'EMP-TEST-999';
    const testEmail = 'jordan.test@nexahr.internal';

    // Cleanup previous test if any
    await prisma.salaryStructure.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.employeeProfile.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });

    // 1. Simulate Controller Onboarding
    const hashedPassword = await hashPassword('admin123');
    
    // Find or create dept
    let dept = await prisma.department.findFirst({ where: { name: 'Engineering & DevOps' } });
    if (!dept) {
      dept = await prisma.department.create({
        data: { name: 'Engineering & DevOps', code: 'ENG-DEV', description: 'DevOps & Cloud' }
      });
    }

    let desig = await prisma.designation.findFirst({ where: { title: 'Lead AI Engineer' } });
    if (!desig) {
      desig = await prisma.designation.create({
        data: { title: 'Lead AI Engineer', departmentId: dept.id }
      });
    }

    const createdUser = await prisma.user.create({
      data: {
        employeeCode: testCode,
        email: testEmail,
        password: hashedPassword,
        firstName: 'Jordan',
        lastName: 'Hayes',
        phone: '+1 555-9081',
        role: 'ADMIN',
        isActive: true,
      }
    });

    const createdProfile = await prisma.employeeProfile.create({
      data: {
        userId: createdUser.id,
        gender: 'Non-Binary',
        dateOfBirth: new Date('1994-08-20'),
        joiningDate: new Date('2026-08-14'),
        address: 'San Francisco HQ (Floor 4)',
        emergencyContact: 'Taylor (+1 555-1234)',
        departmentId: dept.id,
        designationId: desig.id,
      }
    });

    const createdSalary = await prisma.salaryStructure.create({
      data: {
        userId: createdUser.id,
        basicSalary: 9500,
        housingAllowance: 1500,
        transportAllowance: 600,
        taxDeductions: 1100,
      }
    });

    console.log('✅ 1. Onboarding successful:', {
      name: `${createdUser.firstName} ${createdUser.lastName}`,
      role: createdUser.role,
      code: createdUser.employeeCode,
      dept: dept.name,
      desig: desig.title,
      basicSalary: createdSalary.basicSalary,
      netSalary: createdSalary.basicSalary + createdSalary.housingAllowance + createdSalary.transportAllowance - createdSalary.taxDeductions
    });

    // 2. Test Fetching with Relations
    const fetched = await prisma.user.findUnique({
      where: { id: createdUser.id },
      include: {
        profile: { include: { department: true, designation: true } },
        salaryStructure: true,
      }
    });

    console.log('✅ 2. Fetch with relations successful:', {
      id: fetched.id,
      email: fetched.email,
      department: fetched.profile?.department?.name,
      designation: fetched.profile?.designation?.title,
      salary: fetched.salaryStructure?.basicSalary,
    });

    // 3. Test Profile Update
    const updatedUser = await prisma.user.update({
      where: { id: createdUser.id },
      data: { firstName: 'Jordan Modified', role: 'HR_MANAGER' }
    });

    const updatedProfile = await prisma.employeeProfile.update({
      where: { userId: createdUser.id },
      data: { address: 'Remote (Austin, TX)' }
    });

    const updatedSalary = await prisma.salaryStructure.update({
      where: { userId: createdUser.id },
      data: { basicSalary: 11000 }
    });

    console.log('✅ 3. Profile update successful:', {
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      role: updatedUser.role,
      address: updatedProfile.address,
      basicSalary: updatedSalary.basicSalary,
    });

    // Cleanup
    await prisma.salaryStructure.deleteMany({ where: { userId: createdUser.id } });
    await prisma.employeeProfile.deleteMany({ where: { userId: createdUser.id } });
    await prisma.user.deleteMany({ where: { id: createdUser.id } });

    console.log('✅ 4. Test cleanup completed successfully.');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyEmployeeFlow();

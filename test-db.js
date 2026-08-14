const prisma = require('./src/config/prisma');

async function main() {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          include: {
            department: true,
            designation: true
          }
        },
        salaryStructure: true
      }
    });
    const depts = await prisma.department.findMany({ 
      include: { 
        _count: { select: { profiles: true, designations: true } } 
      } 
    });
    const designations = await prisma.designation.findMany();
    const attendances = await prisma.attendance.count();
    const leaveRequests = await prisma.leaveRequest.count();
    const leaveTypes = await prisma.leaveType.findMany();
    const payslips = await prisma.payslip.count();
    const salaryStructures = await prisma.salaryStructure.count();
    
    console.log('=== DATABASE SUMMARY ===');
    console.log('Total Users:', users.length);
    console.log('Total Departments:', depts.length);
    console.log('Total Designations:', designations.length);
    console.log('Total Leave Types:', leaveTypes.length);
    console.log('Total Attendance Records:', attendances);
    console.log('Total Leave Requests:', leaveRequests);
    console.log('Total Salary Structures:', salaryStructures);
    console.log('Total Payslips:', payslips);
    
    console.log('\n=== USERS IN DATABASE ===');
    users.forEach(u => {
      const dept = u.profile?.department?.name || 'None';
      const desig = u.profile?.designation?.title || 'None';
      const salary = u.salaryStructure?.netSalary ? `$${u.salaryStructure.netSalary}` : 'Not set';
      console.log(`- [${u.role}] ${u.firstName} ${u.lastName} (${u.email}) | Code: ${u.employeeCode} | Dept: ${dept} | Desig: ${desig} | Salary: ${salary}`);
    });

    console.log('\n=== DEPARTMENTS ===');
    depts.forEach(d => {
      console.log(`- ${d.name} (${d.code}) -> ${d._count.profiles} employees, ${d._count.designations} designations`);
    });

    console.log('\n=== LEAVE TYPES ===');
    leaveTypes.forEach(lt => {
      console.log(`- ${lt.name} (Code: ${lt.code}, Days: ${lt.daysAllowed})`);
    });

  } catch (error) {
    console.error('DB_ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


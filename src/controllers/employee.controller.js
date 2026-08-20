const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/password');

const onboardEmployee = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role = 'EMPLOYEE',
      employeeCode,
      gender,
      dateOfBirth,
      joiningDate,
      address,
      emergencyContact,
      departmentId,
      departmentName,
      designationId,
      designationTitle,
      basicSalary,
      salary,
      housingAllowance = 0,
      transportAllowance = 0,
      otherAllowances = 0,
      taxDeductions = 0,
      otherDeductions = 0,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: email, password, firstName, lastName.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanEmpCode = (employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`).trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { employeeCode: cleanEmpCode }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `User with email '${cleanEmail}' or Employee Code '${cleanEmpCode}' already exists.`,
      });
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve Department
      let resolvedDeptId = departmentId || null;
      if (!resolvedDeptId && departmentName) {
        const trimmedDept = departmentName.trim();
        let dept = await tx.department.findFirst({
          where: { name: { equals: trimmedDept, mode: 'insensitive' } },
        });
        if (!dept) {
          const deptCode = trimmedDept.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'DEPT';
          dept = await tx.department.create({
            data: {
              name: trimmedDept,
              code: `${deptCode}-${Math.floor(100 + Math.random() * 900)}`,
              description: `${trimmedDept} Department`,
            },
          });
        }
        resolvedDeptId = dept.id;
      }

      // 2. Resolve Designation
      let resolvedDesigId = designationId || null;
      if (!resolvedDesigId && designationTitle) {
        const trimmedDesig = designationTitle.trim();
        let desig = await tx.designation.findFirst({
          where: { title: { equals: trimmedDesig, mode: 'insensitive' } },
        });
        if (!desig) {
          desig = await tx.designation.create({
            data: {
              title: trimmedDesig,
              departmentId: resolvedDeptId,
              description: trimmedDesig,
            },
          });
        }
        resolvedDesigId = desig.id;
      }

      // 3. Create User
      const validRoles = ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'];
      const resolvedRole = validRoles.includes(role) ? role : 'EMPLOYEE';

      const newUser = await tx.user.create({
        data: {
          employeeCode: cleanEmpCode,
          email: cleanEmail,
          password: hashedPassword,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
          role: resolvedRole,
          isActive: true,
        },
      });

      // 4. Create Employee Profile
      const newProfile = await tx.employeeProfile.create({
        data: {
          userId: newUser.id,
          gender: gender || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          address: address ? address.trim() : null,
          emergencyContact: emergencyContact ? emergencyContact.trim() : null,
          departmentId: resolvedDeptId,
          designationId: resolvedDesigId,
        },
        include: {
          department: { select: { id: true, name: true, code: true } },
          designation: { select: { id: true, title: true } },
        },
      });

      // 5. Create Salary Structure if provided
      const parsedSalary = parseFloat(basicSalary || salary || 0);
      let newSalaryStructure = null;
      if (parsedSalary > 0) {
        newSalaryStructure = await tx.salaryStructure.create({
          data: {
            userId: newUser.id,
            basicSalary: parsedSalary,
            housingAllowance: parseFloat(housingAllowance || 0),
            transportAllowance: parseFloat(transportAllowance || 0),
            otherAllowances: parseFloat(otherAllowances || 0),
            taxDeductions: parseFloat(taxDeductions || 0),
            otherDeductions: parseFloat(otherDeductions || 0),
          },
        });
      }

      return { user: newUser, profile: newProfile, salaryStructure: newSalaryStructure };
    });

    return res.status(201).json({
      success: true,
      message: 'Employee onboarded successfully.',
      data: {
        employee: {
          id: result.user.id,
          employeeCode: result.user.employeeCode,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          phone: result.user.phone,
          role: result.user.role,
          isActive: result.user.isActive,
          profile: result.profile,
          salaryStructure: result.salaryStructure,
        },
      },
    });
  } catch (error) {
    console.error('Error in onboardEmployee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to onboard employee.',
      error: error.message,
    });
  }
};

const getEmployees = async (req, res) => {
  try {
    const { departmentId, designationId, search, page = 1, limit = 100 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = {};

    if (departmentId && departmentId !== 'ALL') {
      whereClause.profile = { departmentId };
    }

    if (designationId) {
      whereClause.profile = { ...whereClause.profile, designationId };
    }

    if (search) {
      const searchTrim = search.trim();
      whereClause.OR = [
        { firstName: { contains: searchTrim, mode: 'insensitive' } },
        { lastName: { contains: searchTrim, mode: 'insensitive' } },
        { email: { contains: searchTrim, mode: 'insensitive' } },
        { employeeCode: { contains: searchTrim, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip,
        take,
        select: {
          id: true,
          employeeCode: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          profile: {
            include: {
              department: { select: { id: true, name: true, code: true } },
              designation: { select: { id: true, title: true } },
            },
          },
          salaryStructure: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        employees: users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (error) {
    console.error('Error in getEmployees:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employees.',
      error: error.message,
    });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeCode: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: {
          include: {
            department: true,
            designation: true,
          },
        },
        salaryStructure: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { employee: user },
    });
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee details.',
      error: error.message,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      employeeCode,
      phone,
      role,
      isActive,
      gender,
      dateOfBirth,
      joiningDate,
      address,
      emergencyContact,
      departmentId,
      departmentName,
      designationId,
      designationTitle,
      basicSalary,
      salary,
      housingAllowance,
      transportAllowance,
      otherAllowances,
      taxDeductions,
      otherDeductions,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, salaryStructure: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Resolve Department if name given
      let resolvedDeptId = departmentId !== undefined ? departmentId : existingUser.profile?.departmentId;
      if (departmentName && !departmentId) {
        const trimmedDept = departmentName.trim();
        let dept = await tx.department.findFirst({
          where: { name: { equals: trimmedDept, mode: 'insensitive' } },
        });
        if (!dept) {
          const deptCode = trimmedDept.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'DEPT';
          dept = await tx.department.create({
            data: {
              name: trimmedDept,
              code: `${deptCode}-${Math.floor(100 + Math.random() * 900)}`,
              description: `${trimmedDept} Department`,
            },
          });
        }
        resolvedDeptId = dept.id;
      }

      // 2. Resolve Designation if title given
      let resolvedDesigId = designationId !== undefined ? designationId : existingUser.profile?.designationId;
      if (designationTitle && !designationId) {
        const trimmedDesig = designationTitle.trim();
        let desig = await tx.designation.findFirst({
          where: { title: { equals: trimmedDesig, mode: 'insensitive' } },
        });
        if (!desig) {
          desig = await tx.designation.create({
            data: {
              title: trimmedDesig,
              departmentId: resolvedDeptId || null,
              description: trimmedDesig,
            },
          });
        }
        resolvedDesigId = desig.id;
      }

      // 3. User Updates
      const userUpdates = {};
      if (firstName) userUpdates.firstName = firstName.trim();
      if (lastName) userUpdates.lastName = lastName.trim();
      if (email) userUpdates.email = email.toLowerCase().trim();
      if (employeeCode) userUpdates.employeeCode = employeeCode.trim();
      if (phone !== undefined) userUpdates.phone = phone ? phone.trim() : null;
      if (role && ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'].includes(role)) userUpdates.role = role;
      if (isActive !== undefined) userUpdates.isActive = Boolean(isActive);

      const updatedUser = await tx.user.update({
        where: { id },
        data: userUpdates,
      });

      // 4. Profile Updates
      const profileUpdates = {};
      if (gender !== undefined) profileUpdates.gender = gender;
      if (dateOfBirth !== undefined) profileUpdates.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (joiningDate !== undefined) profileUpdates.joiningDate = new Date(joiningDate);
      if (address !== undefined) profileUpdates.address = address ? address.trim() : null;
      if (emergencyContact !== undefined) profileUpdates.emergencyContact = emergencyContact ? emergencyContact.trim() : null;
      if (resolvedDeptId !== undefined) profileUpdates.departmentId = resolvedDeptId || null;
      if (resolvedDesigId !== undefined) profileUpdates.designationId = resolvedDesigId || null;

      let updatedProfile = null;
      if (existingUser.profile) {
        updatedProfile = await tx.employeeProfile.update({
          where: { userId: id },
          data: profileUpdates,
          include: { department: true, designation: true },
        });
      } else {
        updatedProfile = await tx.employeeProfile.create({
          data: {
            userId: id,
            ...profileUpdates,
          },
          include: { department: true, designation: true },
        });
      }

      // 5. Salary Structure Updates
      const rawSalary = basicSalary !== undefined ? basicSalary : salary;
      let updatedSalaryStructure = existingUser.salaryStructure;
      if (rawSalary !== undefined || housingAllowance !== undefined || transportAllowance !== undefined || taxDeductions !== undefined) {
        const salaryData = {
          basicSalary: rawSalary !== undefined ? parseFloat(rawSalary || 0) : (existingUser.salaryStructure?.basicSalary || 0),
          housingAllowance: housingAllowance !== undefined ? parseFloat(housingAllowance || 0) : (existingUser.salaryStructure?.housingAllowance || 0),
          transportAllowance: transportAllowance !== undefined ? parseFloat(transportAllowance || 0) : (existingUser.salaryStructure?.transportAllowance || 0),
          otherAllowances: otherAllowances !== undefined ? parseFloat(otherAllowances || 0) : (existingUser.salaryStructure?.otherAllowances || 0),
          taxDeductions: taxDeductions !== undefined ? parseFloat(taxDeductions || 0) : (existingUser.salaryStructure?.taxDeductions || 0),
          otherDeductions: otherDeductions !== undefined ? parseFloat(otherDeductions || 0) : (existingUser.salaryStructure?.otherDeductions || 0),
        };

        if (existingUser.salaryStructure) {
          updatedSalaryStructure = await tx.salaryStructure.update({
            where: { userId: id },
            data: salaryData,
          });
        } else if (salaryData.basicSalary > 0) {
          updatedSalaryStructure = await tx.salaryStructure.create({
            data: {
              userId: id,
              ...salaryData,
            },
          });
        }
      }

      return { user: updatedUser, profile: updatedProfile, salaryStructure: updatedSalaryStructure };
    });

    return res.status(200).json({
      success: true,
      message: 'Employee profile updated successfully.',
      data: {
        employee: {
          id: updated.user.id,
          employeeCode: updated.user.employeeCode,
          email: updated.user.email,
          firstName: updated.user.firstName,
          lastName: updated.user.lastName,
          phone: updated.user.phone,
          role: updated.user.role,
          isActive: updated.user.isActive,
          profile: updated.profile,
          salaryStructure: updated.salaryStructure,
        },
      },
    });
  } catch (error) {
    console.error('Error in updateEmployee:', error);
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    // Delete user and cascading profiles
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: `Employee '${user.firstName} ${user.lastName}' (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete employee.',
      error: error.message,
    });
  }
};

module.exports = {
  onboardEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};


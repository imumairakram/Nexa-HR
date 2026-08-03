const prisma = require('../config/prisma');
const { hashPassword } = require('../utils/password');

/**
 * Onboard a New Employee
 * POST /api/employees
 */
const onboardEmployee = async (req, res) => {
  try {
    const tenantId = req.tenantId;
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
      designationId,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !employeeCode) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: email, password, firstName, lastName, employeeCode.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanEmpCode = employeeCode.trim();

    // Check email uniqueness within tenant
    const existingUser = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: cleanEmail,
        },
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `User with email '${cleanEmail}' already exists in your company.`,
      });
    }

    // Check employee code uniqueness within tenant
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: {
        tenantId_employeeCode: {
          tenantId,
          employeeCode: cleanEmpCode,
        },
      },
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: `Employee Code '${cleanEmpCode}' already exists in your company.`,
      });
    }

    // Verify Department if passed
    if (departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: departmentId, tenantId },
      });
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Invalid department ID.' });
      }
    }

    // Verify Designation if passed
    if (designationId) {
      const desig = await prisma.designation.findFirst({
        where: { id: designationId, tenantId },
      });
      if (!desig) {
        return res.status(404).json({ success: false, message: 'Invalid designation ID.' });
      }
    }

    const hashedPassword = await hashPassword(password);

    // Transaction to create User and EmployeeProfile together
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          tenantId,
          email: cleanEmail,
          password: hashedPassword,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
          role,
          isActive: true,
        },
      });

      const newProfile = await tx.employeeProfile.create({
        data: {
          userId: newUser.id,
          tenantId,
          employeeCode: cleanEmpCode,
          gender: gender || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          address: address ? address.trim() : null,
          emergencyContact: emergencyContact ? emergencyContact.trim() : null,
          departmentId: departmentId || null,
          designationId: designationId || null,
        },
        include: {
          department: { select: { id: true, name: true, code: true } },
          designation: { select: { id: true, title: true } },
        },
      });

      return { user: newUser, profile: newProfile };
    });

    return res.status(201).json({
      success: true,
      message: 'Employee onboarded successfully.',
      data: {
        employee: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          profile: result.profile,
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

/**
 * Get Employees with Filtering & Pagination
 * GET /api/employees
 */
const getEmployees = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { departmentId, designationId, search, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = {
      tenantId,
    };

    if (departmentId) {
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
        { profile: { employeeCode: { contains: searchTrim, mode: 'insensitive' } } },
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

/**
 * Get Employee Profile by User ID
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const user = await prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
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

/**
 * Update Employee Information & Profile
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const {
      firstName,
      lastName,
      phone,
      role,
      isActive,
      gender,
      dateOfBirth,
      joiningDate,
      address,
      emergencyContact,
      departmentId,
      designationId,
    } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { id, tenantId },
      include: { profile: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.',
      });
    }

    // Update User and Profile in transaction
    const updated = await prisma.$transaction(async (tx) => {
      const userUpdates = {};
      if (firstName) userUpdates.firstName = firstName.trim();
      if (lastName) userUpdates.lastName = lastName.trim();
      if (phone !== undefined) userUpdates.phone = phone ? phone.trim() : null;
      if (role) userUpdates.role = role;
      if (isActive !== undefined) userUpdates.isActive = isActive;

      const updatedUser = await tx.user.update({
        where: { id },
        data: userUpdates,
      });

      const profileUpdates = {};
      if (gender !== undefined) profileUpdates.gender = gender;
      if (dateOfBirth !== undefined) profileUpdates.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (joiningDate !== undefined) profileUpdates.joiningDate = new Date(joiningDate);
      if (address !== undefined) profileUpdates.address = address ? address.trim() : null;
      if (emergencyContact !== undefined) profileUpdates.emergencyContact = emergencyContact ? emergencyContact.trim() : null;
      if (departmentId !== undefined) profileUpdates.departmentId = departmentId || null;
      if (designationId !== undefined) profileUpdates.designationId = designationId || null;

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
            tenantId,
            employeeCode: `EMP-${Date.now().toString().slice(-5)}`,
            ...profileUpdates,
          },
          include: { department: true, designation: true },
        });
      }

      return { user: updatedUser, profile: updatedProfile };
    });

    return res.status(200).json({
      success: true,
      message: 'Employee profile updated successfully.',
      data: { employee: updated },
    });
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee profile.',
      error: error.message,
    });
  }
};

module.exports = {
  onboardEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
};

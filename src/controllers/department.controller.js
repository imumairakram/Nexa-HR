const prisma = require('../config/prisma');

/**
 * Create a new Department
 * POST /api/departments
 */
const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const tenantId = req.tenantId;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required.',
      });
    }

    const formattedCode = code.toUpperCase().trim();

    // Check code uniqueness per tenant
    const existing = await prisma.department.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: formattedCode,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Department code '${formattedCode}' already exists in your company.`,
      });
    }

    const department = await prisma.department.create({
      data: {
        tenantId,
        name: name.trim(),
        code: formattedCode,
        description: description ? description.trim() : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      data: { department },
    });
  } catch (error) {
    console.error('Error in createDepartment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create department.',
      error: error.message,
    });
  }
};

/**
 * Get all Departments for current tenant
 * GET /api/departments
 */
const getDepartments = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const departments = await prisma.department.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { profiles: true, designations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { departments },
    });
  } catch (error) {
    console.error('Error in getDepartments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch departments.',
      error: error.message,
    });
  }
};

/**
 * Get single Department by ID
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const department = await prisma.department.findFirst({
      where: { id, tenantId },
      include: {
        designations: true,
        profiles: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { department },
    });
  } catch (error) {
    console.error('Error in getDepartmentById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department.',
      error: error.message,
    });
  }
};

/**
 * Update Department
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    const tenantId = req.tenantId;

    const existing = await prisma.department.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name.trim();
    if (code) dataToUpdate.code = code.toUpperCase().trim();
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;

    const updated = await prisma.department.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: { department: updated },
    });
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update department.',
      error: error.message,
    });
  }
};

/**
 * Delete Department
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const existing = await prisma.department.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { profiles: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    if (existing._count.profiles > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${existing._count.profiles} employee(s) assigned to it.`,
      });
    }

    await prisma.department.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete department.',
      error: error.message,
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};

const prisma = require('../config/prisma');

const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required.',
      });
    }

    const formattedCode = code.toUpperCase().trim();

    const existing = await prisma.department.findUnique({
      where: { code: formattedCode },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Department code '${formattedCode}' already exists.`,
      });
    }

    const department = await prisma.department.create({
      data: {
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

const getDepartments = async (req, res) => {
  try {
    let departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { profiles: true, designations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-seed baseline departments if fewer than 2 exist
    if (departments.length < 2) {
      const baselineDepts = [
        { name: 'Engineering & DevOps', code: 'ENG', description: 'Software Engineering & Infrastructure' },
        { name: 'Product & Design', code: 'PROD', description: 'Product Management & UI/UX Design' },
        { name: 'Finance & Accounting', code: 'FIN', description: 'Payroll, Ledger & Accounting' },
        { name: 'Sales & Marketing', code: 'MKT', description: 'Growth, Marketing & Business Development' },
        { name: 'Customer Support & Operations', code: 'OPS', description: 'Client Success & Operational Support' },
      ];

      for (const dept of baselineDepts) {
        const existing = departments.find((d) => d.code === dept.code || d.name === dept.name);
        if (!existing) {
          try {
            await prisma.department.create({ data: dept });
          } catch (e) {
            // Ignore if concurrently created
          }
        }
      }

      departments = await prisma.department.findMany({
        include: {
          _count: {
            select: { profiles: true, designations: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

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

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
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

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const existing = await prisma.department.findUnique({ where: { id } });
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

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { profiles: true } } },
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
        message: `Cannot delete department. ${existing._count.profiles} employee(s) are assigned to it.`,
      });
    }

    await prisma.department.delete({ where: { id } });

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

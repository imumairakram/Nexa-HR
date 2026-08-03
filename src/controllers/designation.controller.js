const prisma = require('../config/prisma');

/**
 * Create a new Designation
 * POST /api/designations
 */
const createDesignation = async (req, res) => {
  try {
    const { title, departmentId, description } = req.body;
    const tenantId = req.tenantId;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Designation title is required.',
      });
    }

    const trimmedTitle = title.trim();

    // Check title uniqueness per tenant
    const existing = await prisma.designation.findUnique({
      where: {
        tenantId_title: {
          tenantId,
          title: trimmedTitle,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Designation '${trimmedTitle}' already exists in your company.`,
      });
    }

    // Verify department if provided
    if (departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: departmentId, tenantId },
      });
      if (!dept) {
        return res.status(404).json({
          success: false,
          message: 'Specified department not found in your company.',
        });
      }
    }

    const designation = await prisma.designation.create({
      data: {
        tenantId,
        title: trimmedTitle,
        departmentId: departmentId || null,
        description: description ? description.trim() : null,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Designation created successfully.',
      data: { designation },
    });
  } catch (error) {
    console.error('Error in createDesignation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create designation.',
      error: error.message,
    });
  }
};

/**
 * Get all Designations for current tenant
 * GET /api/designations
 */
const getDesignations = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const designations = await prisma.designation.findMany({
      where: { tenantId },
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { profiles: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { designations },
    });
  } catch (error) {
    console.error('Error in getDesignations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch designations.',
      error: error.message,
    });
  }
};

/**
 * Update Designation
 * PUT /api/designations/:id
 */
const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, departmentId, description } = req.body;
    const tenantId = req.tenantId;

    const existing = await prisma.designation.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found.',
      });
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title.trim();
    if (departmentId !== undefined) dataToUpdate.departmentId = departmentId || null;
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;

    const updated = await prisma.designation.update({
      where: { id },
      data: dataToUpdate,
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Designation updated successfully.',
      data: { designation: updated },
    });
  } catch (error) {
    console.error('Error in updateDesignation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update designation.',
      error: error.message,
    });
  }
};

/**
 * Delete Designation
 * DELETE /api/designations/:id
 */
const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId;

    const existing = await prisma.designation.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { profiles: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found.',
      });
    }

    if (existing._count.profiles > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete designation. There are ${existing._count.profiles} employee(s) assigned to it.`,
      });
    }

    await prisma.designation.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Designation deleted successfully.',
    });
  } catch (error) {
    console.error('Error in deleteDesignation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete designation.',
      error: error.message,
    });
  }
};

module.exports = {
  createDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
};

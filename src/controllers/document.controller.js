const prisma = require('../config/prisma');
const {
  createInAppNotification,
  broadcastInAppNotification,
  sendDocumentIssuedEmail,
} = require('../services/notification.service');

// ─── Type-label maps ────────────────────────────────────────────────────────

const ISSUED_TYPE_LABELS = {
  OFFER_LETTER: 'Offer Letter',
  CONTRACT: 'Employment Contract',
  NDA: 'Confidentiality & NDA',
  EXPERIENCE_LETTER: 'Experience & Relieving Letter',
  INCREMENT_LETTER: 'Compensation Revision Letter',
  WARNING_LETTER: 'Performance Advisory Notice',
  CERTIFICATE: 'Professional Certificate',
  CUSTOM: 'Official Document',
};

const POLICY_CATEGORY_LABELS = {
  GOVERNANCE: 'Corporate Governance',
  BENEFITS: 'Benefits & Perks',
  FINANCE: 'Finance & Reimbursement',
  SECURITY: 'InfoSec & Compliance',
  CONDUCT: 'Workplace Conduct',
  LEAVE: 'Leave & Attendance Policy',
};

// ─── Reference-number generator ─────────────────────────────────────────────

function generateRef(prefix, suffix) {
  return `NEXA-${prefix}-${suffix || new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`.toUpperCase();
}

// ─── Helper: format a VaultDocument row for API response ────────────────────

function formatDoc(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    typeLabel: row.typeLabel,
    referenceNumber: row.referenceNumber,
    description: row.description,
    issuer: row.issuer,
    department: row.department,
    designation: row.designation,
    version: row.version,
    status: row.status,
    size: row.size,
    fileUrl: row.fileUrl,
    cloudinaryId: row.cloudinaryId,
    mimeType: row.mimeType,
    // ISSUED fields
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    employeeCode: row.employeeCode,
    employeeEmail: row.employeeEmail,
    expiryDate: row.expiryDate,
    uploadedBy: row.uploadedBy,
    uploadedById: row.uploadedById,
    issueDate: row.createdAt
      ? new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function formatPolicy(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.type,
    categoryLabel: row.typeLabel,
    referenceNumber: row.referenceNumber,
    description: row.description,
    issuer: row.issuer,
    department: row.department,
    version: row.version,
    status: row.status,
    size: row.size,
    fileUrl: row.fileUrl,
    uploadedById: row.uploadedById,
    updated: row.updatedAt
      ? new Date(row.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : null,
    createdAt: row.createdAt,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ISSUED DOCUMENTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/documents/issued
 */
const getIssuedDocuments = async (req, res) => {
  try {
    const { employeeId, type, search } = req.query;
    const userId = req.user?.id || req.user?.userId;
    const isEmployee = req.user?.role === 'EMPLOYEE';

    const where = { kind: 'ISSUED' };

    if (isEmployee) {
      // Employees see only docs issued to them
      where.employeeId = userId;
    } else if (employeeId && employeeId !== 'ALL') {
      where.employeeId = employeeId;
    }

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (search) {
      const q = search.toLowerCase().trim();
      where.OR = [
        { title:           { contains: q, mode: 'insensitive' } },
        { referenceNumber: { contains: q, mode: 'insensitive' } },
        { employeeName:    { contains: q, mode: 'insensitive' } },
        { employeeCode:    { contains: q, mode: 'insensitive' } },
        { department:      { contains: q, mode: 'insensitive' } },
        { type:            { contains: q, mode: 'insensitive' } },
      ];
    }

    const docs = await prisma.vaultDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { documents: docs.map(formatDoc), total: docs.length },
    });
  } catch (error) {
    console.error('Error fetching issued documents:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve issued documents.', error: error.message });
  }
};

/**
 * POST /api/documents/issue
 */
const issueDocument = async (req, res) => {
  try {
    const {
      employeeId,
      type = 'OFFER_LETTER',
      typeLabel,
      title,
      referenceNumber,
      issueDate,
      expiryDate,
      issuer = 'NexaHR People Operations & Talent Acquisition',
      description,
      size = '2.1 MB',
      status = 'VERIFIED',
      fileUrl,
      notifyEmployee = true,
    } = req.body;

    if (!employeeId || !title) {
      return res.status(400).json({ success: false, message: 'Required fields missing: employeeId and title are mandatory.' });
    }

    const uploadedById = req.user?.id || req.user?.userId;

    // Resolve employee details
    let targetUser = null;
    if (employeeId !== 'all') {
      targetUser = await prisma.user.findFirst({
        where: { OR: [{ id: employeeId }, { employeeCode: employeeId }] },
        include: { profile: { include: { department: true, designation: true } } },
      });
    }

    const resolvedName       = targetUser ? `${targetUser.firstName} ${targetUser.lastName}`.trim() : employeeId === 'all' ? 'All Active Employees' : 'Company Team Member';
    const resolvedCode       = targetUser?.employeeCode || (employeeId === 'all' ? 'ALL' : 'EMP-0000');
    const resolvedDepartment = targetUser?.profile?.department?.name || 'Operations';
    const resolvedDesignation = targetUser?.profile?.designation?.title || 'Team Member';
    const resolvedEmail      = targetUser?.email || null;
    const resolvedTypeLabel  = typeLabel || ISSUED_TYPE_LABELS[type] || 'Official Document';
    const refCode            = (referenceNumber || generateRef(type.substring(0, 3), resolvedCode)).toUpperCase();

    const newDoc = await prisma.vaultDocument.create({
      data: {
        kind:            'ISSUED',
        referenceNumber: refCode,
        title:           title.trim(),
        type,
        typeLabel:       resolvedTypeLabel,
        description:     description ? description.trim() : `Official ${resolvedTypeLabel} issued by ${issuer}.`,
        issuer:          issuer.trim(),
        department:      resolvedDepartment,
        designation:     resolvedDesignation,
        status:          status || 'VERIFIED',
        size:            size || '1.8 MB',
        fileUrl:         fileUrl || null,
        employeeId:      targetUser ? targetUser.id : (employeeId === 'all' ? null : null),
        employeeName:    resolvedName,
        employeeCode:    resolvedCode,
        employeeEmail:   resolvedEmail,
        expiryDate:      expiryDate ? new Date(expiryDate) : null,
        notifyEmployee:  Boolean(notifyEmployee),
        uploadedBy:      'HR',
        uploadedById,
      },
    });

    // In-app notification
    if (targetUser?.id) {
      createInAppNotification({
        userId: targetUser.id,
        title: `Official Document Issued: ${newDoc.title}`,
        message: `An official ${resolvedTypeLabel} (Ref: ${refCode}) has been issued to your profile by ${newDoc.issuer}.`,
        type: 'info',
        category: 'GENERAL',
        link: '/employee/documents',
      }).catch((e) => console.warn('Could not create in-app notification:', e.message));
    }

    // Email notification
    if (notifyEmployee && resolvedEmail) {
      sendDocumentIssuedEmail({
        email: resolvedEmail,
        name: resolvedName,
        documentTitle: newDoc.title,
        documentType: resolvedTypeLabel,
        referenceNumber: refCode,
        issuer: newDoc.issuer,
        portalUrl: 'https://nexa-hr-xi.vercel.app/employee/documents',
      }).catch((e) => console.error('[DOCUMENT EMAIL FAILED]', e.message));
    }

    return res.status(201).json({
      success: true,
      message: `Document "${newDoc.title}" issued successfully to ${resolvedName}.`,
      data: { document: formatDoc(newDoc) },
    });
  } catch (error) {
    console.error('Error issuing document:', error);
    return res.status(500).json({ success: false, message: 'Failed to issue document.', error: error.message });
  }
};

/**
 * DELETE /api/documents/issued/:id
 */
const deleteIssuedDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.vaultDocument.findUnique({ where: { id } });

    if (!existing || existing.kind !== 'ISSUED') {
      return res.status(404).json({ success: false, message: 'Document record not found.' });
    }

    // Role check: employees can only delete their own docs
    if (req.user?.role === 'EMPLOYEE') {
      const userId = req.user?.id || req.user?.userId;
      if (existing.employeeId !== userId) {
        return res.status(403).json({ success: false, message: 'You only have permission to delete documents belonging to your personal vault.' });
      }
    }

    await prisma.vaultDocument.delete({ where: { id } });

    return res.status(200).json({ success: true, message: `Document "${existing.title}" successfully removed from vault.` });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete document.', error: error.message });
  }
};

/**
 * POST /api/documents/upload  (employee self-upload)
 */
const uploadEmployeeDocument = async (req, res) => {
  try {
    const { title, type = 'CERTIFICATE', typeLabel, issuer, description, size, fileUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Document title is required.' });
    }

    const userId = req.user?.id || req.user?.userId;

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: { include: { department: true, designation: true } } },
      });
    } catch (err) {
      console.warn('Could not fetch user profile for upload:', err.message);
    }

    const resolvedName       = user ? `${user.firstName} ${user.lastName}`.trim() : req.user?.fullName || 'Employee';
    const resolvedCode       = user?.employeeCode || req.user?.employeeCode || 'EMP';
    const resolvedDept       = user?.profile?.department?.name || 'General';
    const resolvedDesignation = user?.profile?.designation?.title || 'Team Member';
    const resolvedEmail      = user?.email || req.user?.email || null;
    const resolvedTypeLabel  = typeLabel || ISSUED_TYPE_LABELS[type] || 'Professional Certificate';
    const prefix             = (type || 'CRT').substring(0, 3).toUpperCase();
    const refCode            = `NEXA-${prefix}-${resolvedCode}-${Date.now().toString().slice(-4)}`.toUpperCase();

    const newDoc = await prisma.vaultDocument.create({
      data: {
        kind:            'ISSUED',
        referenceNumber: refCode,
        title:           title.trim(),
        type:            type || 'CERTIFICATE',
        typeLabel:       resolvedTypeLabel,
        description:     description ? description.trim() : `Verified ${resolvedTypeLabel} uploaded to NexaHR vault.`,
        issuer:          issuer ? issuer.trim() : 'Verified Self-Submission',
        department:      resolvedDept,
        designation:     resolvedDesignation,
        status:          'VERIFIED',
        size:            size || '1.4 MB',
        fileUrl:         fileUrl || null,
        employeeId:      userId,
        employeeName:    resolvedName,
        employeeCode:    resolvedCode,
        employeeEmail:   resolvedEmail,
        uploadedBy:      'EMPLOYEE',
        uploadedById:    userId,
      },
    });

    broadcastInAppNotification({
      title: `Certificate Uploaded: ${newDoc.title}`,
      message: `${resolvedName} (${resolvedCode}) uploaded a new ${resolvedTypeLabel}.`,
      type: 'info',
      category: 'GENERAL',
      link: '/documents',
    }).catch((e) => console.warn('Broadcast notification error:', e.message));

    return res.status(201).json({
      success: true,
      message: `Document "${newDoc.title}" successfully uploaded and verified in vault.`,
      data: { document: formatDoc(newDoc) },
    });
  } catch (error) {
    console.error('Error uploading employee document:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload document.', error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// COMPANY POLICIES
// ════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/documents/policies
 */
const getCompanyPolicies = async (req, res) => {
  try {
    const policies = await prisma.vaultDocument.findMany({
      where: { kind: 'POLICY' },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { policies: policies.map(formatPolicy), total: policies.length },
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve company policies.', error: error.message });
  }
};

/**
 * POST /api/documents/policies
 */
const publishCompanyPolicy = async (req, res) => {
  try {
    // Only ADMIN and HR_MANAGER may publish policies
    const callerRole = req.user?.role;
    if (!['ADMIN', 'HR_MANAGER'].includes(callerRole)) {
      return res.status(403).json({ success: false, message: 'Only ADMIN and HR_MANAGER may publish company policies.' });
    }

    const {
      title,
      category = 'GOVERNANCE',
      categoryLabel,
      version = `v1.0 (${new Date().getFullYear()})`,
      issuer = 'NexaHR Executive Board',
      department = 'Company-Wide (All Offices)',
      description,
      size = '1.8 MB',
      fileUrl,
      notifyAll = false,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required to publish a corporate policy.' });
    }

    const uploadedById  = req.user?.id || req.user?.userId;
    const refCode       = generateRef(category.substring(0, 3), new Date().getFullYear()).toUpperCase();
    const resolvedLabel = categoryLabel || POLICY_CATEGORY_LABELS[category] || 'Corporate Policy';

    const newPolicy = await prisma.vaultDocument.create({
      data: {
        kind:            'POLICY',
        referenceNumber: refCode,
        title:           title.trim(),
        type:            category,
        typeLabel:       resolvedLabel,
        description:     description.trim(),
        version:         version.trim(),
        issuer:          issuer.trim(),
        department:      department.trim(),
        status:          'ACTIVE',
        size:            size || '1.8 MB',
        fileUrl:         fileUrl || null,
        uploadedBy:      'HR',
        uploadedById,
      },
    });

    if (notifyAll) {
      broadcastInAppNotification({
        title: `New Policy Published: ${newPolicy.title}`,
        message: `An official corporate policy (${resolvedLabel}) has been published for all employees.`,
        type: 'info',
        category: 'GENERAL',
        link: '/employee/documents',
      }).catch((e) => console.warn('Could not broadcast policy notification:', e.message));
    }

    return res.status(201).json({
      success: true,
      message: `Corporate policy "${newPolicy.title}" published successfully.`,
      data: { policy: formatPolicy(newPolicy) },
    });
  } catch (error) {
    console.error('Error publishing policy:', error);
    return res.status(500).json({ success: false, message: 'Failed to publish corporate policy.', error: error.message });
  }
};

/**
 * DELETE /api/documents/policies/:id
 */
const deleteCompanyPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.vaultDocument.findUnique({ where: { id } });

    if (!existing || existing.kind !== 'POLICY') {
      return res.status(404).json({ success: false, message: 'Policy handbook not found.' });
    }

    await prisma.vaultDocument.delete({ where: { id } });

    return res.status(200).json({ success: true, message: `Policy "${existing.title}" successfully deleted.` });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete policy.', error: error.message });
  }
};

module.exports = {
  getIssuedDocuments,
  issueDocument,
  uploadEmployeeDocument,
  deleteIssuedDocument,
  getCompanyPolicies,
  publishCompanyPolicy,
  deleteCompanyPolicy,
};

const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');
const {
  createInAppNotification,
  broadcastInAppNotification,
  sendDocumentIssuedEmail,
} = require('../services/notification.service');

const VAULT_FILE_PATH = path.join(__dirname, '../data/documents_vault.json');

// Default initial company policies (clean initial state)
const DEFAULT_COMPANY_POLICIES = [];

// Default initial issued documents (clean initial state)
const DEFAULT_ISSUED_DOCS = [];

function readVaultData() {
  try {
    if (fs.existsSync(VAULT_FILE_PATH)) {
      const raw = fs.readFileSync(VAULT_FILE_PATH, 'utf8');
      const data = JSON.parse(raw);
      return {
        documents: Array.isArray(data.documents) ? data.documents : [],
        policies: Array.isArray(data.policies) ? data.policies : [],
      };
    }
  } catch (err) {
    console.warn('[DOC VAULT WARNING] Failed to read vault file, initializing defaults:', err.message);
  }

  // Ensure directory exists
  try {
    const dir = path.dirname(VAULT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const initial = {
      documents: [],
      policies: [],
    };
    fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  } catch (writeErr) {
    console.error('[DOC VAULT ERROR] Could not create vault file:', writeErr.message);
    return {
      documents: [],
      policies: [],
    };
  }
}

function writeVaultData(data) {
  try {
    const dir = path.dirname(VAULT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[DOC VAULT ERROR] Failed to persist vault file:', err.message);
  }
}

/**
 * Fetch all issued documents
 * GET /api/documents/issued
 */
const getIssuedDocuments = async (req, res) => {
  try {
    const { employeeId, type, search } = req.query;
    const vault = readVaultData();
    let docs = vault.documents || [];

    // If request is from normal employee, only return documents issued to them or global, or uploaded by them
    if (req.user && req.user.role === 'EMPLOYEE') {
      const userId = req.user.id || req.user.userId;
      const userEmail = (req.user.email || '').toLowerCase();
      const userEmpCode = (req.user.employeeCode || '').toLowerCase();

      docs = docs.filter((d) => {
        if (d.employeeId === 'all') return true;
        if (d.employeeId && d.employeeId === userId) return true;
        if (userEmpCode && d.employeeCode && d.employeeCode.toLowerCase() === userEmpCode) return true;
        if (userEmail && d.employeeEmail && d.employeeEmail.toLowerCase() === userEmail) return true;
        return false;
      });
    } else if (employeeId && employeeId !== 'ALL') {
      docs = docs.filter((d) => d.employeeId === employeeId || d.employeeId === 'all');
    }

    if (type && type !== 'ALL') {
      docs = docs.filter((d) => d.type === type);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      docs = docs.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.referenceNumber?.toLowerCase().includes(q) ||
          d.employeeName?.toLowerCase().includes(q) ||
          d.employeeCode?.toLowerCase().includes(q) ||
          d.department?.toLowerCase().includes(q) ||
          d.type?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        documents: docs,
        total: docs.length,
      },
    });
  } catch (error) {
    console.error('Error fetching issued documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve issued documents.',
      error: error.message,
    });
  }
};

/**
 * Issue a new document to an employee
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
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: employeeId and title are mandatory.',
      });
    }

    // Resolve employee details from Prisma
    let targetUser = null;
    if (employeeId !== 'all') {
      targetUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: employeeId }, { employeeCode: employeeId }],
        },
        include: {
          profile: {
            include: {
              department: true,
              designation: true,
            },
          },
        },
      });
    }

    const resolvedEmployeeName = targetUser
      ? `${targetUser.firstName} ${targetUser.lastName}`.trim()
      : employeeId === 'all'
      ? 'All Active Employees'
      : 'Company Team Member';

    const resolvedEmployeeCode = targetUser?.employeeCode || (employeeId === 'all' ? 'ALL' : 'EMP-0000');
    const resolvedDepartment = targetUser?.profile?.department?.name || 'Operations';
    const resolvedDesignation = targetUser?.profile?.designation?.title || 'Team Member';
    const resolvedEmail = targetUser?.email || null;

    // Type label resolution
    const TYPE_LABELS = {
      OFFER_LETTER: 'Offer Letter',
      CONTRACT: 'Employment Contract',
      NDA: 'Confidentiality & NDA',
      EXPERIENCE_LETTER: 'Experience & Relieving Letter',
      INCREMENT_LETTER: 'Compensation Revision Letter',
      WARNING_LETTER: 'Performance Advisory Notice',
      CERTIFICATE: 'Professional Certificate',
      CUSTOM: 'Official Document',
    };

    const resolvedTypeLabel = typeLabel || TYPE_LABELS[type] || 'Official Document';
    const refCode = (
      referenceNumber || `NEXA-${type.substring(0, 3)}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    ).toUpperCase();

    const formattedDate = issueDate
      ? new Date(issueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newDoc = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      type,
      typeLabel: resolvedTypeLabel,
      referenceNumber: refCode,
      employeeId: targetUser ? targetUser.id : employeeId,
      employeeName: resolvedEmployeeName,
      employeeCode: resolvedEmployeeCode,
      employeeEmail: resolvedEmail,
      department: resolvedDepartment,
      designation: resolvedDesignation,
      issueDate: formattedDate,
      expiryDate: expiryDate || null,
      size: size || '1.8 MB',
      status: status || 'VERIFIED',
      issuer: issuer.trim() || 'NexaHR People Operations',
      description: description ? description.trim() : `Official ${resolvedTypeLabel} issued by ${issuer}.`,
      fileUrl: fileUrl || null,
      createdAt: new Date().toISOString(),
    };

    // Save to Vault
    const vault = readVaultData();
    vault.documents = [newDoc, ...(vault.documents || [])];
    writeVaultData(vault);

    // Create in-app notification for the employee
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

    // Trigger email notification if employee has email and notifyEmployee is true
    if (notifyEmployee && resolvedEmail) {
      sendDocumentIssuedEmail({
        email: resolvedEmail,
        name: resolvedEmployeeName,
        documentTitle: newDoc.title,
        documentType: resolvedTypeLabel,
        referenceNumber: refCode,
        issuer: newDoc.issuer,
        portalUrl: 'https://nexa-hr-xi.vercel.app/employee/documents',
      }).catch((emailErr) => {
        console.error('[DOCUMENT EMAIL FAILED]', emailErr.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: `Document "${newDoc.title}" issued successfully to ${resolvedEmployeeName}.`,
      data: {
        document: newDoc,
      },
    });
  } catch (error) {
    console.error('Error issuing document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to issue document.',
      error: error.message,
    });
  }
};

/**
 * Delete / Revoke an issued document
 * DELETE /api/documents/issued/:id
 */
const deleteIssuedDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const vault = readVaultData();
    const existing = vault.documents.find((d) => d.id === id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Document record not found.',
      });
    }

    // Role check: If EMPLOYEE, verify ownership
    if (req.user && req.user.role === 'EMPLOYEE') {
      const userId = req.user.id || req.user.userId;
      const userEmail = (req.user.email || '').toLowerCase();
      const userEmpCode = (req.user.employeeCode || '').toLowerCase();
      const isOwner =
        existing.employeeId === userId ||
        (userEmpCode && existing.employeeCode && existing.employeeCode.toLowerCase() === userEmpCode) ||
        (userEmail && existing.employeeEmail && existing.employeeEmail.toLowerCase() === userEmail);

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'You only have permission to delete documents belonging to your personal vault.',
        });
      }
    }

    vault.documents = vault.documents.filter((d) => d.id !== id);
    writeVaultData(vault);

    return res.status(200).json({
      success: true,
      message: `Document "${existing.title}" successfully removed from vault.`,
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete document.',
      error: error.message,
    });
  }
};

/**
 * Upload an employee certificate or document
 * POST /api/documents/upload
 */
const uploadEmployeeDocument = async (req, res) => {
  try {
    const {
      title,
      type = 'CERTIFICATE',
      typeLabel,
      issuer,
      description,
      size,
      fileUrl,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document title is required.',
      });
    }

    const userId = req.user.id || req.user.userId;

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            include: {
              department: true,
              designation: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn('Could not fetch user profile details for upload:', err.message);
    }

    const resolvedName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : req.user.fullName || 'Employee';
    const resolvedCode = user?.employeeCode || req.user.employeeCode || 'EMP';
    const resolvedDept = user?.profile?.department?.name || 'General';
    const resolvedDesignation = user?.profile?.designation?.title || 'Team Member';
    const resolvedEmail = user?.email || req.user.email || null;

    const TYPE_LABELS = {
      CERTIFICATE: 'Professional Certificate',
      IDENTIFICATION: 'National ID / Passport',
      CONTRACT: 'Employment Agreement',
      OFFER_LETTER: 'Offer Letter',
      ACADEMIC: 'Academic Degree & Diploma',
      TAX_FORM: 'Tax Form',
      CUSTOM: 'Official Document',
    };

    const resolvedTypeLabel = typeLabel || TYPE_LABELS[type] || 'Professional Certificate';
    const prefix = (type || 'CRT').substring(0, 3).toUpperCase();
    const refCode = `NEXA-${prefix}-${resolvedCode}-${Date.now().toString().slice(-4)}`;

    const newDoc = {
      id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      type: type || 'CERTIFICATE',
      typeLabel: resolvedTypeLabel,
      referenceNumber: refCode,
      employeeId: userId,
      employeeName: resolvedName,
      employeeCode: resolvedCode,
      employeeEmail: resolvedEmail,
      department: resolvedDept,
      designation: resolvedDesignation,
      issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      expiryDate: null,
      size: size || '1.4 MB',
      status: 'VERIFIED',
      issuer: issuer ? issuer.trim() : 'Verified Self-Submission',
      description: description ? description.trim() : `Verified ${resolvedTypeLabel} uploaded to NexaHR vault.`,
      fileUrl: fileUrl || null,
      uploadedBy: 'EMPLOYEE',
      createdAt: new Date().toISOString(),
    };

    const vault = readVaultData();
    vault.documents = [newDoc, ...(vault.documents || [])];
    writeVaultData(vault);

    // Notify HR & Admins
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
      data: {
        document: newDoc,
      },
    });
  } catch (error) {
    console.error('Error uploading employee document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload document.',
      error: error.message,
    });
  }
};

/**
 * Fetch all company policies
 * GET /api/documents/policies
 */
const getCompanyPolicies = async (req, res) => {
  try {
    const vault = readVaultData();
    return res.status(200).json({
      success: true,
      data: {
        policies: vault.policies || [],
        total: (vault.policies || []).length,
      },
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve company policies.',
      error: error.message,
    });
  }
};

/**
 * Publish a new company policy
 * POST /api/documents/policies
 */
const publishCompanyPolicy = async (req, res) => {
  try {
    const {
      title,
      category = 'GOVERNANCE',
      categoryLabel,
      version = 'v1.0 (2026)',
      issuer = 'NexaHR Executive Board',
      department = 'Company-Wide (All Offices)',
      description,
      size = '1.8 MB',
      notifyAll = false,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required to publish a corporate policy.',
      });
    }

    const CATEGORY_LABELS = {
      GOVERNANCE: 'Corporate Governance',
      BENEFITS: 'Benefits & Perks',
      FINANCE: 'Finance & Reimbursement',
      SECURITY: 'InfoSec & Compliance',
      CONDUCT: 'Workplace Conduct',
      LEAVE: 'Leave & Attendance Policy',
    };

    const newPolicy = {
      id: `POL-${Math.floor(10 + Math.random() * 90)}`,
      title: title.trim(),
      category,
      categoryLabel: categoryLabel || CATEGORY_LABELS[category] || 'Corporate Policy',
      version: version.trim() || 'v1.0 (2026)',
      size: size || '1.8 MB',
      updated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      issuer: issuer.trim() || 'NexaHR Executive Board',
      department: department.trim() || 'Company-Wide (All Offices)',
      description: description.trim(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const vault = readVaultData();
    vault.policies = [newPolicy, ...(vault.policies || [])];
    writeVaultData(vault);

    // Optional notification broadcast
    if (notifyAll) {
      broadcastInAppNotification({
        title: `New Policy Published: ${newPolicy.title}`,
        message: `An official corporate policy handbook (${newPolicy.categoryLabel}) has been published for all employees.`,
        type: 'info',
        category: 'GENERAL',
        link: '/employee/documents',
      }).catch((e) => console.warn('Could not broadcast policy notification:', e.message));
    }

    return res.status(201).json({
      success: true,
      message: `Corporate policy "${newPolicy.title}" published successfully.`,
      data: {
        policy: newPolicy,
      },
    });
  } catch (error) {
    console.error('Error publishing policy:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish corporate policy.',
      error: error.message,
    });
  }
};

/**
 * Delete a company policy
 * DELETE /api/documents/policies/:id
 */
const deleteCompanyPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const vault = readVaultData();
    const existing = vault.policies.find((p) => p.id === id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Policy handbook not found.',
      });
    }

    vault.policies = vault.policies.filter((p) => p.id !== id);
    writeVaultData(vault);

    return res.status(200).json({
      success: true,
      message: `Policy "${existing.title}" successfully deleted.`,
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete policy.',
      error: error.message,
    });
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

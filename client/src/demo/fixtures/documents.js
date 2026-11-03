/**
 * client/src/demo/fixtures/documents.js
 * Synthetic Corporate Documents, Policy Vault & Personal Documents
 */

import { DEMO_EMPLOYEES } from './employees.js';

export const DEMO_POLICIES = [
  {
    id: 'pol-01',
    title: 'Enterprise Information Security & Data Governance Policy',
    category: 'COMPLIANCE',
    version: '3.2',
    effectiveDate: '2026-01-01',
    summary: 'Standard governing authentication credentials, device encryption, zero-trust network boundaries, and handling of proprietary intellectual property.',
    downloadUrl: '#',
    fileSize: '1.4 MB',
    author: 'DevOps & Security Guild',
  },
  {
    id: 'pol-02',
    title: 'Hybrid Workforce Attendance & Time Regularization Policy',
    category: 'HR_OPERATIONS',
    version: '2.4',
    effectiveDate: '2026-03-01',
    summary: 'Guidelines on core operating hours (10:00 AM – 4:00 PM core collaboration window), biometric verification, and time-off request SLA windows.',
    downloadUrl: '#',
    fileSize: '820 KB',
    author: 'Human Resources Division',
  },
  {
    id: 'pol-03',
    title: 'Comprehensive Health Insurance, Outpatient & OPD Coverage Handbook',
    category: 'BENEFITS',
    version: '4.0',
    effectiveDate: '2026-06-01',
    summary: 'Exhaustive listing of panel hospitals, direct cashless hospitalization procedures, and annual OPD claim reimbursement limits.',
    downloadUrl: '#',
    fileSize: '2.8 MB',
    author: 'People Operations',
  },
  {
    id: 'pol-04',
    title: 'Corporate Code of Conduct & Anti-Harassment Framework',
    category: 'GOVERNANCE',
    version: '2.0',
    effectiveDate: '2025-01-01',
    summary: 'Zero-tolerance policy on workplace harassment, conflict-of-interest disclosures, and anonymous whistleblowing escalation paths.',
    downloadUrl: '#',
    fileSize: '650 KB',
    author: 'Legal & Executive Committee',
  },
];

export const DEMO_ISSUED_DOCUMENTS = [
  {
    id: 'doc-01',
    documentTitle: 'Permanent Employment Contract & Appointment Letter',
    documentType: 'EMPLOYMENT_CONTRACT',
    userId: 'usr-demo-emp-02', // Gabriel Ross
    user: DEMO_EMPLOYEES[1],
    issuedDate: '2024-04-15T00:00:00.000Z',
    status: 'ACTIVE_SIGNED',
    fileSize: '450 KB',
    downloadUrl: '#',
  },
  {
    id: 'doc-02',
    documentTitle: 'Proprietary Inventions & Confidential Information Agreement (NDA)',
    documentType: 'NDA',
    userId: 'usr-demo-emp-02',
    user: DEMO_EMPLOYEES[1],
    issuedDate: '2024-04-15T00:00:00.000Z',
    status: 'ACTIVE_SIGNED',
    fileSize: '320 KB',
    downloadUrl: '#',
  },
  {
    id: 'doc-03',
    documentTitle: 'Annual Merit Compensation Adjustment Notice 2026',
    documentType: 'SALARY_REVISION',
    userId: 'usr-demo-emp-02',
    user: DEMO_EMPLOYEES[1],
    issuedDate: '2026-07-01T00:00:00.000Z',
    status: 'ACKNOWLEDGED',
    fileSize: '180 KB',
    downloadUrl: '#',
  },
  {
    id: 'doc-04',
    documentTitle: 'Standard Workstation Equipment Handover Receipt',
    documentType: 'ASSET_HANDOVER',
    userId: 'usr-demo-emp-02',
    user: DEMO_EMPLOYEES[1],
    issuedDate: '2024-04-16T00:00:00.000Z',
    status: 'SIGNED',
    fileSize: '210 KB',
    downloadUrl: '#',
  },
];

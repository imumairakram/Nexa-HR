/**
 * client/src/demo/fixtures/departments.js
 * Synthetic Departments & Designations Fixture (zero real data, all @demo.invalid)
 */

export const DEMO_DEPARTMENTS = [
  {
    id: 'dept-eng-01',
    name: 'Engineering & DevOps',
    code: 'ENG',
    description: 'Cloud infrastructure, platform scalability, and core software engineering.',
    headName: 'Marcus Brody',
    headEmail: 'marcus.brody@demo.invalid',
    employeeCount: 5,
    budget: 450000,
    createdAt: '2025-01-15T09:00:00.000Z',
    designations: [
      { id: 'desig-01', title: 'VP of Software Engineering', code: 'VP-ENG', totalPositions: 1 },
      { id: 'desig-02', title: 'Senior Software Engineer', code: 'SR-SWE', totalPositions: 2 },
      { id: 'desig-03', title: 'Full-Stack Developer', code: 'FS-DEV', totalPositions: 2 },
      { id: 'desig-04', title: 'Cloud Infrastructure Lead', code: 'DEVOPS-LEAD', totalPositions: 1 },
    ],
  },
  {
    id: 'dept-hr-02',
    name: 'Human Resources',
    code: 'HR',
    description: 'People operations, talent acquisition, culture, and corporate compliance.',
    headName: 'Alexander Hayes',
    headEmail: 'alexander.hayes@demo.invalid',
    employeeCount: 3,
    budget: 180000,
    createdAt: '2025-01-15T09:00:00.000Z',
    designations: [
      { id: 'desig-05', title: 'HR Operations Lead', code: 'HR-LEAD', totalPositions: 1 },
      { id: 'desig-06', title: 'Talent Acquisition Manager', code: 'TA-MGR', totalPositions: 1 },
      { id: 'desig-07', title: 'HR Generalist', code: 'HR-GEN', totalPositions: 1 },
    ],
  },
  {
    id: 'dept-fin-03',
    name: 'Finance & Accounts',
    code: 'FIN',
    description: 'Payroll disbursement, financial auditing, tax filing, and fiscal planning.',
    headName: 'Beatrice Vance',
    headEmail: 'beatrice.vance@demo.invalid',
    employeeCount: 2,
    budget: 160000,
    createdAt: '2025-01-15T09:00:00.000Z',
    designations: [
      { id: 'desig-08', title: 'Finance Director', code: 'FIN-DIR', totalPositions: 1 },
      { id: 'desig-09', title: 'Senior Payroll Specialist', code: 'PAY-SPEC', totalPositions: 1 },
    ],
  },
  {
    id: 'dept-prod-04',
    name: 'Product & Design',
    code: 'PRD',
    description: 'User experience research, interface systems, and product roadmaps.',
    headName: 'Cameron Diaz',
    headEmail: 'cameron.diaz@demo.invalid',
    employeeCount: 3,
    budget: 220000,
    createdAt: '2025-01-15T09:00:00.000Z',
    designations: [
      { id: 'desig-10', title: 'Lead Product Designer', code: 'LEAD-UI', totalPositions: 1 },
      { id: 'desig-11', title: 'Product Manager', code: 'PM-CORE', totalPositions: 1 },
      { id: 'desig-12', title: 'UX Research Specialist', code: 'UX-SPEC', totalPositions: 1 },
    ],
  },
  {
    id: 'dept-ops-05',
    name: 'Operations & Facilities',
    code: 'OPS',
    description: 'Corporate logistics, workspace security, and internal support operations.',
    headName: 'Ethan Cole',
    headEmail: 'ethan.cole@demo.invalid',
    employeeCount: 2,
    budget: 140000,
    createdAt: '2025-01-15T09:00:00.000Z',
    designations: [
      { id: 'desig-13', title: 'Operations Director', code: 'OPS-DIR', totalPositions: 1 },
      { id: 'desig-14', title: 'Facilities Coordinator', code: 'FAC-COORD', totalPositions: 1 },
    ],
  },
];

export const DEMO_DESIGNATIONS = DEMO_DEPARTMENTS.flatMap((d) =>
  d.designations.map((desig) => ({
    ...desig,
    departmentId: d.id,
    department: { id: d.id, name: d.name, code: d.code },
    description: `${desig.title} in the ${d.name} division.`,
    createdAt: '2025-01-15T09:00:00.000Z',
    updatedAt: '2025-01-15T09:00:00.000Z',
  }))
);


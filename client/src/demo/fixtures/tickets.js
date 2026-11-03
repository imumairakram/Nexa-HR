/**
 * client/src/demo/fixtures/tickets.js
 * Synthetic Helpdesk Tickets & Discussion Logs
 */

import { DEMO_EMPLOYEES } from './employees.js';

export const DEMO_TICKETS = [
  {
    id: 'tkt-01',
    ticketNumber: 'TKT-2026-101',
    subject: 'Request for secondary 4K IPS display for engineering workstation',
    category: 'IT_HARDWARE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    description: 'Requesting an additional high-resolution monitor for multi-screen debugging and frontend layout QA testing.',
    userId: 'usr-demo-emp-02', // Gabriel Ross (Guest Employee)
    user: DEMO_EMPLOYEES[1],
    assignedTo: 'Ethan Cole',
    replies: [
      {
        id: 'rep-01',
        senderName: 'Gabriel Ross',
        senderRole: 'EMPLOYEE',
        message: 'Desk location is F-7 Innovation Wing, Row 4.',
        createdAt: '2026-10-29T10:00:00.000Z',
      },
      {
        id: 'rep-02',
        senderName: 'Ethan Cole',
        senderRole: 'ADMIN',
        message: 'Procurement approved. Display will be delivered to your desk by Wednesday.',
        createdAt: '2026-10-30T14:30:00.000Z',
      },
    ],
    createdAt: '2026-10-29T09:30:00.000Z',
    updatedAt: '2026-10-30T14:30:00.000Z',
  },
  {
    id: 'tkt-02',
    ticketNumber: 'TKT-2026-102',
    subject: 'Inquiry regarding withholding tax slab calculation for October payslip',
    category: 'PAYROLL',
    priority: 'LOW',
    status: 'RESOLVED',
    description: 'Looking to clarify the exact bracket shift on the tax deduction line after annual compensation review.',
    userId: 'usr-demo-emp-02', // Gabriel Ross
    user: DEMO_EMPLOYEES[1],
    assignedTo: 'Beatrice Vance',
    replies: [
      {
        id: 'rep-03',
        senderName: 'Beatrice Vance',
        senderRole: 'ADMIN',
        message: 'Your calculation reflects the revised FBR salaried tier above 3.2M annual slab. A detailed worksheet has been placed in your documents tab.',
        createdAt: '2026-10-26T16:00:00.000Z',
      },
    ],
    createdAt: '2026-10-25T11:00:00.000Z',
    updatedAt: '2026-10-26T16:00:00.000Z',
  },
  {
    id: 'tkt-03',
    ticketNumber: 'TKT-2026-103',
    subject: 'VPN remote access credentials certificate expiration renewal',
    category: 'IT_INFRASTRUCTURE',
    priority: 'HIGH',
    status: 'OPEN',
    description: 'WireGuard remote connection profile certificate is scheduled to expire in 48 hours.',
    userId: 'usr-demo-04',
    user: DEMO_EMPLOYEES[3],
    assignedTo: 'Isaac Newton',
    replies: [],
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'tkt-04',
    ticketNumber: 'TKT-2026-104',
    subject: 'Access card magnetic strip demagnetized replacement request',
    category: 'FACILITIES',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    description: 'Building entrance turnstile fails to detect NFC chip on badge.',
    userId: 'usr-demo-11',
    user: DEMO_EMPLOYEES[10],
    assignedTo: 'Nora Jones',
    replies: [],
    createdAt: '2026-10-21T10:00:00.000Z',
    updatedAt: '2026-10-22T09:00:00.000Z',
  },
];

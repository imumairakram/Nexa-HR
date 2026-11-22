/**
 * client/src/demo/fixtures/leaves.js
 * Synthetic Leave Types, Balances & Requests
 */

import { DEMO_EMPLOYEES } from './employees.js';

export const DEMO_LEAVE_TYPES = [
  {
    id: 'lt-annual-01',
    name: 'Annual Paid Vacation',
    code: 'ANNUAL',
    daysAllowed: 20,
    paid: true,
    requiresApproval: true,
    description: 'Accrued annual statutory paid vacation time for full-time personnel.',
    color: '#0D9488', // Teal
  },
  {
    id: 'lt-casual-02',
    name: 'Casual / Personal Leave',
    code: 'CASUAL',
    daysAllowed: 10,
    paid: true,
    requiresApproval: true,
    description: 'Ad-hoc emergency personal time off and urgent personal business.',
    color: '#3B82F6', // Blue
  },
  {
    id: 'lt-sick-03',
    name: 'Medical & Sick Leave',
    code: 'SICK',
    daysAllowed: 12,
    paid: true,
    requiresApproval: true,
    description: 'Medical recuperation and doctor appointments with certified note.',
    color: '#EF4444', // Rose / Red
  },
];

export const DEMO_LEAVE_REQUESTS = [
  {
    id: 'lr-101',
    userId: 'usr-demo-emp-02', // Gabriel Ross (Guest Employee)
    user: DEMO_EMPLOYEES[1],
    leaveTypeId: 'lt-annual-01',
    leaveType: DEMO_LEAVE_TYPES[0],
    startDate: '2026-11-15T00:00:00.000Z',
    endDate: '2026-11-18T00:00:00.000Z',
    days: 4,
    totalDays: 4,
    reason: 'Family trip and personal recuperation time.',
    status: 'APPROVED',
    approverNote: 'Approved. Enjoy your time off!',
    approvedBy: 'Alexander Hayes',
    createdAt: '2026-10-28T10:15:00.000Z',
  },
  {
    id: 'lr-102',
    userId: 'usr-demo-emp-02', // Gabriel Ross
    leaveTypeId: 'lt-sick-03',
    leaveType: DEMO_LEAVE_TYPES[2],
    startDate: '2026-10-10T00:00:00.000Z',
    endDate: '2026-10-11T00:00:00.000Z',
    days: 2,
    totalDays: 2,
    reason: 'Seasonal viral flu and rest.',
    status: 'APPROVED',
    approverNote: 'Medical documentation received.',
    approvedBy: 'Alexander Hayes',
    createdAt: '2026-10-09T08:30:00.000Z',
  },
  {
    id: 'lr-103',
    userId: 'usr-demo-04', // Fiona Gallagher
    user: DEMO_EMPLOYEES[3],
    leaveTypeId: 'lt-casual-02',
    leaveType: DEMO_LEAVE_TYPES[1],
    startDate: '2026-11-08T00:00:00.000Z',
    endDate: '2026-11-08T00:00:00.000Z',
    days: 1,
    totalDays: 1,
    reason: 'Relocation assistance and home utility inspection.',
    status: 'PENDING',
    approverNote: null,
    approvedBy: null,
    createdAt: '2026-11-01T14:20:00.000Z',
  },
  {
    id: 'lr-104',
    userId: 'usr-demo-10', // Cameron Diaz
    user: DEMO_EMPLOYEES[9],
    leaveTypeId: 'lt-annual-01',
    leaveType: DEMO_LEAVE_TYPES[0],
    startDate: '2026-11-20T00:00:00.000Z',
    endDate: '2026-11-24T00:00:00.000Z',
    days: 5,
    totalDays: 5,
    reason: 'Annual family holiday.',
    status: 'PENDING',
    approverNote: null,
    approvedBy: null,
    createdAt: '2026-11-02T09:00:00.000Z',
  },
  {
    id: 'lr-105',
    userId: 'usr-demo-09', // Kevin Flynn
    user: DEMO_EMPLOYEES[8],
    leaveTypeId: 'lt-casual-02',
    leaveType: DEMO_LEAVE_TYPES[1],
    startDate: '2026-09-12T00:00:00.000Z',
    endDate: '2026-09-12T00:00:00.000Z',
    days: 1,
    totalDays: 1,
    reason: 'Urgent family engagement.',
    status: 'APPROVED',
    approverNote: 'Approved.',
    approvedBy: 'Alexander Hayes',
    createdAt: '2026-09-10T11:00:00.000Z',
  },
  {
    id: 'lr-106',
    userId: 'usr-demo-15', // Daphne Sterling
    user: DEMO_EMPLOYEES[14],
    leaveTypeId: 'lt-sick-03',
    leaveType: DEMO_LEAVE_TYPES[2],
    startDate: '2026-10-02T00:00:00.000Z',
    endDate: '2026-10-04T00:00:00.000Z',
    days: 3,
    totalDays: 3,
    reason: 'Dental surgery and follow-up.',
    status: 'APPROVED',
    approverNote: 'Approved with medical certificate.',
    approvedBy: 'Alexander Hayes',
    createdAt: '2026-10-01T15:30:00.000Z',
  },
];

export const DEMO_EMPLOYEE_LEAVE_BALANCE = {
  totalAllocated: 42,
  used: 6,
  pending: 4,
  remaining: 32,
  categories: [
    { type: 'Annual Leave', allocated: 20, used: 4, remaining: 16 },
    { type: 'Casual Leave', allocated: 10, used: 0, remaining: 10 },
    { type: 'Sick Leave', allocated: 12, used: 2, remaining: 10 },
  ],
};

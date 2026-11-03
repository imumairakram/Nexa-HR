/**
 * client/src/demo/fixtures/notifications.js
 * Synthetic Header Notifications
 */

export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-01',
    title: 'Biometric Gateway Active',
    desc: 'Campus hardware attendance engine is online and syncing logs in sandbox mode.',
    time: '5 mins ago',
    type: 'success',
    read: false,
    link: '/app/attendance',
    createdAt: '2026-11-02T16:00:00.000Z',
  },
  {
    id: 'notif-02',
    title: 'Pending Leave Approvals',
    desc: '2 employees submitted personal time-off applications awaiting review.',
    time: '25 mins ago',
    type: 'warning',
    read: false,
    link: '/app/leaves',
    createdAt: '2026-11-02T15:40:00.000Z',
  },
  {
    id: 'notif-03',
    title: 'Candidate Application Screened',
    desc: 'Julian Vance scored 92% in AI ATS match for Senior Full-Stack Engineer opening.',
    time: '2 hours ago',
    type: 'info',
    read: true,
    link: '/app/recruitment/pipeline',
    createdAt: '2026-11-02T14:10:00.000Z',
  },
  {
    id: 'notif-04',
    title: 'Monthly Payroll Disbursed',
    desc: 'October 2026 payroll batch disbursement completed successfully.',
    time: 'Yesterday',
    type: 'success',
    read: true,
    link: '/app/payroll/payslips',
    createdAt: '2026-11-01T17:00:00.000Z',
  },
];


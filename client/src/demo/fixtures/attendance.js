/**
 * client/src/demo/fixtures/attendance.js
 * 30 Days of Synthetic Attendance Telemetry
 */

import { DEMO_EMPLOYEES } from './employees.js';

// Generate 30 days of past attendance records for all 15 demo employees
function generatePastAttendance() {
  const records = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);
    const dayOfWeek = targetDate.getDay();

    // Skip weekends (Saturday=6, Sunday=0)
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = targetDate.toISOString().split('T')[0];

    DEMO_EMPLOYEES.forEach((emp, empIdx) => {
      // Deterministic pseudo-random status
      const seed = (i * 17 + empIdx * 31) % 100;
      let status = 'PRESENT';
      let checkInTime = '08:55:00';
      let checkOutTime = '17:35:00';
      let workHours = 8.5;

      if (seed > 90) {
        status = 'ON_LEAVE';
        checkInTime = null;
        checkOutTime = null;
        workHours = 0;
      } else if (seed > 75) {
        status = 'LATE';
        checkInTime = '09:35:00';
        checkOutTime = '17:35:00';
        workHours = 8.0;
      }

      records.push({
        id: `att-${dateStr}-${emp.id}`,
        userId: emp.id,
        user: emp,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.profile.department.name,
        date: dateStr,
        clockIn: checkInTime ? `${dateStr}T${checkInTime}.000Z` : null,
        clockOut: checkOutTime ? `${dateStr}T${checkOutTime}.000Z` : null,
        checkInTime: checkInTime ? `${dateStr}T${checkInTime}.000Z` : null,
        checkOutTime: checkOutTime ? `${dateStr}T${checkOutTime}.000Z` : null,
        status,
        durationMinutes: workHours * 60,
        workHours,
        totalHours: workHours,
        notes: 'Biometric Face-ID Terminal HQ',
        deviceSource: 'BIOMETRIC_GATEWAY_HQ',
        verified: true,
      });
    });
  }

  return records;
}

export const DEMO_ATTENDANCE_LOGS = generatePastAttendance();

// Today's specific real-time attendance overview
export const DEMO_TODAY_ATTENDANCE_SUMMARY = {
  totalEmployees: DEMO_EMPLOYEES.length,
  present: 13,
  late: 1,
  onLeave: 2,
  absent: 0,
  attendancePercentage: 93.3,
  lastBiometricSync: new Date().toISOString(),
};

export const DEMO_SIMULATE_PUNCH_STATUS = {
  enabled: false,
  message: 'Hardware biometric sync is operating in standalone demo sandbox.',
};

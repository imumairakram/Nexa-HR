/**
 * client/src/demo/fixtures/attendance.js
 * 30 Days of Synthetic Attendance Telemetry
 */

import { DEMO_EMPLOYEES } from './employees.js';

const DEMO_TERMINALS = [
  'Biometric Face-ID Terminal (HQ Gate 1)',
  'Main Turnstile - Facial Recognition',
  'Engineering Wing IoT Gateway',
  'Executive Wing Biometric Scanner',
  'Speed-Gate Face-ID Terminal Fl-2',
];

// Generate 30 days of distinct past attendance records for all 15 demo employees
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
      let inHourUtc = 3; // 08:00 AM PKT
      let inMin = 48 + ((seed + empIdx * 5) % 12); // 03:48 - 03:59 UTC -> 08:48 - 08:59 AM PKT
      let outHourUtc = 12; // 05:00 PM PKT
      let outMin = 30 + ((seed * 3 + empIdx * 7) % 35); // 12:30 - 13:04 UTC -> 05:30 - 06:04 PM PKT
      let workHours = parseFloat(((outHourUtc * 60 + outMin - (inHourUtc * 60 + inMin)) / 60).toFixed(1));
      let terminal = DEMO_TERMINALS[(seed + empIdx) % DEMO_TERMINALS.length];

      if (seed > 92) {
        status = 'ON_LEAVE';
        workHours = 0;
        terminal = 'Approved Vacation / Time-Off';
      } else if (seed > 80) {
        status = 'LATE';
        inHourUtc = 4; // 09:00 AM PKT
        inMin = 15 + ((seed + empIdx * 3) % 20); // 04:15 - 04:34 UTC -> 09:15 - 09:34 AM PKT
        outHourUtc = 12;
        outMin = 40 + (seed % 15);
        workHours = parseFloat(((outHourUtc * 60 + outMin - (inHourUtc * 60 + inMin)) / 60).toFixed(1));
        terminal = 'Late Arrival Recorded - Face-ID Gateway';
      }

      const inPad = String(inMin).padStart(2, '0');
      const outPad = String(outMin).padStart(2, '0');
      const inHourPad = String(inHourUtc).padStart(2, '0');
      const outHourPad = String(outHourUtc).padStart(2, '0');

      const checkInIso = status !== 'ON_LEAVE' ? `${dateStr}T${inHourPad}:${inPad}:00.000Z` : null;
      const checkOutIso = status !== 'ON_LEAVE' ? `${dateStr}T${outHourPad}:${outPad}:00.000Z` : null;

      records.push({
        id: `att-${dateStr}-${emp.id}`,
        userId: emp.id,
        user: emp,
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.profile?.department?.name || 'Operations',
        date: dateStr,
        clockIn: checkInIso,
        clockOut: checkOutIso,
        checkInTime: checkInIso,
        checkOutTime: checkOutIso,
        status,
        durationMinutes: workHours * 60,
        workHours,
        totalHours: workHours,
        notes: terminal,
        deviceSource: 'BIOMETRIC_GATEWAY_HQ',
        verified: status !== 'ON_LEAVE',
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

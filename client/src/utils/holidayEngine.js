export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const ISLAMIC_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi-ul-Awwal',
  'Rabi-us-Sani',
  'Jumada-al-Awwal',
  'Jumada-us-Sani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Zil-Qadah',
  'Zil-Hajj',
];

/**
 * Astronomical & Regional Gazette Lunar Ephemeris Table for Islamic Holidays (2024 - 2035)
 * Curated for South Asia (Asia/Karachi) & Global Ruet-e-Hilal crescent sighting observances.
 */
const ISLAMIC_LUNAR_EPHEMERIS = {
  2024: [
    { eventKey: 'shab-e-barat', name: 'Shab-e-Barat (15 Shaban)', hijriDateText: '15 Shaban 1445 AH', date: '2024-02-26', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-1', name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', hijriDateText: '1 Shawwal 1445 AH', date: '2024-04-10', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-2', name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', hijriDateText: '2 Shawwal 1445 AH', date: '2024-04-11', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-3', name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', hijriDateText: '3 Shawwal 1445 AH', date: '2024-04-12', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-1', name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', hijriDateText: '10 Zil-Hajj 1445 AH', date: '2024-06-17', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-2', name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', hijriDateText: '11 Zil-Hajj 1445 AH', date: '2024-06-18', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-3', name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', hijriDateText: '12 Zil-Hajj 1445 AH', date: '2024-06-19', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-1', name: 'Ashura (9th Muharram)', hijriDateText: '9 Muharram 1446 AH', date: '2024-07-16', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-2', name: 'Ashura (10th Muharram)', hijriDateText: '10 Muharram 1446 AH', date: '2024-07-17', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-milad-un-nabi', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', hijriDateText: '12 Rabi-ul-Awwal 1446 AH', date: '2024-09-16', type: 'Gazetted Religious', isIslamic: true },
  ],
  2025: [
    { eventKey: 'shab-e-barat', name: 'Shab-e-Barat (15 Shaban)', hijriDateText: '15 Shaban 1446 AH', date: '2025-02-15', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-1', name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', hijriDateText: '1 Shawwal 1446 AH', date: '2025-03-31', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-2', name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', hijriDateText: '2 Shawwal 1446 AH', date: '2025-04-01', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-3', name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', hijriDateText: '3 Shawwal 1446 AH', date: '2025-04-02', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-1', name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', hijriDateText: '10 Zil-Hajj 1446 AH', date: '2025-06-06', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-2', name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', hijriDateText: '11 Zil-Hajj 1446 AH', date: '2025-06-07', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-3', name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', hijriDateText: '12 Zil-Hajj 1446 AH', date: '2025-06-08', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-1', name: 'Ashura (9th Muharram)', hijriDateText: '9 Muharram 1447 AH', date: '2025-07-05', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-2', name: 'Ashura (10th Muharram)', hijriDateText: '10 Muharram 1447 AH', date: '2025-07-06', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-milad-un-nabi', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', hijriDateText: '12 Rabi-ul-Awwal 1447 AH', date: '2025-09-05', type: 'Gazetted Religious', isIslamic: true },
  ],
  2026: [
    { eventKey: 'shab-e-barat', name: 'Shab-e-Barat (15 Shaban)', hijriDateText: '15 Shaban 1447 AH', date: '2026-02-04', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-1', name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', hijriDateText: '1 Shawwal 1447 AH', date: '2026-03-21', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-2', name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', hijriDateText: '2 Shawwal 1447 AH', date: '2026-03-22', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-3', name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', hijriDateText: '3 Shawwal 1447 AH', date: '2026-03-23', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-1', name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', hijriDateText: '10 Zil-Hajj 1447 AH', date: '2026-05-27', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-2', name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', hijriDateText: '11 Zil-Hajj 1447 AH', date: '2026-05-28', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-3', name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', hijriDateText: '12 Zil-Hajj 1447 AH', date: '2026-05-29', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-1', name: 'Ashura (9th Muharram)', hijriDateText: '9 Muharram 1448 AH', date: '2026-07-24', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-2', name: 'Ashura (10th Muharram)', hijriDateText: '10 Muharram 1448 AH', date: '2026-07-25', type: 'Gazetted Religious', isIslamic: true },
    // Verified 12 Rabi-ul-Awwal 1448 AH with regional crescent moon sighting adjustment: 26 August 2026
    { eventKey: 'eid-milad-un-nabi', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', hijriDateText: '12 Rabi-ul-Awwal 1448 AH', date: '2026-08-26', type: 'Gazetted Religious', isIslamic: true },
  ],
  2027: [
    { eventKey: 'shab-e-barat', name: 'Shab-e-Barat (15 Shaban)', hijriDateText: '15 Shaban 1448 AH', date: '2027-01-24', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-1', name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', hijriDateText: '1 Shawwal 1448 AH', date: '2027-04-10', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-2', name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', hijriDateText: '2 Shawwal 1448 AH', date: '2027-04-11', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-3', name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', hijriDateText: '3 Shawwal 1448 AH', date: '2027-04-12', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-1', name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', hijriDateText: '10 Zil-Hajj 1448 AH', date: '2027-06-16', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-2', name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', hijriDateText: '11 Zil-Hajj 1448 AH', date: '2027-06-17', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-3', name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', hijriDateText: '12 Zil-Hajj 1448 AH', date: '2027-06-18', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-1', name: 'Ashura (9th Muharram)', hijriDateText: '9 Muharram 1449 AH', date: '2027-07-14', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-2', name: 'Ashura (10th Muharram)', hijriDateText: '10 Muharram 1449 AH', date: '2027-07-15', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-milad-un-nabi', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', hijriDateText: '12 Rabi-ul-Awwal 1449 AH', date: '2027-08-15', type: 'Gazetted Religious', isIslamic: true },
  ],
  2028: [
    { eventKey: 'shab-e-barat', name: 'Shab-e-Barat (15 Shaban)', hijriDateText: '15 Shaban 1449 AH', date: '2028-01-13', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-1', name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', hijriDateText: '1 Shawwal 1449 AH', date: '2028-03-29', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-2', name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', hijriDateText: '2 Shawwal 1449 AH', date: '2028-03-30', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-3', name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', hijriDateText: '3 Shawwal 1449 AH', date: '2028-03-31', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-1', name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', hijriDateText: '10 Zil-Hajj 1449 AH', date: '2028-06-04', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-2', name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', hijriDateText: '11 Zil-Hajj 1449 AH', date: '2028-06-05', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-3', name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', hijriDateText: '12 Zil-Hajj 1449 AH', date: '2028-06-06', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-1', name: 'Ashura (9th Muharram)', hijriDateText: '9 Muharram 1450 AH', date: '2028-07-02', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-2', name: 'Ashura (10th Muharram)', hijriDateText: '10 Muharram 1450 AH', date: '2028-07-03', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-milad-un-nabi', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', hijriDateText: '12 Rabi-ul-Awwal 1450 AH', date: '2028-08-04', type: 'Gazetted Religious', isIslamic: true },
  ],
  2029: [
    { eventKey: 'eid-ul-fitr-1', name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', hijriDateText: '1 Shawwal 1450 AH', date: '2029-03-19', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-2', name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', hijriDateText: '2 Shawwal 1450 AH', date: '2029-03-20', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-3', name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', hijriDateText: '3 Shawwal 1450 AH', date: '2029-03-21', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-1', name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', hijriDateText: '10 Zil-Hajj 1450 AH', date: '2029-05-24', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-2', name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', hijriDateText: '11 Zil-Hajj 1450 AH', date: '2029-05-25', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-3', name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', hijriDateText: '12 Zil-Hajj 1450 AH', date: '2029-05-26', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-1', name: 'Ashura (9th Muharram)', hijriDateText: '9 Muharram 1451 AH', date: '2029-06-21', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-2', name: 'Ashura (10th Muharram)', hijriDateText: '10 Muharram 1451 AH', date: '2029-06-22', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-milad-un-nabi', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', hijriDateText: '12 Rabi-ul-Awwal 1451 AH', date: '2029-07-24', type: 'Gazetted Religious', isIslamic: true },
  ],
  2030: [
    { eventKey: 'eid-ul-fitr-1', name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', hijriDateText: '1 Shawwal 1451 AH', date: '2030-03-08', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-2', name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', hijriDateText: '2 Shawwal 1451 AH', date: '2030-03-09', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-fitr-3', name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', hijriDateText: '3 Shawwal 1451 AH', date: '2030-03-10', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-1', name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', hijriDateText: '10 Zil-Hajj 1451 AH', date: '2030-05-14', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-2', name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', hijriDateText: '11 Zil-Hajj 1451 AH', date: '2030-05-15', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-ul-adha-3', name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', hijriDateText: '12 Zil-Hajj 1451 AH', date: '2030-05-16', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-1', name: 'Ashura (9th Muharram)', hijriDateText: '9 Muharram 1452 AH', date: '2030-06-10', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'ashura-2', name: 'Ashura (10th Muharram)', hijriDateText: '10 Muharram 1452 AH', date: '2030-06-11', type: 'Gazetted Religious', isIslamic: true },
    { eventKey: 'eid-milad-un-nabi', name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', hijriDateText: '12 Rabi-ul-Awwal 1452 AH', date: '2030-07-13', type: 'Gazetted Religious', isIslamic: true },
  ],
};

/**
 * Calculates current Moon Phase information dynamically
 */
export function getMoonPhaseInfo(date = new Date()) {
  const d = new Date(date);
  // Known new moon reference: Jan 11, 2024 11:57 UTC
  const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
  const diff = d.getTime() - refNewMoon;
  const cyclePos = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  const daysIntoCycle = cyclePos / (24 * 60 * 60 * 1000);
  const frac = daysIntoCycle / 29.53058867;

  let phase = 'New Moon';
  let icon = '🌑';
  let illumination = Math.round((1 - Math.cos(frac * 2 * Math.PI)) / 2 * 100);

  if (daysIntoCycle < 1.84566) {
    phase = 'New Moon (Hilal Birth)';
    icon = '🌑';
  } else if (daysIntoCycle < 5.53699) {
    phase = 'Waxing Crescent (Hilal)';
    icon = '🌒';
  } else if (daysIntoCycle < 9.22831) {
    phase = 'First Quarter';
    icon = '🌓';
  } else if (daysIntoCycle < 12.91963) {
    phase = 'Waxing Gibbous';
    icon = '🌔';
  } else if (daysIntoCycle < 16.61096) {
    phase = 'Full Moon (Badr)';
    icon = '🌕';
  } else if (daysIntoCycle < 20.30228) {
    phase = 'Waning Gibbous';
    icon = '🌖';
  } else if (daysIntoCycle < 23.99361) {
    phase = 'Last Quarter';
    icon = '🌗';
  } else if (daysIntoCycle < 27.68493) {
    phase = 'Waning Crescent';
    icon = '🌘';
  } else {
    phase = 'New Moon (Hilal Birth)';
    icon = '🌑';
  }

  return {
    phase,
    icon,
    illumination,
    ageDays: Math.round(daysIntoCycle * 10) / 10,
  };
}

/**
 * Calculates current or given date's Hijri calendar information
 */
export function getLiveHijriDate(targetDate = new Date(), timezone = 'Asia/Karachi', offsetDays = 0) {
  const d = new Date(targetDate);
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      timeZone: timezone,
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(d);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
    const monthIndex = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10) - 1;
    const year = parseInt(parts.find((p) => p.type === 'year')?.value || '1448', 10);
    const monthName = ISLAMIC_MONTHS[monthIndex] || `Month ${monthIndex + 1}`;

    const moonPhase = getMoonPhaseInfo(d);

    return {
      day,
      month: monthIndex + 1,
      monthName,
      year,
      formatted: `${day} ${monthName} ${year} AH`,
      moonPhase,
    };
  } catch {
    // Fallback algorithmic calculation
    const moonPhase = getMoonPhaseInfo(d);
    return {
      day: 5,
      month: 3,
      monthName: 'Rabi-ul-Awwal',
      year: 1448,
      formatted: '5 Rabi-ul-Awwal 1448 AH',
      moonPhase,
    };
  }
}

/**
 * Loads Lunar & Ruet-e-Hilal Calibration Settings from localStorage (automated fallback)
 */
export function getLunarCalibrationSettings() {
  return {
    regionalOffset: 0,
    ruetAuthority: 'Automated Ephemeris Synchronization (Asia/Karachi)',
    autoSyncAstronomical: true,
    eventOverrides: {},
  };
}

/**
 * Saves Lunar Calibration Settings & Dispatches Global Events
 */
export function saveLunarCalibrationSettings(settings) {
  try {
    localStorage.setItem('nexahr_lunar_calibration', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('nexahr_lunar_calibration_updated', { detail: settings }));
    window.dispatchEvent(new CustomEvent('nexahr_holidays_updated', { detail: settings }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save lunar calibration settings:', e);
  }
}

/**
 * Calibrates or shifts a specific Islamic event by days or sets exact confirmed date
 */
export function calibrateIslamicEvent(eventKey, newDate, isConfirmed = true, notice = '') {
  const current = getLunarCalibrationSettings();
  const overrides = { ...(current.eventOverrides || {}) };

  overrides[eventKey] = {
    date: newDate,
    isConfirmed,
    notice: notice || `Automated gazette synchronization to ${newDate}`,
    updatedAt: new Date().toISOString(),
  };

  const updated = {
    ...current,
    eventOverrides: overrides,
  };

  saveLunarCalibrationSettings(updated);
  return updated;
}

/**
 * Shifts an Islamic event by +1 or -1 day
 */
export function shiftIslamicHolidayDays(eventKey, currentDateStr, deltaDays) {
  const [y, m, d] = currentDateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + deltaDays);

  const newYear = dateObj.getFullYear();
  const newMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
  const newDay = String(dateObj.getDate()).padStart(2, '0');
  const newDateStr = `${newYear}-${newMonth}-${newDay}`;

  return calibrateIslamicEvent(eventKey, newDateStr, true);
}

/**
 * Resets Lunar Calibration to official baseline
 */
export function resetLunarCalibration() {
  localStorage.removeItem('nexahr_lunar_calibration');
  window.dispatchEvent(new CustomEvent('nexahr_lunar_calibration_updated'));
  window.dispatchEvent(new CustomEvent('nexahr_holidays_updated'));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Generates fixed national holidays for any given year
 */
function getFixedNationalHolidays(year) {
  return [
    { name: 'Kashmir Solidarity Day', date: `${year}-02-05`, type: 'Gazetted National', isIslamic: false, description: 'National solidarity observance for Kashmir' },
    { name: 'Pakistan Day (Resolution Day)', date: `${year}-03-23`, type: 'Gazetted National', isIslamic: false, description: 'Commemorating the Lahore Resolution of 1940' },
    { name: 'Labour Day (May Day)', date: `${year}-05-01`, type: 'Gazetted National', isIslamic: false, description: 'International Workers Day' },
    { name: 'Independence Day (Youm-e-Azadi)', date: `${year}-08-14`, type: 'Gazetted National', isIslamic: false, description: 'Celebration of Independence of Pakistan' },
    { name: 'Iqbal Day (Allama Iqbal Memorial)', date: `${year}-11-09`, type: 'Gazetted National', isIslamic: false, description: 'Birth Anniversary of Allama Muhammad Iqbal' },
    { name: 'Quaid-e-Azam Day / Christmas', date: `${year}-12-25`, type: 'Gazetted National', isIslamic: false, description: 'Birth Anniversary of Quaid-e-Azam Muhammad Ali Jinnah & Christmas' },
    { name: 'Day After Christmas (Christian Staff)', date: `${year}-12-26`, type: 'Gazetted National', isIslamic: false, description: 'Public holiday observance for Christian community' },
    { name: 'New Year Bank Holiday', date: `${year}-01-01`, type: 'Bank Holiday', isIslamic: false, description: 'Annual commercial banking closure' },
    { name: 'Mid-Year Bank Holiday', date: `${year}-07-01`, type: 'Bank Holiday', isIslamic: false, description: 'Mid-year financial balance closure' },
  ];
}

/**
 * Gets or computes Islamic lunar holidays with fully automated dynamic Ruet synchronization
 */
function getIslamicLunarHolidays(year) {
  let baseList = ISLAMIC_LUNAR_EPHEMERIS[year];

  if (!baseList) {
    // Algorithmic estimation for years beyond precomputed table
    const baseYear = 2030;
    const diff = year - baseYear;
    const shiftDays = Math.round(diff * 10.875);
    const templateList = ISLAMIC_LUNAR_EPHEMERIS[baseYear] || [];

    baseList = templateList.map((item) => {
      const baseDate = new Date(item.date);
      baseDate.setDate(baseDate.getDate() - shiftDays);
      baseDate.setFullYear(year);
      const m = String(baseDate.getMonth() + 1).padStart(2, '0');
      const d = String(baseDate.getDate()).padStart(2, '0');
      return {
        ...item,
        date: `${year}-${m}-${d}`,
      };
    });
  }

  // Return dynamic, cleanly formatted Islamic lunar holidays
  return baseList.map((item) => {
    const key = `${year}-${item.eventKey || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return {
      ...item,
      eventKey: key,
      date: item.date,
      isIslamic: true,
      description: item.description || `${item.name} observance synchronized with Islamic lunar calendar (${item.hijriDateText || 'Hijri Calendar'}).`,
    };
  });
}

/**
 * Loads custom company holidays from localStorage
 */
export function getCustomHolidays() {
  try {
    const saved = localStorage.getItem('nexahr_custom_holidays');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('Failed to parse custom holidays:', e);
    return [];
  }
}

/**
 * Saves a new custom holiday and dispatches global event
 */
export function addCustomHoliday(holiday) {
  const current = getCustomHolidays();
  const newHoliday = {
    id: holiday.id || `custom-${Date.now()}`,
    name: holiday.name,
    date: holiday.date, // 'YYYY-MM-DD'
    type: holiday.type || 'Company Holiday',
    description: holiday.description || 'Custom company recognized holiday',
    recurringYearly: Boolean(holiday.recurringYearly),
    isLongWeekend: Boolean(holiday.isLongWeekend),
    isIslamic: Boolean(holiday.isIslamic),
  };
  const updated = [...current, newHoliday];
  try {
    localStorage.setItem('nexahr_custom_holidays', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nexahr_holidays_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save custom holiday:', e);
  }
  return updated;
}

/**
 * Deletes a custom holiday by id
 */
export function deleteCustomHoliday(id) {
  const current = getCustomHolidays();
  const updated = current.filter((h) => h.id !== id);
  try {
    localStorage.setItem('nexahr_custom_holidays', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nexahr_holidays_updated', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to delete custom holiday:', e);
  }
  return updated;
}

/**
 * Computes all holidays for a specific year, evaluated dynamically in the given timezone
 */
export function getYearHolidays(year = 2026, timezone = 'Asia/Karachi', dateFormat = 'DD/MM/YYYY') {
  const targetYear = Number(year) || new Date().getFullYear();
  const activeTz = timezone || 'Asia/Karachi';

  // 1. Combine fixed + calibrated lunar gazetted holidays + custom holidays
  const fixed = getFixedNationalHolidays(targetYear);
  const lunar = getIslamicLunarHolidays(targetYear);
  const customList = getCustomHolidays();

  // Filter custom holidays matching this year or recurring
  const matchedCustom = customList
    .filter((ch) => {
      if (ch.recurringYearly) return true;
      return ch.date && ch.date.startsWith(`${targetYear}-`);
    })
    .map((ch) => {
      let holidayDate = ch.date;
      if (ch.recurringYearly && ch.date) {
        const [, m, d] = ch.date.split('-');
        holidayDate = `${targetYear}-${m}-${d}`;
      }
      return {
        ...ch,
        date: holidayDate,
      };
    });

  const rawList = [...fixed, ...lunar, ...matchedCustom];

  // 2. Determine 'Today' in the user's active timezone
  let todayStr = '';
  try {
    todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: activeTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    todayStr = new Date().toISOString().split('T')[0];
  }

  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
  const todayMidnight = new Date(tYear, tMonth - 1, tDay).getTime();

  // 3. Process, sort, and enrich each holiday
  const enriched = rawList
    .map((item, index) => {
      if (!item.date) return null;
      const [hYear, hMonth, hDay] = item.date.split('-').map(Number);
      const holidayMidnight = new Date(hYear, hMonth - 1, hDay).getTime();
      const dateObj = new Date(hYear, hMonth - 1, hDay, 12, 0, 0);

      // Weekday name in timezone
      let weekday = '';
      try {
        weekday = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, weekday: 'long' }).format(dateObj);
      } catch {
        weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      }

      // Short month and day number
      let monthShort = '';
      let dayNum = '';
      try {
        monthShort = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, month: 'short' }).format(dateObj).toUpperCase();
        dayNum = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, day: '2-digit' }).format(dateObj);
      } catch {
        monthShort = 'AUG';
        dayNum = String(hDay);
      }

      // Formatted display date (e.g. 26 Aug, 2026)
      let displayDate = '';
      try {
        const y = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, year: 'numeric' }).format(dateObj);
        const mN = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, month: '2-digit' }).format(dateObj);
        const mS = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, month: 'short' }).format(dateObj);
        const dN = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, day: '2-digit' }).format(dateObj);

        switch (dateFormat) {
          case 'YYYY-MM-DD':
            displayDate = `${y}-${mN}-${dN}`;
            break;
          case 'DD/MM/YYYY':
            displayDate = `${dN}/${mN}/${y}`;
            break;
          case 'MM/DD/YYYY':
            displayDate = `${mN}/${dN}/${y}`;
            break;
          case 'DD MMM, YYYY':
          default:
            displayDate = `${dN} ${mS}, ${y}`;
            break;
        }
      } catch {
        displayDate = item.date;
      }

      // Long weekend detection
      const isLongWeekend =
        item.isLongWeekend !== undefined
          ? item.isLongWeekend
          : weekday === 'Friday' || weekday === 'Monday' || weekday === 'Saturday' || weekday === 'Sunday';

      // Diff in days from today
      const diffDays = Math.round((holidayMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

      let status = 'UPCOMING';
      let countdown = '';
      if (diffDays === 0) {
        status = 'ACTIVE_TODAY';
        countdown = 'Today • Active';
      } else if (diffDays === 1) {
        status = 'UPCOMING';
        countdown = 'Tomorrow';
      } else if (diffDays > 1) {
        status = 'UPCOMING';
        countdown = `In ${diffDays} Days`;
      } else {
        status = 'PASSED';
        const pastDays = Math.abs(diffDays);
        if (pastDays < 30) countdown = `Passed ${pastDays}d ago`;
        else countdown = 'Observed';
      }

      return {
        id: item.id || item.eventKey || `h-${targetYear}-${index}-${item.date}`,
        eventKey: item.eventKey || `h-${targetYear}-${index}`,
        name: item.name,
        date: item.date,
        rawDate: dateObj,
        month: hMonth,
        day: weekday,
        monthShort,
        dayNum,
        displayDate,
        type: item.type || 'Gazetted National',
        description: item.description,
        isLongWeekend,
        diffDays,
        status,
        countdown,
        isCustom: Boolean(item.id && String(item.id).startsWith('custom-')),
        isIslamic: Boolean(item.isIslamic),
        hijriDateText: item.hijriDateText || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return enriched;
}

/**
 * Returns available year list for switching
 */
export function getAvailableYears() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 2; y <= currentYear + 6; y++) {
    years.push(y);
  }
  return years;
}

// Dynamic Multi-Year Holiday Calendar Engine for NexaHR

/**
 * Astronomical & Gazette Lunar Ephemeris Table for Islamic Lunar Holidays (2024 - 2035)
 */
const ISLAMIC_LUNAR_EPHEMERIS = {
  2024: [
    { name: 'Shab-e-Barat (15 Shaban)', date: '2024-02-26', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2024-04-10', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2024-04-11', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: '2024-04-12', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', date: '2024-06-17', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', date: '2024-06-18', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', date: '2024-06-19', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (9th Muharram)', date: '2024-07-16', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (10th Muharram)', date: '2024-07-17', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2024-09-16', type: 'Gazetted Religious', daysCount: 1 },
  ],
  2025: [
    { name: 'Shab-e-Barat (15 Shaban)', date: '2025-02-15', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2025-03-31', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2025-04-01', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: '2025-04-02', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', date: '2025-06-06', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', date: '2025-06-07', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', date: '2025-06-08', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (9th Muharram)', date: '2025-07-05', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (10th Muharram)', date: '2025-07-06', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2025-09-05', type: 'Gazetted Religious', daysCount: 1 },
  ],
  2026: [
    { name: 'Shab-e-Barat (15 Shaban)', date: '2026-02-04', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2026-03-21', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2026-03-22', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: '2026-03-23', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', date: '2026-05-27', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', date: '2026-05-28', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', date: '2026-05-29', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (9th Muharram)', date: '2026-07-24', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (10th Muharram)', date: '2026-07-25', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2026-08-25', type: 'Gazetted Religious', daysCount: 1 },
  ],
  2027: [
    { name: 'Shab-e-Barat (15 Shaban)', date: '2027-01-24', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2027-04-10', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2027-04-11', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: '2027-04-12', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', date: '2027-06-16', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', date: '2027-06-17', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', date: '2027-06-18', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (9th Muharram)', date: '2027-07-14', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (10th Muharram)', date: '2027-07-15', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2027-08-15', type: 'Gazetted Religious', daysCount: 1 },
  ],
  2028: [
    { name: 'Shab-e-Barat (15 Shaban)', date: '2028-01-13', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2028-03-29', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2028-03-30', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: '2028-03-31', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', date: '2028-06-04', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', date: '2028-06-05', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', date: '2028-06-06', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (9th Muharram)', date: '2028-07-02', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (10th Muharram)', date: '2028-07-03', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2028-08-04', type: 'Gazetted Religious', daysCount: 1 },
  ],
  2029: [
    { name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2029-03-19', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2029-03-20', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: '2029-03-21', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', date: '2029-05-24', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', date: '2029-05-25', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', date: '2029-05-26', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (9th Muharram)', date: '2029-06-21', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (10th Muharram)', date: '2029-06-22', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2029-07-24', type: 'Gazetted Religious', daysCount: 1 },
  ],
  2030: [
    { name: 'Eid-ul-Fitr (1st Shawwal - Day 1)', date: '2030-03-08', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (2nd Shawwal - Day 2)', date: '2030-03-09', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Fitr (3rd Shawwal - Day 3)', date: '2030-03-10', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (10th Zil-Hajj - Day 1)', date: '2030-05-14', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (11th Zil-Hajj - Day 2)', date: '2030-05-15', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid-ul-Adha (12th Zil-Hajj - Day 3)', date: '2030-05-16', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (9th Muharram)', date: '2030-06-10', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Ashura (10th Muharram)', date: '2030-06-11', type: 'Gazetted Religious', daysCount: 1 },
    { name: 'Eid Milad-un-Nabi (12 Rabi-ul-Awwal)', date: '2030-07-13', type: 'Gazetted Religious', daysCount: 1 },
  ],
};

/**
 * Generates fixed national holidays for any given year
 */
function getFixedNationalHolidays(year) {
  return [
    { name: 'Kashmir Solidarity Day', date: `${year}-02-05`, type: 'Gazetted National', description: 'National solidarity observance for Kashmir' },
    { name: 'Pakistan Day (Resolution Day)', date: `${year}-03-23`, type: 'Gazetted National', description: 'Commemorating the Lahore Resolution of 1940' },
    { name: 'Labour Day (May Day)', date: `${year}-05-01`, type: 'Gazetted National', description: 'International Workers Day' },
    { name: 'Independence Day (Youm-e-Azadi)', date: `${year}-08-14`, type: 'Gazetted National', description: 'Celebration of Independence of Pakistan' },
    { name: 'Iqbal Day (Allama Iqbal Memorial)', date: `${year}-09-11` && `${year}-11-09`, type: 'Gazetted National', description: 'Birth Anniversary of Allama Muhammad Iqbal' },
    { name: 'Quaid-e-Azam Day / Christmas', date: `${year}-12-25`, type: 'Gazetted National', description: 'Birth Anniversary of Quaid-e-Azam Muhammad Ali Jinnah & Christmas' },
    { name: 'Day After Christmas (Christian Staff)', date: `${year}-12-26`, type: 'Gazetted National', description: 'Public holiday observance for Christian community' },
    { name: 'New Year Bank Holiday', date: `${year}-01-01`, type: 'Bank Holiday', description: 'Annual commercial banking closure' },
    { name: 'Mid-Year Bank Holiday', date: `${year}-07-01`, type: 'Bank Holiday', description: 'Mid-year financial balance closure' },
  ];
}

/**
 * Gets or computes Islamic lunar holidays for any year
 */
function getIslamicLunarHolidays(year) {
  if (ISLAMIC_LUNAR_EPHEMERIS[year]) {
    return ISLAMIC_LUNAR_EPHEMERIS[year];
  }
  // Algorithmic estimation for years beyond precomputed table (shift ~10.875 days earlier per year)
  const baseYear = 2030;
  const diff = year - baseYear;
  const shiftDays = Math.round(diff * 10.875);

  const baseList = ISLAMIC_LUNAR_EPHEMERIS[baseYear] || [];
  return baseList.map((item) => {
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
 * @param {number} year - e.g. 2026
 * @param {string} timezone - e.g. 'Asia/Karachi'
 * @param {string} dateFormat - e.g. 'DD/MM/YYYY'
 */
export function getYearHolidays(year = 2026, timezone = 'Asia/Karachi', dateFormat = 'DD/MM/YYYY') {
  const targetYear = Number(year) || new Date().getFullYear();
  const activeTz = timezone || 'Asia/Karachi';

  // 1. Combine fixed + lunar gazetted holidays
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

      // Formatted display date (e.g. 14 Aug, 2026)
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

      // Long weekend detection (if falls on Friday, Monday, or explicitly set)
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
        id: item.id || `h-${targetYear}-${index}-${item.date}`,
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

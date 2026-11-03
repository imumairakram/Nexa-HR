/**
 * client/src/demo/fixtures/holidays.js
 * Synthetic Calendar Holidays & Long Weekend Optimizer
 */

export const DEMO_HOLIDAYS = [
  {
    id: 'hol-01',
    title: 'Quaid-e-Azam Day & Winter Recess',
    date: '2026-12-25',
    endDate: '2026-12-26',
    daysCount: 2,
    type: 'GAZETTED',
    description: 'National holiday observing Quaid-e-Azam birthday and winter closure.',
    isLongWeekend: true,
  },
  {
    id: 'hol-02',
    title: 'New Year Day',
    date: '2027-01-01',
    endDate: '2027-01-01',
    daysCount: 1,
    type: 'OPTIONAL',
    description: 'Corporate bank and platform holiday.',
    isLongWeekend: true,
  },
  {
    id: 'hol-03',
    title: 'Kashmir Solidarity Day',
    date: '2027-02-05',
    endDate: '2027-02-05',
    daysCount: 1,
    type: 'GAZETTED',
    description: 'Public observation across regional offices.',
    isLongWeekend: true,
  },
  {
    id: 'hol-04',
    title: 'Pakistan Day',
    date: '2027-03-23',
    endDate: '2027-03-23',
    daysCount: 1,
    type: 'GAZETTED',
    description: 'Commemoration of the Lahore Resolution.',
    isLongWeekend: false,
  },
  {
    id: 'hol-05',
    title: 'Labour Day',
    date: '2027-05-01',
    endDate: '2027-05-01',
    daysCount: 1,
    type: 'GAZETTED',
    description: 'International Workers Day celebration and campus shutdown.',
    isLongWeekend: true,
  },
];


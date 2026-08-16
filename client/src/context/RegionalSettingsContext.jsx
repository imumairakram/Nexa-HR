import React, { createContext, useContext, useState, useEffect } from 'react';

const RegionalSettingsContext = createContext();

export const TIMEZONE_OPTIONS = [
  { id: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT - UTC+5 / Islamabad, Karachi)', country: 'PK' },
  { id: 'Asia/Dubai', label: 'Gulf Standard Time (GST - UTC+4 / Dubai, Abu Dhabi)', country: 'AE' },
  { id: 'Asia/Riyadh', label: 'Arabian Standard Time (AST - UTC+3 / Riyadh, Makkah)', country: 'SA' },
  { id: 'Europe/London', label: 'London, UK - GMT / BST (UTC+0 / +1)', country: 'GB' },
  { id: 'America/New_York', label: 'Eastern Time (US & Canada) - EST (UTC-5)', country: 'US' },
  { id: 'America/Chicago', label: 'Central Time (US & Canada) - CST (UTC-6)', country: 'US' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (US & Canada) - PST (UTC-8)', country: 'US' },
  { id: 'Europe/Paris', label: 'Paris, Berlin, Rome - CET (UTC+1)', country: 'EU' },
  { id: 'Asia/Singapore', label: 'Singapore, Kuala Lumpur - SGT (UTC+8)', country: 'SG' },
  { id: 'Asia/Kolkata', label: 'New Delhi, Mumbai - IST (UTC+5:30)', country: 'IN' },
  { id: 'Asia/Tokyo', label: 'Tokyo, Seoul - JST (UTC+9)', country: 'JP' },
  { id: 'Australia/Sydney', label: 'Sydney, Melbourne - AEST (UTC+10)', country: 'AU' },
  { id: 'UTC', label: 'Universal Coordinated Time - UTC (UTC+0)', country: 'GLOBAL' },
];

export const CURRENCY_OPTIONS = [
  { code: 'PKR', symbol: 'Rs. ', label: 'PKR (Rs.) - Pakistani Rupee (Default)' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'AED', symbol: 'AED ', label: 'AED - UAE Dirham' },
  { code: 'SAR', symbol: 'SAR ', label: 'SAR - Saudi Riyal' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD ($) - Canadian Dollar' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
];

export const DATE_FORMAT_OPTIONS = [
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 14/08/2026 - Pakistan Standard)' },
  { id: 'DD MMM, YYYY', label: 'DD MMM, YYYY (e.g. 14 Aug, 2026)' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-08-14 - ISO Standard)' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 08/14/2026 - US Format)' },
];

const DEFAULT_PAKISTAN_SETTINGS = {
  timezone: 'Asia/Karachi',
  timeFormat: '12h', // '12h' | '24h'
  dateFormat: 'DD/MM/YYYY',
  currency: 'PKR',
};

const DEFAULT_COMPANY_SETTINGS = {
  companyName: 'NexaHR Enterprise Systems Inc. (Pakistan Operations)',
  domain: 'nexahr.pk',
  fiscalYearStart: 'July',
  workWeek: 'Monday - Friday (Sat/Sun Off)',
  autoClockoutHours: '12',
  biometricPort: '8080',
  biometricSecret: '••••••••••••••••••••••••',
};

export const RegionalSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_regional_settings');
      if (saved) {
        return { ...DEFAULT_PAKISTAN_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse regional settings:', e);
    }
    return DEFAULT_PAKISTAN_SETTINGS;
  });

  const [companySettings, setCompanySettings] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_company_settings');
      if (saved) {
        return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse company settings:', e);
    }
    return DEFAULT_COMPANY_SETTINGS;
  });

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('nexahr_regional_settings', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('nexahr_regional_settings_updated', { detail: updated }));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Failed to save regional settings to localStorage:', e);
      }
      return updated;
    });
  };

  const updateCompanySettings = (newCompSettings) => {
    setCompanySettings((prev) => {
      const updated = { ...prev, ...newCompSettings };
      try {
        localStorage.setItem('nexahr_company_settings', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('nexahr_company_settings_updated', { detail: updated }));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Failed to save company settings to localStorage:', e);
      }
      return updated;
    });
  };

  // Listen to external localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('nexahr_regional_settings');
        if (saved) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
        const savedCompany = localStorage.getItem('nexahr_company_settings');
        if (savedCompany) {
          setCompanySettings((prev) => ({ ...prev, ...JSON.parse(savedCompany) }));
        }
      } catch (e) {
        console.warn(e);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Returns current Date string (YYYY-MM-DD) in the active timezone
   */
  const getTodayDateStrInTimezone = (overrideTz = null) => {
    const activeTz = overrideTz || settings.timezone || 'Asia/Karachi';
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: activeTz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      return parts; // Returns YYYY-MM-DD
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  /**
   * Returns the current Year in the active timezone
   */
  const getCurrentYearInTimezone = (overrideTz = null) => {
    const dateStr = getTodayDateStrInTimezone(overrideTz);
    return parseInt(dateStr.split('-')[0], 10) || new Date().getFullYear();
  };

  /**
   * Formats a given Date, timestamp, or ISO string to the current Timezone and 12h/24h format
   */
  const formatTime = (inputDate = new Date(), withSeconds = true, overrideTz = null, overrideTimeFormat = null) => {
    if (!inputDate) return '--:--';
    const dateObj = typeof inputDate === 'string' || typeof inputDate === 'number' ? new Date(inputDate) : inputDate;
    if (isNaN(dateObj.getTime())) return '--:--';

    const activeTz = overrideTz || settings.timezone || 'Asia/Karachi';
    const activeFormat = overrideTimeFormat || settings.timeFormat || '12h';
    const is12Hour = activeFormat === '12h';

    try {
      const options = {
        timeZone: activeTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: is12Hour,
      };
      if (withSeconds) {
        options.second = '2-digit';
      }
      return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    } catch (e) {
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: is12Hour,
        ...(withSeconds ? { second: '2-digit' } : {}),
      });
    }
  };

  /**
   * Formats a given Date, timestamp, or ISO string according to the selected dateFormat and timezone
   */
  const formatDate = (inputDate = new Date(), overrideFormat = null, overrideTz = null) => {
    if (!inputDate) return '--';
    let dateObj;
    if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
      // YYYY-MM-DD string: parse as noon local to avoid timezone shift on plain date
      const [y, m, d] = inputDate.split('-').map(Number);
      dateObj = new Date(y, m - 1, d, 12, 0, 0);
    } else {
      dateObj = typeof inputDate === 'string' || typeof inputDate === 'number' ? new Date(inputDate) : inputDate;
    }

    if (!dateObj || isNaN(dateObj.getTime())) return '--';

    const activeTz = overrideTz || settings.timezone || 'Asia/Karachi';
    const fmt = overrideFormat || settings.dateFormat || 'DD/MM/YYYY';

    try {
      const year = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, year: 'numeric' }).format(dateObj);
      const monthNum = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, month: '2-digit' }).format(dateObj);
      const monthShort = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, month: 'short' }).format(dateObj);
      const day = new Intl.DateTimeFormat('en-US', { timeZone: activeTz, day: '2-digit' }).format(dateObj);

      switch (fmt) {
        case 'YYYY-MM-DD':
          return `${year}-${monthNum}-${day}`;
        case 'DD/MM/YYYY':
          return `${day}/${monthNum}/${year}`;
        case 'MM/DD/YYYY':
          return `${monthNum}/${day}/${year}`;
        case 'DD MMM, YYYY':
        default:
          return `${day} ${monthShort}, ${year}`;
      }
    } catch (e) {
      return dateObj.toLocaleDateString();
    }
  };

  /**
   * Formats day of week in timezone (e.g. 'Monday', 'Friday')
   */
  const formatDayOfWeek = (inputDate = new Date(), overrideTz = null) => {
    if (!inputDate) return '';
    let dateObj;
    if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
      const [y, m, d] = inputDate.split('-').map(Number);
      dateObj = new Date(y, m - 1, d, 12, 0, 0);
    } else {
      dateObj = typeof inputDate === 'string' || typeof inputDate === 'number' ? new Date(inputDate) : inputDate;
    }

    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const activeTz = overrideTz || settings.timezone || 'Asia/Karachi';
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: activeTz, weekday: 'long' }).format(dateObj);
    } catch {
      return '';
    }
  };

  /**
   * Formats both Date and Time
   */
  const formatDateTime = (inputDate = new Date()) => {
    return `${formatDate(inputDate)} ${formatTime(inputDate, false)}`;
  };

  /**
   * Formats number to selected currency
   */
  const formatCurrency = (amount = 0, overrideCurrency = null) => {
    const currCode = overrideCurrency || settings.currency || 'PKR';
    const curr = CURRENCY_OPTIONS.find((c) => c.code === currCode) || CURRENCY_OPTIONS[0];
    const num = Number(amount) || 0;
    return `${curr.symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCurrencySymbol = () => {
    const curr = CURRENCY_OPTIONS.find((c) => c.code === settings.currency);
    return curr ? curr.symbol : 'Rs. ';
  };

  return (
    <RegionalSettingsContext.Provider
      value={{
        settings,
        companySettings,
        timezone: settings.timezone,
        timeFormat: settings.timeFormat,
        dateFormat: settings.dateFormat,
        currency: settings.currency,
        currencySymbol: getCurrencySymbol(),
        updateSettings,
        updateCompanySettings,
        getTodayDateStrInTimezone,
        getCurrentYearInTimezone,
        formatTime,
        formatDate,
        formatDayOfWeek,
        formatDateTime,
        formatCurrency,
      }}
    >
      {children}
    </RegionalSettingsContext.Provider>
  );
};

export const useRegionalSettings = () => {
  const context = useContext(RegionalSettingsContext);
  if (!context) {
    throw new Error('useRegionalSettings must be used within a RegionalSettingsProvider');
  }
  return context;
};

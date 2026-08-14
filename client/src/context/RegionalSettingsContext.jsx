import React, { createContext, useContext, useState, useEffect } from 'react';

const RegionalSettingsContext = createContext();

export const TIMEZONE_OPTIONS = [
  { id: 'Asia/Karachi', label: '🇵🇰 Pakistan Standard Time (PKT - UTC+5 / Islamabad, Karachi)' },
  { id: 'Asia/Dubai', label: '🇦🇪 Gulf Standard Time (GST - UTC+4 / Dubai, Abu Dhabi)' },
  { id: 'Asia/Riyadh', label: '🇸🇦 Arabian Standard Time (AST - UTC+3 / Riyadh, Makkah)' },
  { id: 'Europe/London', label: '🇬🇧 London, UK - GMT / BST (UTC+0 / +1)' },
  { id: 'America/New_York', label: '🇺🇸 Eastern Time (US & Canada) - EST (UTC-5)' },
  { id: 'America/Chicago', label: '🇺🇸 Central Time (US & Canada) - CST (UTC-6)' },
  { id: 'America/Los_Angeles', label: '🇺🇸 Pacific Time (US & Canada) - PST (UTC-8)' },
  { id: 'Europe/Paris', label: '🇪🇺 Paris, Berlin, Rome - CET (UTC+1)' },
  { id: 'Asia/Singapore', label: '🇸🇬 Singapore, Kuala Lumpur - SGT (UTC+8)' },
  { id: 'Asia/Kolkata', label: '🇮🇳 New Delhi, Mumbai - IST (UTC+5:30)' },
  { id: 'Asia/Tokyo', label: '🇯🇵 Tokyo, Seoul - JST (UTC+9)' },
  { id: 'Australia/Sydney', label: '🇦🇺 Sydney, Melbourne - AEST (UTC+10)' },
  { id: 'UTC', label: '🌐 Universal Coordinated Time - UTC (UTC+0)' },
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

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('nexahr_regional_settings', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Failed to save regional settings to localStorage:', e);
      }
      return updated;
    });
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
    const dateObj = typeof inputDate === 'string' || typeof inputDate === 'number' ? new Date(inputDate) : inputDate;
    if (isNaN(dateObj.getTime())) return '--';

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
        timezone: settings.timezone,
        timeFormat: settings.timeFormat,
        dateFormat: settings.dateFormat,
        currency: settings.currency,
        currencySymbol: getCurrencySymbol(),
        updateSettings,
        formatTime,
        formatDate,
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

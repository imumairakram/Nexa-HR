/**
 * Deterministic Phone, Location & Contact Information Extractor
 * Provides robust fallback when AI extraction returns empty or malformed contact info.
 */

// Common Pakistani and International phone number patterns
const PHONE_PATTERNS = [
  // +92 3xx xxxxxxx or +92-3xx-xxxxxxx or +92 3xxxxxxxxx
  /(?:\+92|0092|92)[\s.-]?(?:0?3\d{2})[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  // (03xx) xxxxxxx or 03xx-xxxxxxx or 03xx xxxxxxx
  /(?:\(03\d{2}\)|03\d{2})[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  // 11-digit continuous 03xxxxxxxxx
  /\b03\d{9}\b/g,
  // International E.164: +1 555-0199 or +44 20 7946 0991
  /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{3,4}\b/g,
];

// Patterns that look like numbers but are NOT phones (e.g. year ranges, zip codes, timestamps)
const FALSE_POSITIVE_PATTERNS = [
  /^(?:19|20)\d{2}\s*[-–—/]\s*(?:19|20)?\d{2}$/, // 2021-2024, 2018 - 2022
  /^(?:19|20)\d{2}$/,                            // Single year like 2024
  /^\d{5}(?:-\d{4})?$/,                          // US Zipcode 90210
];

/**
 * Normalizes a raw phone string into a clean readable international standard:
 * e.g. "0311-0108939" -> "+92 311 0108939"
 * e.g. "+923110108939" -> "+92 311 0108939"
 *
 * @param {string} raw
 * @returns {string|null}
 */
function normalizePhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') return null;

  // Trim and strip excess characters
  const trimmed = raw.trim();

  // Test against false positives (e.g. year ranges)
  for (const fp of FALSE_POSITIVE_PATTERNS) {
    if (fp.test(trimmed)) return null;
  }

  // Extract pure digits and leading plus
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 9 || digitsOnly.length > 15) {
    return null;
  }

  // Case 1: Pakistani number starting with 03 (e.g. 03110108939 -> 11 digits)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('03')) {
    const network = digitsOnly.slice(1, 4); // 311
    const p1 = digitsOnly.slice(4, 7);      // 010
    const p2 = digitsOnly.slice(7);         // 8939
    return `+92 ${network} ${p1}${p2}`;
  }

  // Case 2: Pakistani number starting with 923 or 00923 (e.g. 923110108939 -> 12 digits)
  if (digitsOnly.startsWith('923') && digitsOnly.length === 12) {
    const network = digitsOnly.slice(2, 5); // 311
    const p1 = digitsOnly.slice(5, 8);      // 010
    const p2 = digitsOnly.slice(8);         // 8939
    return `+92 ${network} ${p1}${p2}`;
  }

  if (digitsOnly.startsWith('00923') && digitsOnly.length === 14) {
    const network = digitsOnly.slice(4, 7);
    const p1 = digitsOnly.slice(7, 10);
    const p2 = digitsOnly.slice(10);
    return `+92 ${network} ${p1}${p2}`;
  }

  // Case 3: International number
  if (hasPlus) {
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+1 ${digitsOnly.slice(1, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
    }
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length === 10) {
    return `+1 ${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
  }

  return `+${digitsOnly}`;
}

/**
 * Extracts a phone number from arbitrary text (CV text, email body, signature)
 * Prioritizes the first valid match.
 *
 * @param {string} text
 * @returns {string|null}
 */
function extractPhoneFromText(text) {
  if (!text || typeof text !== 'string') return null;

  // Search through all regex patterns
  for (const pattern of PHONE_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      for (const m of matches) {
        const normalized = normalizePhoneNumber(m);
        if (normalized) {
          return normalized;
        }
      }
    }
  }

  return null;
}

/**
 * Extracts candidate location from CV text (e.g. "Karachi, Pakistan")
 * Focuses on header lines.
 *
 * @param {string} text
 * @returns {string|null}
 */
function extractLocationFromText(text) {
  if (!text || typeof text !== 'string') return null;

  // Check the first 1500 characters (typically header / contact info block)
  const header = text.slice(0, 1500);

  // Common Pakistani and International major tech hub city patterns
  // Avoid matching across newlines by using [^\S\r\n] (horizontal spaces only)
  const locationRegex = /\b(Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad|Peshawar|Multan|London|Dubai|New York|San Francisco|Toronto|Berlin|Singapore)(?:,[ \t]*([A-Za-z]+(?:[ \t]+[A-Za-z]+)?))?(?=[ \t]*(?:[|\n\r,]|$))/i;

  const match = header.match(locationRegex);
  if (match) {
    const city = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const country = match[2] ? match[2].trim() : '';
    if (country) {
      const formattedCountry = country
        .split(/[ \t]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      return `${city}, ${formattedCountry}`;
    }
    return city;
  }

  return null;
}

/**
 * Safely masks a phone number for logging privacy (e.g. "+92 311 ***8939")
 *
 * @param {string} phone
 * @returns {string}
 */
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return 'N/A';
  const clean = phone.trim();
  if (clean.length <= 6) return '***';

  if (clean.startsWith('+92 ') && clean.length >= 14) {
    const prefix = clean.slice(0, 8); // "+92 311 "
    const suffix = clean.slice(-4);   // "8939"
    return `${prefix}***${suffix}`;
  }

  const end = clean.slice(-4);
  const start = clean.slice(0, -4);
  if (start.length > 5) {
    const visiblePrefix = start.slice(0, 5);
    return `${visiblePrefix}***${end}`;
  }
  return start.replace(/\d/g, '*') + end;
}

module.exports = {
  extractPhoneFromText,
  normalizePhoneNumber,
  extractLocationFromText,
  maskPhone,
};

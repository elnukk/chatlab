const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_MESSAGE_LENGTH = 10000;

/**
 * Validates that all required keys are present and non-empty in the given params object.
 *
 * @param {Object} params - The object to validate.
 * @param {string[]} required - Array of required key names.
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequiredParams(params, required) {
  const missing = [];

  for (const key of required) {
    const value = params[key];
    if (value === undefined || value === null || value === '') {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Sanitizes a chat message: trims whitespace and enforces a maximum character length.
 *
 * @param {string} content - The raw message content.
 * @returns {string|null} The sanitized string, or null if the result is empty.
 */
export function sanitizeMessage(content) {
  if (typeof content !== 'string') {
    return null;
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.slice(0, MAX_MESSAGE_LENGTH);
}

/**
 * Checks whether a string is a valid UUID v4.
 *
 * @param {string} str - The string to validate.
 * @returns {boolean}
 */
export function isValidUUID(str) {
  if (typeof str !== 'string') {
    return false;
  }
  return UUID_V4_REGEX.test(str);
}

/**
 * Parses a value into a positive integer (>= 1). Returns null if invalid.
 *
 * @param {*} value - The value to parse.
 * @returns {number|null}
 */
export function parseSessionNumber(value) {
  const num = Number(value);

  if (!Number.isInteger(num) || num < 1) {
    return null;
  }

  return num;
}

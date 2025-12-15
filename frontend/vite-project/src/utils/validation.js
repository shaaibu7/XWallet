/**
 * Validation utilities for form inputs
 */

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid Ethereum address
 */
export const isValidEthereumAddress = (address) => {
  if (!address) return false;
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethereumAddressRegex.test(address);
};

/**
 * Validates if a value is a valid positive number
 * @param {string|number} value - The value to validate
 * @returns {boolean} - True if valid positive number
 */
export const isValidPositiveNumber = (value) => {
  if (value === "" || value === null || value === undefined) return false;
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validates if an amount has valid decimal places
 * @param {string|number} amount - The amount to validate
 * @param {number} decimals - Maximum allowed decimal places (default 18)
 * @returns {boolean} - True if valid
 */
export const isValidAmount = (amount, decimals = 18) => {
  if (!isValidPositiveNumber(amount)) return false;
  
  const amountStr = String(amount);
  const decimalPart = amountStr.split(".")[1];
  
  if (!decimalPart) return true;
  return decimalPart.length <= decimals;
};

/**
 * Validates wallet address and returns error message
 * @param {string} address - The address to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateWalletAddress = (address) => {
  if (!address || address.trim() === "") {
    return "Wallet address is required";
  }
  
  if (!address.startsWith("0x")) {
    return "Address must start with 0x";
  }
  
  if (address.length !== 42) {
    return "Address must be 42 characters long";
  }
  
  if (!isValidEthereumAddress(address)) {
    return "Invalid Ethereum address format";
  }
  
  return null;
};

/**
 * Validates amount and returns error message
 * @param {string|number} amount - The amount to validate
 * @param {object} options - Validation options
 * @returns {string|null} - Error message or null if valid
 */
export const validateAmount = (amount, options = {}) => {
  const { min = 0, max = null, decimals = 18, fieldName = "Amount" } = options;
  
  if (amount === "" || amount === null || amount === undefined) {
    return `${fieldName} is required`;
  }
  
  const num = Number(amount);
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (num < min) {
    return `${fieldName} must be greater than ${min}`;
  }
  
  if (max !== null && num > max) {
    return `${fieldName} cannot exceed ${max}`;
  }
  
  if (!isValidAmount(amount, decimals)) {
    return `${fieldName} cannot have more than ${decimals} decimal places`;
  }
  
  return null;
};

/**
 * Validates required field and returns error message
 * @param {string} value - The value to validate
 * @param {string} fieldName - The field name for error message
 * @returns {string|null} - Error message or null if valid
 */
export const validateRequiredField = (value, fieldName = "Field") => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates member name (alphanumeric and spaces)
 * @param {string} name - The name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateMemberName = (name) => {
  const error = validateRequiredField(name, "Member name");
  if (error) return error;
  
  if (name.length < 2) {
    return "Member name must be at least 2 characters";
  }
  
  if (name.length > 50) {
    return "Member name must not exceed 50 characters";
  }
  
  if (!/^[a-zA-Z0-9\s\-']+$/.test(name)) {
    return "Member name can only contain letters, numbers, spaces, hyphens, and apostrophes";
  }
  
  return null;
};

/**
 * Validates wallet name
 * @param {string} name - The wallet name to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateWalletName = (name) => {
  const error = validateRequiredField(name, "Wallet name");
  if (error) return error;
  
  if (name.length < 2) {
    return "Wallet name must be at least 2 characters";
  }
  
  if (name.length > 50) {
    return "Wallet name must not exceed 50 characters";
  }
  
  return null;
};

/**
 * Validates member identifier (alphanumeric)
 * @param {string} id - The identifier to validate
 * @returns {string|null} - Error message or null if valid
 */
export const validateMemberId = (id) => {
  const error = validateRequiredField(id, "Member identifier");
  if (error) return error;
  
  if (id.length < 2) {
    return "Member identifier must be at least 2 characters";
  }
  
  if (id.length > 30) {
    return "Member identifier must not exceed 30 characters";
  }
  
  if (!/^[a-zA-Z0-9\-_]+$/.test(id)) {
    return "Member identifier can only contain letters, numbers, hyphens, and underscores";
  }
  
  return null;
};

/**
 * Sanitizes wallet address by trimming and converting to lowercase
 * @param {string} address - The address to sanitize
 * @returns {string} - Sanitized address
 */
export const sanitizeAddress = (address) => {
  return address.trim();
};

/**
 * Formats error message for display
 * @param {string} error - The error message
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return "";
  return error.charAt(0).toUpperCase() + error.slice(1);
};

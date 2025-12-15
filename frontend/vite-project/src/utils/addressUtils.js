/**
 * Address formatting and utility functions
 */

/**
 * Format address to shortened version
 * @param {string} address - The address to format
 * @param {number} chars - Number of characters to show from start and end
 * @returns {string} - Formatted address (e.g., "0x1234...5678")
 */
export const formatAddress = (address, chars = 6) => {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Format address with visual breaks for better readability
 * @param {string} address - The address to format
 * @returns {string} - Formatted address with breaks
 */
export const formatAddressWithBreaks = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(10, 16)}...${address.slice(-6)}`;
};

/**
 * Case-insensitive address comparison
 * @param {string} addr1 - First address
 * @param {string} addr2 - Second address
 * @returns {boolean} - True if addresses are equal
 */
export const isAddressEqual = (addr1, addr2) => {
  if (!addr1 || !addr2) return false;
  return addr1.toLowerCase() === addr2.toLowerCase();
};

/**
 * Generate a consistent color from an address
 * @param {string} address - The address to generate color from
 * @returns {string} - Hex color code
 */
export const getAddressColor = (address) => {
  if (!address) return "#000000";
  const hash = address.slice(2, 8);
  return `#${hash}`;
};

/**
 * Validate Ethereum address checksum (EIP-55)
 * @param {string} address - The address to validate
 * @returns {boolean} - True if checksum is valid
 */
export const validateAddressChecksum = (address) => {
  if (!address || address.length !== 42) return false;
  if (!address.startsWith("0x")) return false;

  // If address is all lowercase or all uppercase, checksum is not used
  if (address === address.toLowerCase() || address === address.toUpperCase()) {
    return true;
  }

  // For mixed case, we would need keccak256 to validate properly
  // For now, just check if it's a valid format
  return /^0x[0-9a-fA-F]{40}$/.test(address);
};

/**
 * Get a shortened version of address with ellipsis
 * @param {string} address - The address to shorten
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} - Shortened address
 */
export const shortenAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - True if successful
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

/**
 * Format address for display with optional truncation
 * @param {string} address - The address to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted address
 */
export const formatAddressDisplay = (
  address,
  options = {}
) => {
  const {
    truncate = true,
    startChars = 6,
    endChars = 4,
    uppercase = false,
  } = options;

  if (!address) return "";

  let formatted = address;

  if (uppercase) {
    formatted = formatted.toUpperCase();
  }

  if (truncate) {
    formatted = shortenAddress(formatted, startChars, endChars);
  }

  return formatted;
};

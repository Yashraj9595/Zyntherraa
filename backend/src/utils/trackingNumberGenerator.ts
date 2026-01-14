/**
 * Generate unique tracking number for orders
 * Format: ZYN + timestamp + random string
 * Example: ZYN1A2B3C4D5E6F7G8H9
 */
export function generateTrackingNumber(): string {
  const prefix = 'ZYN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * Validate tracking number format
 */
export function isValidTrackingNumber(trackingNumber: string): boolean {
  const pattern = /^ZYN[A-Z0-9]{15,20}$/;
  return pattern.test(trackingNumber);
}


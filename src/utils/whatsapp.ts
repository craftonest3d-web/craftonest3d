/**
 * CRAFTONEST3D – WhatsApp Click-to-Chat helpers (FREE, manual send)
 *
 * These helpers power the admin "Send WhatsApp Tracking Details" flow.
 * There is NO automation here: we only build a wa.me URL the admin opens
 * from a click handler, reviews, and sends manually. No external API,
 * no localStorage, no stored customer data.
 */

/**
 * Normalize a raw phone string into a wa.me-ready digits-only number.
 *
 * Rules:
 *  - Strip every non-digit character first.
 *  - 10 digits            → assume Indian mobile, prefix "91".
 *  - 12 digits w/ "91..." → already has the Indian country code, keep as-is.
 *  - 11 digits w/ "0..."  → drop the leading 0, then prefix "91".
 *  - 11–15 digits (other) → treat as a valid international number, keep as-is.
 *  - anything < 10 digits  → invalid, return null.
 *
 * @returns the normalized digits string, or null when clearly invalid.
 */
export function normalizeIndianPhone(raw: string): string | null {
  const digits = (raw || '').replace(/\D/g, '');

  if (digits.length < 10) return null;

  // Plain Indian 10-digit mobile → add country code.
  if (digits.length === 10) return '91' + digits;

  // 11 digits starting with a trunk 0 (e.g. 0 98765 43210) → Indian number.
  if (digits.length === 11 && digits.startsWith('0')) {
    return '91' + digits.slice(1);
  }

  // Already carries the Indian country code.
  if (digits.length === 12 && digits.startsWith('91')) return digits;

  // Valid international lengths — keep as entered.
  if (digits.length >= 11 && digits.length <= 15) return digits;

  return null;
}

/**
 * Validate a tracking link. Accept only real http/https URLs.
 */
export function isValidTrackingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Build the official WhatsApp Click-to-Chat URL (same shape as the existing
 * waUrl() in productService.ts). `phoneDigits` must already be normalized.
 */
export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

/**
 * Compose the shipping notification message from order data.
 * Placeholders are replaced with the actual values; blank lines and emojis
 * are intentional and preserved exactly.
 */
export function buildShippingMessage(input: {
  customerName: string;
  orderRef: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
}): string {
  return (
    `Hi ${input.customerName}! 👋\n\n` +
    `Great news! 🎉 Your CRAFTONEST3D order #${input.orderRef} has been shipped.\n\n` +
    `📦 Courier: ${input.courier}\n\n` +
    `🚚 Tracking ID: ${input.trackingNumber}\n\n` +
    `🔗 Track your order:\n${input.trackingUrl}\n\n` +
    `Thank you for shopping with CRAFTONEST3D! ❤️\n\n` +
    `Where Ideas Take Shape.`
  );
}

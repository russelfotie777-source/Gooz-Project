// Mirrors the backend's shipping_phone rule (CheckoutRequest: regex:/^\+?[0-9]{8,15}$/).
// Spaces/dashes are stripped first since the field's own placeholder
// ("677 47 22 14") encourages typing them, and the backend rejects that
// raw input with a validation error at the very last step of checkout.
export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function isValidPhone(value: string): boolean {
  return /^\+?[0-9]{8,15}$/.test(normalizePhone(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Input validation and sanitization utilities for CampusAid.
 * Used on both client and server for security.
 */

const MAX_TEXT_LENGTH = 1000;
const PHONE_REGEX = /^\+[1-9]\d{9,14}$/;

/**
 * Validates an international phone number (E.164 format).
 * Must start with + and country code, 10-15 digits total.
 */
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim().length === 0) return false;
  return PHONE_REGEX.test(phone.trim());
}

/**
 * Validates a text emergency description.
 * Must be non-empty and within length limit.
 */
export function validateTextInput(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  if (text.length > MAX_TEXT_LENGTH) return false;
  return true;
}

/**
 * Sanitizes user input by stripping HTML/script tags.
 * Prevents XSS in rendered output.
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "");
}

/**
 * Validates an image file type and size.
 * Max 10MB, only common image types.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, WebP, and GIF images are allowed." };
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, error: "Image must be smaller than 10MB." };
  }
  return { valid: true };
}

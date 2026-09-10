import path from 'path';

/**
 * Validates and sanitizes a file path to prevent Directory / Path Traversal attacks (../, %2e%2e, \..).
 */
export function sanitizeFilePath(userPath: string, allowedPrefix: string = '/assets/'): { valid: boolean; safePath: string } {
  if (!userPath || typeof userPath !== 'string') {
    return { valid: false, safePath: '' };
  }

  // Check for null bytes (%00 or \0)
  if (userPath.includes('\0') || userPath.includes('%00')) {
    return { valid: false, safePath: '' };
  }

  // Check for encoded path traversal sequences
  const decoded = decodeURIComponent(userPath);
  if (decoded.includes('..') || userPath.includes('..')) {
    return { valid: false, safePath: '' };
  }

  // Normalize path using posix
  const normalized = path.posix.normalize(userPath.replace(/\\/g, '/'));

  // Ensure path starts with allowed prefix if specified
  if (allowedPrefix && !normalized.startsWith(allowedPrefix)) {
    return { valid: false, safePath: '' };
  }

  // Whitelist allowable characters: alphanumeric, dash, underscore, dot, slash, spaces (encoded or plain)
  if (!/^[\/a-zA-Z0-9_\-.\s%()]+$/.test(normalized)) {
    return { valid: false, safePath: '' };
  }

  return { valid: true, safePath: normalized };
}

/**
 * Strips dangerous HTML tags and script tags to prevent stored/reflected XSS.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Strip all HTML tags
    .trim();
}

/**
 * Validates that a slug contains only safe URL-friendly characters.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100;
}

/**
 * Username/handle utilities for due.college/{handle} URLs.
 * Handles must be unique, lowercase, 3-20 chars, start with a letter,
 * only contain letters/digits/hyphens, and not clash with reserved routes.
 */

export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  // App routes
  'dashboard', 'deadlines', 'school', 'schools', 'circle', 'circles',
  'essays', 'essay', 'discover', 'activities', 'activity', 'decisions',
  'decision', 'suggest', 'explore', 'profile', 'profiles', 'settings',
  'account', 'accounts', 'login', 'logout', 'signin', 'signout', 'signup',
  'start', 'register', 'join', 'invite', 'invites', 'welcome',
  // System / API
  'api', 'admin', 'root', 'static', '_next', 'public', 'assets', 'images',
  'img', 'icons', 'college-logos', 'favicon', 'sitemap', 'robots',
  'webhook', 'webhooks', 'health', 'status', 'ping',
  // Marketing / legal
  'about', 'pricing', 'plans', 'contact', 'help', 'support', 'docs',
  'documentation', 'blog', 'press', 'news', 'careers', 'jobs',
  'terms', 'tos', 'privacy', 'legal', 'cookies', 'security',
  // Common reservations
  'home', 'index', 'app', 'web', 'mobile', 'ios', 'android',
  'mail', 'email', 'hello', 'team', 'staff', 'official',
  'anonymous', 'me', 'you', 'user', 'users',
  'null', 'undefined', 'true', 'false',
]);

const HANDLE_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

export type HandleValidationError =
  | 'too_short'
  | 'too_long'
  | 'invalid_chars'
  | 'must_start_with_letter'
  | 'reserved'
  | 'ok';

/** Validate a handle. Returns 'ok' or a specific error code. Does NOT check uniqueness. */
export function validateHandle(raw: string): HandleValidationError {
  if (!raw) return 'too_short';
  const h = raw.toLowerCase();
  if (h.length < 3) return 'too_short';
  if (h.length > 20) return 'too_long';
  if (!/^[a-z]/.test(h)) return 'must_start_with_letter';
  if (!HANDLE_RE.test(h)) return 'invalid_chars';
  if (RESERVED_HANDLES.has(h)) return 'reserved';
  return 'ok';
}

/** Turn any string into a handle-safe slug (no guarantees on uniqueness). */
export function slugifyName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^[^a-z]+/, '')
    .slice(0, 20) || 'user';
}

/** Given a base ("sarah") and a list of taken handles, produce 3 suggestions. */
export function suggestHandles(base: string, taken: ReadonlySet<string>): string[] {
  const b = slugifyName(base);
  const suggestions: string[] = [];
  const candidates = [
    b,
    `${b}${Math.floor(Math.random() * 900 + 100)}`,
    `${b}-${Math.random().toString(36).slice(2, 5)}`,
    `${b}1`, `${b}2`, `${b}3`,
    `the-${b}`, `${b}-app`,
  ];
  for (const c of candidates) {
    if (suggestions.length >= 3) break;
    if (c.length < 3 || c.length > 20) continue;
    if (taken.has(c)) continue;
    if (RESERVED_HANDLES.has(c)) continue;
    if (!HANDLE_RE.test(c)) continue;
    if (!suggestions.includes(c)) suggestions.push(c);
  }
  return suggestions;
}

/** Human-readable error for UI display. */
export function handleErrorMessage(err: HandleValidationError): string {
  switch (err) {
    case 'too_short': return 'Must be at least 3 characters.';
    case 'too_long': return 'Must be 20 characters or fewer.';
    case 'invalid_chars': return 'Only lowercase letters, numbers, and single hyphens.';
    case 'must_start_with_letter': return 'Must start with a letter.';
    case 'reserved': return 'That handle is reserved.';
    case 'ok': return '';
  }
}

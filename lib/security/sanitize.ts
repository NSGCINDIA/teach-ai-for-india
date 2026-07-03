/**
 * Input sanitization + output escaping for user-supplied free text (issue #11).
 *
 * Two distinct concerns, kept separate on purpose:
 *  - sanitizeText: normalize on INPUT (trim, strip control chars, collapse
 *    whitespace). Applied in Zod schemas so every action stores clean values.
 *    It does NOT strip markup — that would silently mangle legitimate text and
 *    lose information; escaping at output is the correct defense.
 *  - escapeHtml: escape on OUTPUT, whenever a value is interpolated into a raw
 *    HTML string (transactional emails). React JSX already auto-escapes, so its
 *    output does not need this.
 */

// Replace ASCII control characters (C0 range < 0x20 and DEL 0x7F) with a space,
// then collapse whitespace runs and trim. Char-code check avoids embedding
// control bytes / escape sequences in source.
export function sanitizeText(input: string): string {
  let out = ''
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0
    out += code < 0x20 || code === 0x7f ? ' ' : ch
  }
  return out.replace(/\s+/g, ' ').trim()
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escape a value for safe interpolation into a raw HTML string (e.g. email). */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch])
}

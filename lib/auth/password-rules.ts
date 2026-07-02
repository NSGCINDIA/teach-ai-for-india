/**
 * Client-side mirror of the password strength rules enforced by
 * `setPasswordSchema` / `signupSchema` in `lib/validations/auth.ts`.
 *
 * These power the debounced live feedback on the signup / set-password forms.
 * They are a UX aid only — the server-side Zod schemas remain the source of
 * truth and the final gate on submit.
 */
export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'Contains a letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { label: 'Contains a number', test: (v: string) => /[0-9]/.test(v) },
] as const

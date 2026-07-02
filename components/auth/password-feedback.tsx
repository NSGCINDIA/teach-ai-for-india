import { Check, X } from 'lucide-react'
import { PASSWORD_RULES } from '@/lib/auth/password-rules'

/**
 * Presentational strength checklist. Callers pass an already-debounced value
 * so feedback only settles after the user pauses typing.
 */
export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  return (
    <ul className="mt-1.5 space-y-1" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value)
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs ${ok ? 'text-success' : 'text-muted-foreground'}`}
          >
            {ok ? <Check className="size-3.5 shrink-0" /> : <X className="size-3.5 shrink-0" />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Presentational match indicator. Callers pass already-debounced values.
 * Renders nothing until the user has started confirming the password.
 */
export function PasswordMatch({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return null
  const match = password === confirm
  return (
    <p
      aria-live="polite"
      className={`mt-1.5 flex items-center gap-1.5 text-xs ${match ? 'text-success' : 'text-error'}`}
    >
      {match ? <Check className="size-3.5 shrink-0" /> : <X className="size-3.5 shrink-0" />}
      {match ? 'Passwords match' : "Passwords don't match"}
    </p>
  )
}

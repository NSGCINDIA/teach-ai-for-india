import { z } from 'zod'

/**
 * Sanitizes database and server action errors to prevent leaking raw PostgreSQL / RLS error details
 * (such as table names, policy definitions, column names, raw Zod enum strings) to the client UI for security reasons.
 */
export function sanitizeDbError(error: unknown, fallbackMessage?: string): string {
  if (!error) return fallbackMessage || 'An unexpected error occurred.'

  const message = typeof error === 'string'
    ? error
    : (error as { message?: string }).message || String(error)

  // 1. Zod Enum & Schema Technical Messages (Prevent leaking schema enum options)
  if (
    /invalid enum value/i.test(message) ||
    /expected '.*' \| '.*'/i.test(message) ||
    /received '.*'/i.test(message)
  ) {
    if (/lead_source|google_maps|principal_referral/i.test(message)) {
      return 'Please select how you identified this school.'
    }
    if (/school_type|government|private/i.test(message)) {
      return 'Please select a valid school type.'
    }
    if (/board|state_board|cbse/i.test(message)) {
      return 'Please select a valid education board.'
    }
    return 'Please select a valid option from the dropdown menu.'
  }

  // 2. Row Level Security / Permission Errors
  if (
    /row-level security/i.test(message) ||
    /violates.*policy/i.test(message) ||
    /permission denied/i.test(message) ||
    /unauthorized/i.test(message)
  ) {
    return 'You do not have permission to perform this action for this school or campus.'
  }

  // 3. Duplicate Key / Unique Constraint Errors
  if (/duplicate key/i.test(message) || /unique constraint/i.test(message)) {
    return 'A record with this information already exists.'
  }

  // 4. Foreign Key Reference Errors
  if (/foreign key constraint/i.test(message)) {
    return 'The referenced item was not found or is no longer available.'
  }

  // 5. Known Business Logic / Trigger Messages
  if (/execution plan must be approved/i.test(message)) {
    return 'This session needs an approved execution plan before it can start.'
  }
  if (/Illegal session transition/i.test(message)) {
    return 'That status change is not allowed from the current stage.'
  }
  if (/student count, volunteer count and topic/i.test(message)) {
    return 'Please fill in student count, volunteer count, and topic before reporting.'
  }
  if (/Only Campus Lead or above may cancel/i.test(message)) {
    return 'Only a Campus Lead or above may cancel a session.'
  }
  if (/at least 1 photo and 1 attendance/i.test(message)) {
    return 'Add a Session Photo link and an Attendance/Report document link before submitting the report.'
  }

  // 6. Internal PostgreSQL faults (type/operator/function mismatches) — never
  // surface the raw text; it is a bug report, not something the user can act on.
  if (
    /operator does not exist/i.test(message) ||
    /function .* does not exist/i.test(message) ||
    /invalid input value for enum/i.test(message) ||
    /syntax error at or near/i.test(message)
  ) {
    return fallbackMessage || 'Something went wrong while saving. Please try again, or contact your Campus Lead if it keeps happening.'
  }

  // 7. Strip raw SQL schema indicators (table, column, relation names)
  if (/table ".*"/i.test(message) || /column ".*"/i.test(message) || /relation ".*"/i.test(message)) {
    return fallbackMessage || 'Action could not be completed due to database policy constraints.'
  }

  return message
}

/**
 * Sanitizes Zod validation errors to ensure no raw technical schema structures or raw enum lists are exposed.
 */
export function sanitizeZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0]
  if (!firstIssue) return 'Invalid input provided. Please check the form fields.'

  // If issue has a clean custom message (not Zod's default "Invalid enum value..."), use it if safe
  const message = firstIssue.message
  if (/invalid enum value/i.test(message) || /expected '.*' \| '.*'/i.test(message)) {
    return sanitizeDbError(message, 'Please select a valid option from the dropdown.')
  }

  return sanitizeDbError(message, 'Invalid input provided. Please check your form entries.')
}

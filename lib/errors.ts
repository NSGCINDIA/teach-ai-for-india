/**
 * Sanitizes database and server action errors to prevent leaking raw PostgreSQL / RLS error details
 * (such as table names, policy definitions, column names) to the client UI for security reasons.
 */
export function sanitizeDbError(error: unknown, fallbackMessage?: string): string {
  if (!error) return fallbackMessage || 'An unexpected error occurred.'

  const message = typeof error === 'string'
    ? error
    : (error as { message?: string }).message || String(error)

  // 1. Row Level Security / Permission Errors
  if (
    /row-level security/i.test(message) ||
    /violates.*policy/i.test(message) ||
    /permission denied/i.test(message) ||
    /unauthorized/i.test(message)
  ) {
    return 'You do not have permission to perform this action for this school or campus.'
  }

  // 2. Duplicate Key / Unique Constraint Errors
  if (/duplicate key/i.test(message) || /unique constraint/i.test(message)) {
    return 'A record with this information already exists.'
  }

  // 3. Foreign Key Reference Errors
  if (/foreign key constraint/i.test(message)) {
    return 'The referenced item was not found or is no longer available.'
  }

  // 4. Known Business Logic / Trigger Messages
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

  // 5. If the error message still contains SQL schema indicators like table/column names, strip them
  if (/table ".*"/i.test(message) || /column ".*"/i.test(message) || /relation ".*"/i.test(message)) {
    return fallbackMessage || 'Action could not be completed due to database policy constraints.'
  }

  return message
}

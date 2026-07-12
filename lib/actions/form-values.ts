/**
 * Raw submitted field values as strings, to echo back in an action's error
 * state so a form can repopulate itself. React 19 resets uncontrolled
 * `<form action>` fields to their `defaultValue` after every submission
 * attempt — success OR failure — so without this, any validation/DB error
 * silently clears everything the user typed.
 */
export function formValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(formData) as Record<string, string>
}

type StateWithValues = { values?: Record<string, string> }

/**
 * Default value for a text/number/date/select field: the just-submitted
 * value if a submission was attempted, otherwise the existing record's value.
 */
export function fieldValue(state: StateWithValues, key: string, fallback: string): string {
  return state.values?.[key] ?? fallback
}

/**
 * Default checked-state for a checkbox. An unchecked checkbox is omitted from
 * FormData entirely, so "was this key submitted" can't be read off key
 * presence — discriminate on whether ANY submission was attempted
 * (`state.values` exists at all) rather than on this specific key.
 */
export function fieldChecked(state: StateWithValues, key: string, fallback: boolean | undefined): boolean | undefined {
  if (!state.values) return fallback
  return state.values[key] === 'on' || state.values[key] === 'true'
}

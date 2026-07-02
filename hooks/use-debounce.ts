import * as React from 'react'

/**
 * Returns a copy of `value` that only updates after it has stopped changing
 * for `delay` ms. Useful for live form feedback that shouldn't fire on every
 * keystroke while the user is still mid-typing.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

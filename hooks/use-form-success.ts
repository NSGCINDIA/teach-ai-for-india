'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { toast } from 'sonner'

/** The shape every server action in this app returns from `useActionState`. */
export interface FormActionState {
  ok?: boolean
  message?: string
  error?: string
}

interface FormSuccessOptions {
  /** Form to clear once the submission succeeds. */
  formRef?: RefObject<HTMLFormElement | null>
  /** Overrides the action's own `message` in the toast. */
  message?: string
  /** Extra cleanup — closing the panel, clearing controlled state, etc. */
  onSuccess?: () => void
}

/**
 * Shows a success toast and clears the form after a server action succeeds.
 *
 * `useActionState` hands back a brand-new state object per submission, so the
 * previously handled object is tracked by identity: re-renders caused by
 * unrelated state (typing in a sibling field) can't fire a duplicate toast, but
 * two identical successes in a row still each get one.
 *
 * The reset runs only on `ok` — a failed submission keeps what the user typed
 * so they can correct it rather than starting over.
 */
export function useFormSuccess(state: FormActionState | undefined, options: FormSuccessOptions = {}) {
  const { formRef, message, onSuccess } = options
  const handled = useRef<FormActionState | null>(null)

  useEffect(() => {
    if (!state?.ok) return
    if (handled.current === state) return
    handled.current = state

    toast.success(message ?? state.message ?? 'Submitted successfully')
    formRef?.current?.reset()
    onSuccess?.()
  }, [state, message, formRef, onSuccess])
}

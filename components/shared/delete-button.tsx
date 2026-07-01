'use client'

import { useActionState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'

type State = { error?: string; ok?: boolean; message?: string }
type Action = (prev: State, formData: FormData) => Promise<State>

interface Props {
  action: Action
  /** Hidden fields (e.g. { id, session_id }) submitted with the delete. */
  fields: Record<string, string>
  label?: string
  confirm?: string
}

/** Small inline delete form. Reused by announcements, certificates, etc. */
export function DeleteButton({ action, fields, label = 'Remove', confirm }: Props) {
  const [, formAction, pending] = useActionState<State, FormData>(action, {})
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault()
      }}
    >
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded p-1 text-xs text-muted-foreground hover:text-error disabled:opacity-50"
        aria-label={label}
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
        <span className="sr-only sm:not-sr-only">{label}</span>
      </button>
    </form>
  )
}

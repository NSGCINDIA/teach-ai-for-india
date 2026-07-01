'use client'

import { useActionState, useState } from 'react'
import { Check, Loader2, Mail } from 'lucide-react'
import { markMessageHandled, type AdminActionState } from '@/actions/admin'
import type { ContactMessageItem } from '@/lib/data/admin'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/states'

export function MessagesInbox({ messages }: { messages: ContactMessageItem[] }) {
  const [showHandled, setShowHandled] = useState(false)
  const visible = showHandled ? messages : messages.filter((m) => !m.is_handled)
  const unhandled = messages.filter((m) => !m.is_handled).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{unhandled} unhandled</p>
        <Button variant="ghost" size="sm" onClick={() => setShowHandled((v) => !v)}>
          {showHandled ? 'Hide handled' : 'Show all'}
        </Button>
      </div>
      {visible.length === 0 ? (
        <EmptyState icon={Mail} title="Inbox zero" description="No contact messages need attention." />
      ) : (
        <ul className="space-y-2">
          {visible.map((m) => <MessageItem key={m.id} message={m} />)}
        </ul>
      )}
    </div>
  )
}

function MessageItem({ message }: { message: ContactMessageItem }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(markMessageHandled, {})
  const handled = message.is_handled || state.ok

  return (
    <li className={`rounded-lg border border-border p-3 ${handled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {message.subject || '(no subject)'}
            <span className="ml-2 font-normal text-muted-foreground">— {message.name}</span>
          </p>
          <p className="text-xs text-muted-foreground">{message.email} · {formatDate(message.created_at)}</p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm">{message.message}</p>
        </div>
        {!handled && (
          <form action={action}>
            <input type="hidden" name="id" value={message.id} />
            <Button type="submit" size="sm" variant="outline" disabled={pending} className="gap-1.5">
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Handled
            </Button>
          </form>
        )}
      </div>
      {state.error && <p role="alert" className="mt-1 text-xs text-error">{state.error}</p>}
    </li>
  )
}

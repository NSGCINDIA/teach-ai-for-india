'use client'

import { useActionState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitBlog } from '@/actions/blogs'

export function SubmitButton({ id }: { id: string }) {
  const [, formAction, pending] = useActionState(submitBlog, {})

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm('Submit this article for admin review?')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        disabled={pending}
        size="sm"
        className="bg-success hover:bg-success/90 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send size={12} />}
        Submit
      </Button>
    </form>
  )
}

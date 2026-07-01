'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle2, Code2, Loader2, RotateCcw } from 'lucide-react'
import { saveContentBlock, type AdminActionState } from '@/actions/admin'
import { relativeTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface EditableBlock {
  block_key: string
  label: string
  description: string
  content: Record<string, unknown>
  updated_at: string | null
}

/** CMS block editor (PRD §7.10) — edit JSON per block; save triggers ISR revalidation. */
export function ContentEditor({ blocks }: { blocks: EditableBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b) => <BlockCard key={b.block_key} block={b} />)}
    </div>
  )
}

function pretty(content: Record<string, unknown>): string {
  return JSON.stringify(content, null, 2)
}

function BlockCard({ block }: { block: EditableBlock }) {
  const initial = pretty(block.content)
  const [value, setValue] = useState(initial)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveContentBlock, {})
  const dirty = value !== initial

  function validate(next: string) {
    setValue(next)
    if (!next.trim()) return setJsonError(null)
    try {
      JSON.parse(next)
      setJsonError(null)
    } catch {
      setJsonError('Invalid JSON — check commas and quotes.')
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4 text-muted-foreground" /> {block.label}
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {block.description} · <code className="rounded bg-muted px-1">{block.block_key}</code>
            {block.updated_at && ` · updated ${relativeTime(block.updated_at)}`}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="block_key" value={block.block_key} />
          <input type="hidden" name="content" value={value} />
          <Textarea
            value={value}
            onChange={(e) => validate(e.target.value)}
            rows={Math.min(20, Math.max(6, value.split('\n').length + 1))}
            spellCheck={false}
            className="font-mono text-xs"
            aria-label={`${block.label} JSON`}
          />
          {jsonError && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error"><AlertCircle className="size-4" /> {jsonError}</p>
          )}
          {state.error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error"><AlertCircle className="size-4" /> {state.error}</p>
          )}
          {state.ok && !dirty && (
            <p className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="size-4" /> {state.message}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending || !!jsonError || !dirty}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null} Save &amp; publish
            </Button>
            {dirty && (
              <Button type="button" size="sm" variant="ghost" onClick={() => { setValue(initial); setJsonError(null) }}>
                <RotateCcw className="size-3.5" /> Reset
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

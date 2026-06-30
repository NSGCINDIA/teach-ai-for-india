'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { createSchool, updateSchool, type SchoolActionState } from '@/actions/schools'
import { SCHOOL_STATUS_META } from '@/lib/constants/status'
import type { SchoolRow, CampusRow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

const SCHOOL_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'government_aided', label: 'Government Aided' },
  { value: 'private', label: 'Private' },
]
const BOARDS = [
  { value: 'state', label: 'State Board' },
  { value: 'cbse', label: 'CBSE' },
  { value: 'icse', label: 'ICSE' },
  { value: 'other', label: 'Other' },
]

interface SchoolFormProps {
  /** When present, the form edits this school; otherwise it creates a new one. */
  school?: SchoolRow
  campuses: Pick<CampusRow, 'id' | 'name'>[]
  /** Campus leads/outreach heads are pinned to their own campus. */
  lockedCampusId?: string | null
  cancelHref: string
}

export function SchoolForm({ school, campuses, lockedCampusId, cancelHref }: SchoolFormProps) {
  const isEdit = Boolean(school)
  const [state, action, pending] = useActionState<SchoolActionState, FormData>(
    isEdit ? updateSchool : createSchool,
    {},
  )

  return (
    <form action={action} className="space-y-6" noValidate>
      {isEdit && <input type="hidden" name="id" value={school!.id} />}

      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p role="status" className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {state.message}
        </p>
      )}

      {/* Blocking dedup warning (PRD §7.3) — re-submit acknowledges. */}
      {state.duplicates && state.duplicates.length > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium text-warning">
            <AlertTriangle className="size-4" /> Possible duplicate{state.duplicates.length > 1 ? 's' : ''} in this district
          </p>
          <ul className="mt-2 space-y-1 text-foreground">
            {state.duplicates.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3">
                <span>{d.name} · {SCHOOL_STATUS_META[d.status].label}</span>
                <span className="text-xs text-muted-foreground">edit distance {d.distance}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-muted-foreground">
            If this is genuinely a different school, submit again to create it anyway.
          </p>
          <input type="hidden" name="acknowledge_duplicate" value="true" />
        </div>
      )}

      <Section title="Identity">
        <Field label="School name" required className="sm:col-span-2">
          <Input name="name" required defaultValue={school?.name} placeholder="Zilla Parishad High School" />
        </Field>
        <Field label="School type" required>
          <select name="school_type" className={SELECT_CLASS} defaultValue={school?.school_type ?? 'government'}>
            {SCHOOL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Board" required>
          <select name="board" className={SELECT_CLASS} defaultValue={school?.board ?? 'state'}>
            {BOARDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </Field>
        <Field label="DISE code">
          <Input name="dise_code" inputMode="numeric" defaultValue={school?.dise_code ?? ''} placeholder="11-digit code" />
        </Field>
      </Section>

      <Section title="Location">
        <Field label="State" required>
          <Input name="state" required defaultValue={school?.state} placeholder="Telangana" />
        </Field>
        <Field label="District" required>
          <Input name="district" required defaultValue={school?.district} placeholder="Rangareddy" />
        </Field>
        <Field label="Mandal">
          <Input name="mandal" defaultValue={school?.mandal ?? ''} />
        </Field>
        <Field label="Cluster">
          <Input name="cluster" defaultValue={school?.cluster ?? ''} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <Input name="address" defaultValue={school?.address ?? ''} />
        </Field>
      </Section>

      <Section title="Outreach">
        <Field label="Campus" required>
          {lockedCampusId ? (
            <>
              <input type="hidden" name="campus_id" value={lockedCampusId} />
              <Input value={campuses.find((c) => c.id === lockedCampusId)?.name ?? 'Your campus'} disabled />
            </>
          ) : (
            <select name="campus_id" className={SELECT_CLASS} defaultValue={school?.campus_id ?? ''}>
              <option value="">— Select campus —</option>
              {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </Field>
        <Field label="Next action date">
          <Input type="date" name="next_action_date" defaultValue={school?.next_action_date ?? ''} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <Textarea name="notes" rows={3} defaultValue={school?.notes ?? ''} placeholder="Context, history, anything the next person needs." />
        </Field>
      </Section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? 'Save changes' : 'Create school'}
        </Button>
        <Button asChild variant="ghost">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-border p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function Field({
  label, required, className, children,
}: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label>
        {label} {required && <span className="text-error">*</span>}
      </Label>
      {children}
    </div>
  )
}

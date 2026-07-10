'use client'

import { useActionState, useEffect, useState } from 'react'
import { AlertCircle, Loader2, Pencil, Plus } from 'lucide-react'
import { saveCampus, type AdminActionState } from '@/actions/admin'
import { fieldValue, fieldChecked } from '@/lib/actions/form-values'
import type { AdminCampus } from '@/lib/data/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

const SELECT_CLASS =
  'border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30'

type LeadOption = { id: string; full_name: string }

interface Props {
  campus?: AdminCampus
  leads: LeadOption[]
}

/** Create or edit a campus + its targets (PRD §7.9 campus config). Admin-only. */
export function CampusForm({ campus, leads }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveCampus, {})
  const editing = !!campus

  useEffect(() => {
    if (state.ok) setOpen(false)
  }, [state.ok])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="ghost" size="sm" className="gap-1.5"><Pencil className="size-3.5" /> Edit</Button>
        ) : (
          <Button className="gap-1.5"><Plus className="size-4" /> Add campus</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${campus.name}` : 'Add a campus'}</DialogTitle>
          <DialogDescription>Set the campus profile, targets, and lead.</DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          {campus && <input type="hidden" name="id" value={campus.id} />}
          {state.error && (
            <p role="alert" className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
              <AlertCircle className="size-4 shrink-0" /> {state.error}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Campus name</Label>
              <Input id="name" name="name" required defaultValue={fieldValue(state, 'name', campus?.name ?? '')} placeholder="NIAT Hyderabad" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required defaultValue={fieldValue(state, 'slug', campus?.slug ?? '')} placeholder="niat-hyderabad" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="university_name">University</Label>
              <Input id="university_name" name="university_name" required defaultValue={fieldValue(state, 'university_name', campus?.university_name ?? '')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quarter">Quarter</Label>
              <Input id="quarter" name="quarter" defaultValue={fieldValue(state, 'quarter', campus?.quarter ?? '')} placeholder="Q3 FY26" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required defaultValue={fieldValue(state, 'city', campus?.city ?? '')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" required defaultValue={fieldValue(state, 'state', campus?.state ?? '')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lead_user_id">Campus lead</Label>
            <select id="lead_user_id" name="lead_user_id" className={SELECT_CLASS} defaultValue={fieldValue(state, 'lead_user_id', campus?.lead_user_id ?? '')}>
              <option value="">Unassigned</option>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
            </select>
          </div>

          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="mb-1 text-sm font-medium">Targets</legend>
            <div className="space-y-1.5">
              <Label htmlFor="target_schools">Schools</Label>
              <Input id="target_schools" name="target_schools" type="number" min={0} defaultValue={fieldValue(state, 'target_schools', String(campus?.target_schools ?? 0))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target_students">Students</Label>
              <Input id="target_students" name="target_students" type="number" min={0} defaultValue={fieldValue(state, 'target_students', String(campus?.target_students ?? 0))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target_sessions">Sessions</Label>
              <Input id="target_sessions" name="target_sessions" type="number" min={0} defaultValue={fieldValue(state, 'target_sessions', String(campus?.target_sessions ?? 0))} />
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} defaultValue={fieldValue(state, 'description', campus?.description ?? '')} placeholder="Short public-facing blurb for the campus page." />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={fieldChecked(state, 'is_active', campus?.is_active ?? true)} className="size-4 rounded border-input" />
            Active (shown on the public site)
          </label>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null} {editing ? 'Save changes' : 'Create campus'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

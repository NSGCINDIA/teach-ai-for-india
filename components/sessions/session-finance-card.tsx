'use client'

import { useActionState, useState } from 'react'
import { DollarSign, Receipt, FileCheck, ExternalLink, Plus, Loader2 } from 'lucide-react'
import type { SessionFinanceSummary } from '@/lib/data/operational-expenses'
import {
  recordOperationalExpense,
  verifyOperationalExpense,
  type OperationalExpenseActionState,
} from '@/actions/operational-expenses'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface SessionFinanceCardProps {
  sessionId: string
  schoolId: string
  finance: SessionFinanceSummary
  canManage: boolean
}

export function SessionFinanceCard({ sessionId, schoolId, finance, canManage }: SessionFinanceCardProps) {
  const [recState, recAction, recPending] = useActionState<OperationalExpenseActionState, FormData>(
    recordOperationalExpense,
    {},
  )
  const [verState, verAction, verPending] = useActionState<OperationalExpenseActionState, FormData>(
    verifyOperationalExpense,
    {},
  )

  const [isFormOpen, setIsFormOpen] = useState(false)

  const statusStyle = {
    NOT_STARTED: 'border-border text-muted-foreground',
    IN_PROGRESS: 'border-brand/30 bg-brand/10 text-brand',
    ATTENTION_REQUIRED: 'border-destructive/30 bg-destructive/10 text-destructive',
    CLOSED: 'border-success/30 bg-success/10 text-success',
  }[finance.status]

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <DollarSign className="size-4 text-brand" /> Session {finance.sessionNumber} Financial Summary
        </h4>
        <Badge variant="outline" className={statusStyle}>
          {finance.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-muted/20 p-3 rounded-lg border">
        <div>
          <span className="text-[10px] uppercase text-muted-foreground block">Planned Budget</span>
          <strong className="font-semibold text-sm">₹{finance.plannedBudget}</strong>
        </div>
        <div>
          <span className="text-[10px] uppercase text-muted-foreground block">Actual Spend</span>
          <strong className="font-semibold text-sm text-brand">₹{finance.actualSpend}</strong>
        </div>
        <div>
          <span className="text-[10px] uppercase text-muted-foreground block">Variance</span>
          <strong className={`font-semibold text-sm ${finance.isOverBudget ? 'text-destructive' : 'text-success'}`}>
            {finance.isOverBudget ? `-₹${Math.abs(finance.variance)} (OVER)` : `+₹${finance.variance} (UNDER)`}
          </strong>
        </div>
        <div>
          <span className="text-[10px] uppercase text-muted-foreground block">Verified Receipts</span>
          <strong className="font-semibold text-sm">{finance.verifiedBillsCount} / {finance.totalExpensesCount}</strong>
        </div>
      </div>

      {canManage && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setIsFormOpen(!isFormOpen)}>
            <Plus className="size-3.5 mr-1" /> {isFormOpen ? 'Cancel' : 'Add Session Expense'}
          </Button>
        </div>
      )}

      {isFormOpen && (
        <form action={recAction} className="space-y-3 p-3 rounded-lg border bg-muted/10 text-xs">
          <input type="hidden" name="school_id" value={schoolId} />
          <input type="hidden" name="session_id" value={sessionId} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Category</Label>
              <select name="category" className="mt-1 w-full rounded border px-2 py-1.5 bg-background text-xs">
                <option value="transport">Transport</option>
                <option value="materials">Materials</option>
                <option value="printing">Printing</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Amount (₹)</Label>
              <Input name="amount" type="number" min={1} required className="mt-1 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Vendor</Label>
              <Input name="vendor_name" placeholder="Driver / Printer" className="mt-1 text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Receipt URL</Label>
            <Input name="bill_url" placeholder="https://..." className="mt-1 text-xs" />
          </div>

          {recState.error && <p className="text-xs text-error">{recState.error}</p>}
          {recState.ok && <p className="text-xs text-success">{recState.message}</p>}

          <Button type="submit" size="sm" disabled={recPending}>
            {recPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <Receipt className="size-3 mr-1" />}
            Save Expense
          </Button>
        </form>
      )}

      {/* Expenses list */}
      {finance.expenses.length > 0 && (
        <div className="space-y-2 pt-1">
          {finance.expenses.map((e) => (
            <div key={e.id} className="p-2.5 rounded border bg-card flex items-center justify-between gap-2 text-xs">
              <div>
                <strong className="font-semibold">₹{e.amount}</strong> · <span className="uppercase text-[10px]">{e.category}</span>
                {e.description && <p className="text-muted-foreground text-[11px]">{e.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {e.bill_url && (
                  <a href={e.bill_url} target="_blank" rel="noreferrer" className="text-brand hover:underline flex items-center gap-1 font-medium text-[11px]">
                    <ExternalLink className="size-3" /> Receipt
                  </a>
                )}
                {canManage && e.status !== 'verified' && (
                  <form action={verAction}>
                    <input type="hidden" name="expense_id" value={e.id} />
                    <input type="hidden" name="school_id" value={schoolId} />
                    <Button type="submit" size="sm" variant="outline" disabled={verPending} className="text-[11px] h-7 border-success/30 text-success">
                      Verify
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

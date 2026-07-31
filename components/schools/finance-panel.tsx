'use client'

import { useActionState, useState } from 'react'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Loader2,
  FileCheck,
  ExternalLink,
} from 'lucide-react'
import type { SchoolFinanceSummary } from '@/lib/data/operational-expenses'
import {
  recordOperationalExpense,
  verifyOperationalExpense,
  type OperationalExpenseActionState,
} from '@/actions/operational-expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface FinancePanelProps {
  schoolId: string
  finance: SchoolFinanceSummary
  canManageFinance: boolean // true for finance_lead, super_admin, exec_lead
}

export function FinancePanel({ schoolId, finance, canManageFinance }: FinancePanelProps) {
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
    NO_PLAN: 'border-border text-muted-foreground',
    IN_PROGRESS: 'border-brand/30 bg-brand/10 text-brand',
    ATTENTION_REQUIRED: 'border-destructive/30 bg-destructive/10 text-destructive',
    CLOSED: 'border-success/30 bg-success/10 text-success',
  }[finance.status]

  return (
    <div className="space-y-6">
      {/* Finance Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border p-4 bg-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Approved Execution Budget
          </span>
          <strong className="text-xl font-bold text-foreground">₹{finance.approvedBudget}</strong>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Actual Spend
          </span>
          <strong className="text-xl font-bold text-brand">₹{finance.actualSpend}</strong>
        </div>

        <div className="rounded-xl border border-border p-4 bg-card space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Remaining Funds
          </span>
          <strong className="text-xl font-bold text-foreground">₹{finance.remaining}</strong>
        </div>

        <div className={`rounded-xl border p-4 space-y-1 ${finance.isOverBudget ? 'bg-destructive/5 border-destructive/30' : 'bg-success/5 border-success/30'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Budget Variance
            </span>
            <Badge variant="outline" className={statusStyle}>
              {finance.status.replace('_', ' ')}
            </Badge>
          </div>
          <strong className={`text-xl font-bold ${finance.isOverBudget ? 'text-destructive' : 'text-success'}`}>
            {finance.isOverBudget ? `-₹${Math.abs(finance.variance)} (OVER)` : `+₹${finance.variance} (UNDER)`}
          </strong>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <DollarSign className="size-4 text-brand" /> Category Spend Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded border p-2 bg-card">
            <span className="text-[10px] text-muted-foreground block">Transport</span>
            <strong className="font-semibold text-sm">₹{finance.categorySpends['transport'] ?? 0} / ₹{finance.budgetBreakdown.transport}</strong>
          </div>
          <div className="rounded border p-2 bg-card">
            <span className="text-[10px] text-muted-foreground block">Materials</span>
            <strong className="font-semibold text-sm">₹{finance.categorySpends['materials'] ?? 0} / ₹{finance.budgetBreakdown.materials}</strong>
          </div>
          <div className="rounded border p-2 bg-card">
            <span className="text-[10px] text-muted-foreground block">Equipment</span>
            <strong className="font-semibold text-sm">₹{finance.categorySpends['equipment'] ?? 0} / ₹{finance.budgetBreakdown.equipment}</strong>
          </div>
          <div className="rounded border p-2 bg-card">
            <span className="text-[10px] text-muted-foreground block">Other & Printing</span>
            <strong className="font-semibold text-sm">₹{finance.categorySpends['other'] ?? 0} / ₹{finance.budgetBreakdown.other}</strong>
          </div>
        </div>
      </div>

      {/* Expense Action & Logger */}
      {canManageFinance && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setIsFormOpen(!isFormOpen)}>
            <Plus className="size-4 mr-1" /> {isFormOpen ? 'Cancel' : 'Record Operational Expense'}
          </Button>
        </div>
      )}

      {isFormOpen && (
        <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Receipt className="size-4 text-brand" /> Record Operational Expense
          </h4>

          <form action={recAction} className="space-y-4">
            <input type="hidden" name="school_id" value={schoolId} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <Label htmlFor="category" className="text-xs">Category</Label>
                <select id="category" name="category" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <option value="transport">Transport</option>
                  <option value="materials">Materials</option>
                  <option value="equipment">Equipment</option>
                  <option value="printing">Printing</option>
                  <option value="food">Food / Refreshments</option>
                  <option value="logistics">Logistics</option>
                  <option value="school_visit">School Visit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-xs">Amount (₹)</Label>
                <Input id="amount" name="amount" type="number" min={1} required className="mt-1 text-sm" placeholder="e.g. 1500" />
              </div>

              <div>
                <Label htmlFor="vendor_name" className="text-xs">Vendor Name</Label>
                <Input id="vendor_name" name="vendor_name" placeholder="Driver / Printer / Shop" className="mt-1 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <Label htmlFor="description" className="text-xs">Description / Purpose</Label>
                <Input id="description" name="description" placeholder="Travel to school for Session 1" className="mt-1 text-sm" />
              </div>

              <div>
                <Label htmlFor="bill_url" className="text-xs">Bill / Receipt URL</Label>
                <Input id="bill_url" name="bill_url" placeholder="https://..." className="mt-1 text-sm" />
              </div>
            </div>

            {recState.error && <p className="text-xs text-error">{recState.error}</p>}
            {recState.ok && <p className="text-xs text-success">{recState.message}</p>}

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={recPending}>
                {recPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <Receipt className="size-4 mr-1" />}
                Save Expense
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold flex items-center justify-between">
          <span>Operational Expense Ledger ({finance.totalExpensesCount})</span>
          <span className="text-xs text-muted-foreground font-normal">
            Verified Receipts: {finance.verifiedBillsCount} / {finance.totalExpensesCount}
          </span>
        </h4>

        {finance.expenses.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
            No operational expenses recorded for this school yet.
          </p>
        ) : (
          <div className="space-y-2">
            {finance.expenses.map((e) => (
              <div key={e.id} className="p-3 rounded-lg border border-border bg-card flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-bold text-sm">₹{e.amount}</strong>
                    <Badge variant="outline" className="uppercase text-[10px]">{e.category}</Badge>
                    <Badge variant="outline" className={e.status === 'verified' ? 'border-success/30 bg-success/10 text-success' : 'border-warning/30 bg-warning/10 text-warning'}>
                      {e.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    {e.description ?? 'Expense'} {e.vendor_name ? `· Vendor: ${e.vendor_name}` : ''} ({e.expense_date})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {e.bill_url && (
                    <a href={e.bill_url} target="_blank" rel="noreferrer" className="text-brand hover:underline inline-flex items-center gap-1 font-semibold">
                      <ExternalLink className="size-3" /> View Receipt
                    </a>
                  )}

                  {canManageFinance && e.status !== 'verified' && (
                    <form action={verAction}>
                      <input type="hidden" name="expense_id" value={e.id} />
                      <input type="hidden" name="school_id" value={schoolId} />
                      <Button type="submit" size="sm" variant="outline" disabled={verPending} className="text-xs border-success/30 text-success hover:bg-success/10">
                        {verPending ? <Loader2 className="size-3 animate-spin mr-1" /> : <FileCheck className="size-3 mr-1" />}
                        Verify Receipt
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

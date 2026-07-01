'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Triggers the browser print dialog → "Save as PDF" (PRD §7.8 management PDF). */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()} variant="outline" size="sm" className="gap-1.5 print:hidden">
      <Printer className="size-4" /> Print / Save as PDF
    </Button>
  )
}

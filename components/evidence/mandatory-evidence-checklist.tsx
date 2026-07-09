import { CheckCircle2, Circle } from 'lucide-react'
import type { EvidenceListItem } from '@/lib/data/evidence'
import { MANDATORY_EVIDENCE_TYPES, MEDIA_TYPE_META } from '@/lib/constants/evidence'

/** Live checklist of the 5 categories a session's evidence must cover before it
 * can be reported (Operational Workflow Spec v2.0, Stage 7). */
export function MandatoryEvidenceChecklist({ evidence }: { evidence: EvidenceListItem[] }) {
  const present = new Set(evidence.map((e) => e.file_type))
  return (
    <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
      {MANDATORY_EVIDENCE_TYPES.map((t) => {
        const done = present.has(t)
        return (
          <li key={t} className={`flex items-center gap-1.5 ${done ? 'text-success' : 'text-muted-foreground'}`}>
            {done ? <CheckCircle2 className="size-3.5 shrink-0" /> : <Circle className="size-3.5 shrink-0" />}
            {MEDIA_TYPE_META[t].label}
          </li>
        )
      })}
    </ul>
  )
}

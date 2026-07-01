import type { AvailabilityStatus, CertificateKind } from '@/types/database'
import type { StatusTone } from '@/lib/constants/status'

export const AVAILABILITY_META: Record<AvailabilityStatus, { label: string; tone: StatusTone }> = {
  available:   { label: 'Available',   tone: 'success' },
  tentative:   { label: 'Tentative',   tone: 'pending' },
  unavailable: { label: 'Unavailable', tone: 'danger' },
}

export const CERTIFICATE_KIND_META: Record<CertificateKind, { label: string; blurb: string }> = {
  participation: { label: 'Participation', blurb: 'For showing up and contributing.' },
  milestone:     { label: 'Milestone',     blurb: 'For reaching a session/impact milestone.' },
  excellence:    { label: 'Excellence',    blurb: 'For outstanding contribution.' },
  completion:    { label: 'Completion',    blurb: 'For completing a program or term.' },
}

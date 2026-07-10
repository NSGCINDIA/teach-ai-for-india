import { notFound, redirect } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { isAdmin } from '@/lib/auth/rbac'
import { getAdminUser } from '@/lib/data/admin'
import { listMyAttendance } from '@/lib/data/attendance'
import { listMyAssignments } from '@/lib/data/assignments'
import { listMyCertificates } from '@/lib/data/certificates'
import { listReimbursements } from '@/lib/data/finance'
import { getVolunteerData } from '@/lib/data/dashboard'
import { VolunteerDetailView } from '@/components/volunteers/volunteer-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const volunteer = await getAdminUser(id)
  return { title: volunteer ? `${volunteer.full_name} · Volunteers` : 'Volunteer' }
}

export default async function VolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, volunteer] = await Promise.all([requireAccess('/dashboard/volunteers'), getAdminUser(id)])
  // Full volunteer detail (attendance/assignment/reimbursement history) is
  // admin-only; other roles with list access (campus_lead, exec_lead,
  // volunteer_lead) only get the roster, not the drill-down.
  if (!isAdmin(user.role)) redirect('/403')
  if (!volunteer) notFound()

  const [attendance, assignments, certificates, reimbursements, summary] = await Promise.all([
    listMyAttendance(volunteer.id),
    listMyAssignments(volunteer.id),
    listMyCertificates(volunteer.id),
    listReimbursements({ claimant_id: volunteer.id }),
    getVolunteerData(volunteer.id),
  ])

  return (
    <VolunteerDetailView
      volunteer={volunteer}
      attendance={attendance}
      assignments={assignments}
      certificates={certificates}
      reimbursements={reimbursements}
      summary={summary}
    />
  )
}

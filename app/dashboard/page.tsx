import { requireUser } from '@/lib/auth/user'
import { roleLabel } from '@/lib/auth/roles'
import {
  getCampusLeadData, getOutreachData, getVolunteerLeadData, getExecData, getVolunteerData,
} from '@/lib/data/dashboard'
import {
  CampusLeadOverview, OutreachOverview, VolunteerLeadOverview, ExecOverview,
  VolunteerOverview, NoCampusOverview,
} from '@/components/dashboard/overviews'

export const metadata = { title: 'Dashboard' }

/**
 * Role-adaptive dashboard home (Team Dashboard PRD). Each leadership role sees a
 * distinct overview wired to campus-scoped data; RLS enforces the boundary.
 */
export default async function DashboardOverview() {
  const user = await requireUser('/dashboard')
  const name = user.full_name.split(' ')[0]
  const campusId = user.campus_id

  // Volunteers don't need a campus for their personal view; everyone else does.
  if (user.role === 'volunteer') {
    return <VolunteerOverview name={name} data={await getVolunteerData(user.id)} />
  }

  if (!campusId) {
    return <NoCampusOverview name={name} role={roleLabel(user.role)} />
  }

  switch (user.role) {
    case 'campus_lead':
      return <CampusLeadOverview name={name} data={await getCampusLeadData(campusId)} />
    case 'outreach_lead':
      return <OutreachOverview name={name} data={await getOutreachData(campusId)} />
    case 'volunteer_lead':
      return <VolunteerLeadOverview name={name} data={await getVolunteerLeadData(campusId)} />
    case 'exec_lead':
      return <ExecOverview name={name} data={await getExecData(campusId, user.id)} />
    // Admins / viewers who land here (they normally route to /admin).
    default:
      return <CampusLeadOverview name={name} data={await getCampusLeadData(campusId)} />
  }
}

import { requireUser } from '@/lib/auth/user'
import { roleLabel } from '@/lib/auth/roles'
import { campusBudgetAccess } from '@/lib/auth/rbac'
import {
  getCampusLeadData, getOutreachData, getVolunteerLeadData, getExecData, getVolunteerData,
  getSuperAdminDashboardData, getFinanceLeadData,
} from '@/lib/data/dashboard'
import {
  CampusLeadOverview, OutreachOverview, VolunteerLeadOverview, ExecOverview,
  VolunteerOverview, NoCampusOverview, SuperAdminOverview, FinanceLeadOverview,
  CampusMgmtOverview,
} from '@/components/dashboard/overviews'

import { getVolunteerJourney } from '@/lib/data/volunteer-journey'
import { getVolunteerLeadQueue } from '@/lib/data/volunteer-lead-queue'
import { getExecLeadQueue } from '@/lib/data/exec-lead-queue'

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
    const journeyData = await getVolunteerJourney(user.id)
    return <VolunteerOverview name={name} data={await getVolunteerData(user.id)} journeyData={journeyData} />
  }

  if (user.role === 'super_admin') {
    const canReviewBudgetRequests = campusBudgetAccess(user.role, null, null).canReviewIncrease
    return (
      <SuperAdminOverview
        name={name}
        data={await getSuperAdminDashboardData()}
        canReviewBudgetRequests={canReviewBudgetRequests}
      />
    )
  }

  if (!campusId) {
    return <NoCampusOverview name={name} role={roleLabel(user.role)} />
  }

  const canReviewBudgetRequests = campusBudgetAccess(user.role, campusId, campusId).canReviewIncrease

  switch (user.role) {
    case 'campus_lead':
      return (
        <CampusLeadOverview
          name={name}
          data={await getCampusLeadData(campusId)}
          canReviewBudgetRequests={canReviewBudgetRequests}
        />
      )
    case 'outreach_lead':
      return <OutreachOverview name={name} data={await getOutreachData(campusId)} />
    case 'volunteer_lead': {
      const queueData = await getVolunteerLeadQueue(campusId)
      return <VolunteerLeadOverview name={name} data={await getVolunteerLeadData(campusId)} queueData={queueData} />
    }
    case 'exec_lead': {
      const execQueueData = await getExecLeadQueue(campusId)
      return <ExecOverview name={name} data={await getExecData(campusId)} execQueueData={execQueueData} />
    }
    case 'finance_lead':
      return <FinanceLeadOverview name={name} data={await getFinanceLeadData(campusId)} />
    case 'campus_mgmt_admin':
      return <CampusMgmtOverview name={name} data={await getCampusLeadData(campusId)} />
    // Admins / viewers who land here (they normally route to /admin).
    default:
      return (
        <CampusLeadOverview
          name={name}
          data={await getCampusLeadData(campusId)}
          canReviewBudgetRequests={canReviewBudgetRequests}
        />
      )
  }
}

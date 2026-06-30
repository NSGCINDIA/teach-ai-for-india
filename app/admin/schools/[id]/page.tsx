import { notFound } from 'next/navigation'
import { requireAccess } from '@/lib/auth/user'
import { canForEntity } from '@/lib/auth/rbac'
import { getSchool } from '@/lib/data/schools'
import { SchoolDetailView } from '@/components/schools/school-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const school = await getSchool(id)
  return { title: school ? `${school.name} · Admin` : 'School · Admin' }
}

export default async function AdminSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireAccess('/admin/schools')
  const school = await getSchool(id)
  if (!school) notFound()

  const canEdit = canForEntity(user.role, 'edit_school', user.campus_id, school.campus_id)
  return <SchoolDetailView school={school} basePath="/admin/schools" canEdit={canEdit} />
}

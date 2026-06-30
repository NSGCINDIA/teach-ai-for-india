import { redirect } from 'next/navigation'

/** Unified, role-aware login — admins use /login and are routed by role. */
export default function AdminLoginPage() {
  redirect('/login')
}

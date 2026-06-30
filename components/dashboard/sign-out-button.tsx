'use client'

import { LogOut } from 'lucide-react'
import { signOut } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export function SignOutButton({ collapsed }: { collapsed?: boolean }) {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        size={collapsed ? 'icon' : 'sm'}
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
      >
        <LogOut className="size-4" />
        {!collapsed && 'Sign out'}
      </Button>
    </form>
  )
}

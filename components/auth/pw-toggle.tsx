import { Eye, EyeOff } from 'lucide-react'

interface PwToggleProps {
  shown: boolean
  onToggle: () => void
}

export function PwToggle({ shown, onToggle }: PwToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  )
}

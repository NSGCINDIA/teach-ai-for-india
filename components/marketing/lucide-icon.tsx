import { icons, Sparkles, type LucideProps } from 'lucide-react'

/** Convert a content-block icon name ("graduation-cap", "graduationCap") to the
 *  PascalCase key lucide-react uses ("GraduationCap"). */
function toPascalCase(name: string): string {
  return name
    .replace(/[-_\s]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

/**
 * Renders a lucide icon by name (icons are configured in the CMS as strings).
 * Falls back to a neutral glyph if the name is missing or unknown.
 */
export function LucideIcon({ name, ...props }: { name?: string } & LucideProps) {
  const key = name ? toPascalCase(name) : ''
  const Icon = (icons as Record<string, React.ComponentType<LucideProps>>)[key] ?? Sparkles
  return <Icon {...props} />
}

'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

export interface TabDef {
  readonly id: string
  readonly label: string
  /** Small dot on the trigger — used to mark "this is where the work is". */
  readonly attention?: boolean
  /** Optional count/badge rendered after the label. */
  readonly hint?: string
  readonly content: React.ReactNode
}

interface TabsProps {
  readonly tabs: readonly TabDef[]
  /** Chosen on the server so the SSR markup matches the first client render. */
  readonly defaultTab: string
  /**
   * Pin the strip below the dashboard app bar (h-14) while the panel scrolls
   * under it. Worth it when panels are long — the section switcher stays a
   * thumb's reach away instead of a scroll back to the top of the page.
   */
  readonly sticky?: boolean
  readonly className?: string
}

// ── The URL hash, treated as what it is: state owned outside React ───────────
// Selecting a tab rewrites the hash with replaceState so the browser's Back
// button still leaves the page rather than walking back through seven tabs, and
// then announces the change itself — replaceState deliberately does not fire
// `hashchange`. Reading through useSyncExternalStore (rather than an effect that
// calls setState) is what lets a plain `<a href="#team">` anywhere on the page —
// in the command bar, in the lifecycle rail — open a tab.

function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const readHash = () => window.location.hash.slice(1)
/** The server has no hash, so it renders the default tab and re-renders on hydration. */
const noHash = () => ''

function goToHash(id: string) {
  window.history.replaceState(null, '', `#${id}`)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

/**
 * Underline tabs — the pattern already used by the blog editor, promoted to a
 * shared component because the School Detail workspace needs seven of them.
 *
 * Two deliberate behaviours beyond the usual:
 *
 *  - **Lazy, then kept alive.** A panel is not rendered until its tab is first
 *    opened, and after that it stays mounted and is hidden with `hidden`. Opening
 *    a school therefore instantiates one large client panel instead of all seven,
 *    while a half-filled form survives a trip to another tab and back.
 *  - **No Radix.** @radix-ui/react-tabs is not a dependency of this project and
 *    the roving-focus behaviour needed here is a dozen lines.
 */
export function Tabs({ tabs, defaultTab, sticky = false, className }: Readonly<TabsProps>) {
  const baseId = useId()
  const listRef = useRef<HTMLDivElement>(null)

  const hash = useSyncExternalStore(subscribeToHash, readHash, noHash)
  const fallback = tabs.some((t) => t.id === defaultTab) ? defaultTab : (tabs[0]?.id ?? '')
  const active = tabs.some((t) => t.id === hash) ? hash : fallback

  // Which panels have ever been opened. Adjusted during render rather than in an
  // effect, because the panel has to exist in the very render that reveals it —
  // this is React's documented "storing information from previous renders" case,
  // and the extra render pass it triggers happens before anything is painted.
  const [seen, setSeen] = useState<Set<string>>(() => new Set([active]))
  if (!seen.has(active)) setSeen(new Set(seen).add(active))

  // Keep the active trigger in view on narrow screens, where the strip scrolls.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLButtonElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    goToHash(tabs[next].id)
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label="School workspace sections"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={cn(
          'scroll-strip -mx-4 flex gap-1 border-b border-border px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
          // `glass-warm` rather than a solid fill, matching the app bar it docks
          // under: the panel stays faintly visible as it passes behind.
          sticky && 'glass-warm sticky top-14 z-10',
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              data-active={isActive}
              onClick={() => goToHash(tab.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
                'focus-visible:bg-brand/5 focus-visible:text-brand focus-visible:outline-none',
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {tab.hint && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                  {tab.hint}
                </span>
              )}
              {tab.attention && (
                <span
                  aria-label="needs attention"
                  className="size-1.5 shrink-0 rounded-full bg-brand-orange"
                />
              )}
            </button>
          )
        })}
      </div>

      {tabs.map((tab) =>
        seen.has(tab.id) ? (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={tab.id !== active}
            tabIndex={0}
            className="pt-5 focus-visible:outline-none"
          >
            {tab.content}
          </div>
        ) : null,
      )}
    </div>
  )
}

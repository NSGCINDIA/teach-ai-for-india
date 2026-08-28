'use client'

import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import type { PublicCampusCard } from '@/types/database'
import { INDIA_VIEWBOX, INDIA_MUTED_PATH, TELANGANA_PATH, ANDHRA_PRADESH_PATH } from '@/components/marketing/india-map-paths'

interface MapPoint {
  key: string
  x: number
  y: number
  slugs: string[]
  label: string
}

/**
 * Points projected from real city coordinates (same equirectangular
 * projection used to build the map paths — see india-map-paths.ts), not
 * hand-placed. The four Hyderabad-based campuses share one true location, so
 * they're grouped into a single cluster pin rather than four dots stacked on
 * top of each other.
 */
const POINTS: MapPoint[] = [
  { key: 'hyderabad', x: 213.6, y: 385.3, label: 'Hyderabad', slugs: ['niat-kkh', 'niat-cdu', 'niat-aurora', 'niat-mrv'] },
  { key: 'chevella', x: 206.6, y: 388.8, label: 'Chevella', slugs: ['niat-chevella'] },
  { key: 'guntur', x: 251.4, y: 406.2, label: 'Guntur', slugs: ['niat-ciet'] },
  { key: 'visakhapatnam', x: 305.3, y: 379.5, label: 'Visakhapatnam', slugs: ['niat-nsrit'] },
  { key: 'vijayawada', x: 255.5, y: 402.3, label: 'Vijayawada', slugs: ['niat-nri'] },
  { key: 'kadapa', x: 220.2, y: 441.8, label: 'Kadapa', slugs: ['niat-annamacharya'] },
]

/** Material-style location pin, drawn tip-down; anchored so the tip sits exactly on the projected coordinate. */
function LocationPin({ x, y, scale, className }: { x: number; y: number; scale: number; className?: string }) {
  return (
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
      transform={`translate(${x} ${y}) scale(${scale}) translate(-12 -23)`}
      className={className}
    />
  )
}

/**
 * "The Network" map — real Indian administrative boundaries (not a raster
 * silhouette), with Telangana and Andhra Pradesh drawn and colored as two
 * separate current-day states (not merged) since every campus sits in one or
 * the other. Locations use proper map-pin markers, grouped into clusters
 * where multiple campuses share a city, instead of raw overlapping dots.
 */
export function CampusMap({
  campuses,
  activeSlug,
  onSelect,
}: {
  campuses: PublicCampusCard[]
  activeSlug?: string
  onSelect: (slug: string) => void
}) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [openCluster, setOpenCluster] = useState<string | null>(null)
  const bySlug = new Map(campuses.map((c) => [c.slug, c]))
  const points = POINTS.filter((p) => p.slugs.some((s) => bySlug.has(s)))

  const activePoint = points.find((p) => p.slugs.includes(activeSlug ?? ''))
  const hoveredPointObj = points.find((p) => p.key === hoveredPoint)
  const shownPoint = hoveredPointObj ?? activePoint

  // Hovering a single-campus pin previews that campus; otherwise fall back to
  // whichever campus is already selected (even if it belongs to a cluster).
  const previewSlug =
    hoveredPointObj && hoveredPointObj.slugs.length === 1 && hoveredPointObj.key !== activePoint?.key
      ? hoveredPointObj.slugs[0]
      : activeSlug
  const previewCampus = previewSlug ? bySlug.get(previewSlug) : undefined

  if (points.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-[var(--tai-paper)] p-6">
      <div className="flex items-center justify-between">
        <p className="tai-eyebrow text-muted-foreground">Active campus network</p>
        <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--tai-crimson)]/35" /> Telangana
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[var(--tai-terracotta)]/45" /> Andhra Pradesh
          </span>
        </div>
      </div>

      <div className="relative mt-3 aspect-[4/3] w-full">
        <svg className="h-full w-full overflow-visible" viewBox={INDIA_VIEWBOX} xmlns="http://www.w3.org/2000/svg">
          <path d={INDIA_MUTED_PATH} className="fill-none stroke-[var(--tai-charcoal)]/20" strokeWidth={1} strokeLinejoin="round" />
          <path d={TELANGANA_PATH} className="fill-[var(--tai-crimson)]/12 stroke-[var(--tai-crimson)]/45" strokeWidth={1.1} strokeLinejoin="round" />
          <path
            d={ANDHRA_PRADESH_PATH}
            className="fill-[var(--tai-terracotta)]/14 stroke-[var(--tai-terracotta)]/55"
            strokeWidth={1.1}
            strokeLinejoin="round"
          />

          {points.map((p) => {
            const isCluster = p.slugs.length > 1
            const isShown = shownPoint?.key === p.key
            const isActive = !!activePoint && activePoint.key === p.key
            return (
              <g
                key={p.key}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p.key)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => {
                  if (isCluster) setOpenCluster((v) => (v === p.key ? null : p.key))
                  else onSelect(p.slugs[0])
                }}
              >
                <circle cx={p.x} cy={p.y - 11} r={17} fill="transparent" />
                {isShown && (
                  <circle cx={p.x} cy={p.y} r={9} className="fill-[var(--tai-crimson)]/20" />
                )}
                <LocationPin
                  x={p.x}
                  y={p.y}
                  scale={isShown ? 1.15 : 0.95}
                  className={`transition-all drop-shadow-[0_1px_1px_rgba(28,25,23,0.25)] ${
                    isActive || isShown ? 'fill-[var(--tai-crimson)]' : 'fill-[var(--tai-charcoal)]/70'
                  }`}
                />
                {isCluster && (
                  <>
                    <circle cx={p.x + 7} cy={p.y - 20} r={6.5} className="fill-[var(--tai-paper)] stroke-[var(--tai-crimson)]" strokeWidth={1} />
                    <text x={p.x + 7} y={p.y - 17.5} textAnchor="middle" className="fill-[var(--tai-crimson)] font-sans text-[8px] font-bold">
                      {p.slugs.length}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {/* Cluster popover — a small list of the campuses sharing one pin */}
        <AnimatePresence>
          {openCluster &&
            (() => {
              const point = points.find((p) => p.key === openCluster)
              if (!point) return null
              return (
                <m.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  style={{ left: `${(point.x / 600) * 100}%`, top: `${(point.y / 600) * 100}%` }}
                  className="absolute z-10 w-52 -translate-x-1/2 translate-y-3 rounded-lg border border-border bg-background shadow-lg"
                >
                  <p className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {point.label} · {point.slugs.length} campuses
                  </p>
                  <ul>
                    {point.slugs.filter((s) => bySlug.has(s)).map((s) => (
                      <li key={s}>
                        <button
                          onClick={() => {
                            onSelect(s)
                            setOpenCluster(null)
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                        >
                          {bySlug.get(s)!.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </m.div>
              )
            })()}
        </AnimatePresence>

        {/* Single-campus hover/active detail bar */}
        <AnimatePresence>
          {!openCluster && previewCampus && (
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 rounded-lg border border-border bg-background/95 px-4 py-3 text-sm backdrop-blur-sm"
            >
              <span className="font-semibold text-foreground">{previewCampus.name}</span>
              <span className="text-muted-foreground"> — {previewCampus.city}, {previewCampus.state}</span>
              <span className="ml-2 text-muted-foreground">
                {previewCampus.schools_reached} schools · {previewCampus.students_impacted.toLocaleString('en-IN')} students
              </span>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

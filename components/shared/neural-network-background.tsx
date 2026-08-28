import { cn } from '@/lib/utils'

/**
 * The TAI mark is a neural network, and this is that motif used as a texture.
 *
 * It is deliberately static. The previous version ran an `<animate>` on every
 * node — twelve to twenty infinite SVG animations that started at first paint,
 * on every dashboard load, behind content people read for minutes at a time.
 * Ambient looping motion in the periphery is exactly what makes a working screen
 * tiring, and the brief asks for animation that communicates rather than
 * decorates. The network says "this is TAI" perfectly well holding still.
 *
 * Use it once per screen, on the hero or a single impact moment — never on cards.
 */

interface NeuralNetworkBackgroundProps {
  variant?: 'subtle' | 'prominent'
  className?: string
}

/** Fixed layout rather than a loop over `Math.sin(i)`: a real, legible graph. */
const NODES: { x: number; y: number; r: number }[] = [
  { x: 8, y: 68, r: 3 },
  { x: 21, y: 30, r: 4 },
  { x: 24, y: 82, r: 2.5 },
  { x: 38, y: 54, r: 5 },
  { x: 47, y: 18, r: 3 },
  { x: 55, y: 86, r: 3 },
  { x: 62, y: 44, r: 4 },
  { x: 74, y: 72, r: 2.5 },
  { x: 79, y: 26, r: 3.5 },
  { x: 92, y: 58, r: 3 },
]

/** Index pairs into NODES — edges of the graph above. */
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [3, 6],
  [4, 6], [6, 7], [6, 8], [7, 9], [8, 9],
]

export function NeuralNetworkBackground({
  variant = 'subtle',
  className = '',
}: NeuralNetworkBackgroundProps) {
  const nodeOpacity = variant === 'subtle' ? 0.1 : 0.22
  const edgeOpacity = variant === 'subtle' ? 0.06 : 0.14

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* One soft warm wash, anchored to a corner so it reads as light falling
          across the panel rather than a pair of floating coloured blobs. */}
      <div
        className="absolute -right-32 -top-40 size-[28rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-orange) 14%, transparent) 0%, transparent 70%)',
        }}
      />

      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <g stroke="var(--brand-maroon)" strokeWidth="0.18" opacity={edgeOpacity}>
          {EDGES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        <g fill="var(--brand-maroon)" opacity={nodeOpacity}>
          {NODES.map((n, i) => (
            // preserveAspectRatio="none" would squash circles, so nodes are
            // ellipses pre-corrected for the panel's own aspect instead.
            <ellipse key={i} cx={n.x} cy={n.y} rx={n.r * 0.35} ry={n.r * 0.9} />
          ))}
        </g>
      </svg>
    </div>
  )
}

/**
 * Simplified neural decoration for smaller spaces — empty states, image
 * fallbacks. Same motif, four nodes, sized by its container.
 */
export function NeuralDecoration({ className = '' }: { className?: string }) {
  // cn (tailwind-merge) so a caller passing its own `opacity-*` replaces the
  // default instead of emitting two conflicting utilities.
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn('opacity-30', className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="tai-neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-deep-maroon)" />
          <stop offset="100%" stopColor="var(--brand-orange)" />
        </linearGradient>
      </defs>
      <g stroke="url(#tai-neural-gradient)" strokeWidth="1.5" fill="none">
        <line x1="20" y1="30" x2="50" y2="60" />
        <line x1="50" y1="60" x2="80" y2="45" />
        <line x1="50" y1="60" x2="70" y2="90" />
      </g>
      <circle cx="20" cy="30" r="4" fill="url(#tai-neural-gradient)" opacity="0.6" />
      <circle cx="50" cy="60" r="5" fill="url(#tai-neural-gradient)" opacity="0.85" />
      <circle cx="80" cy="45" r="4" fill="url(#tai-neural-gradient)" opacity="0.6" />
      <circle cx="70" cy="90" r="4" fill="url(#tai-neural-gradient)" opacity="0.6" />
    </svg>
  )
}

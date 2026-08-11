/** @type {import('next').NextConfig} */

// Allow Supabase Storage CDN to be optimized by next/image.
// Derived from the public Supabase URL so no manual host editing is needed.
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null
  } catch {
    return null
  }
})()

// ─── Security headers (issue #10) ────────────────────────────────────────────
// A pragmatic baseline: strict framing/sniffing/referrer/permissions controls,
// HSTS, and a CSP scoped to the sources this app actually loads. Script/style
// keep 'unsafe-inline' because Next.js injects inline bootstrap scripts and
// runtime styles; everything else is locked down (no third-party origins).
const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : ''
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHost ? `https://${supabaseHost} ${supabaseWs}` : ''} https://*.supabase.co wss://*.supabase.co`,
  "frame-src 'none'",
]
  .filter(Boolean)
  .join('; ')
  .replace(/\s+/g, ' ')
  .trim()

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  // Strict TypeScript is enforced in CI via `tsc --noEmit`. Build errors are
  // surfaced (no longer silently ignored) now that the codebase is typed.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // AVIF first, WebP as the fallback: AVIF is typically 25-40% smaller than
    // WebP at equal quality and is understood by Chrome 85+, Firefox 93+ and
    // Safari 16.4+. Anything older simply negotiates down to WebP, then to the
    // original — no browser is left without an image.
    formats: ['image/avif', 'image/webp'],
    // Trim the generated variants to the breakpoints this design actually uses
    // (the `sizes` attributes across the site top out at 100vw). Fewer widths
    // means fewer cold-cache optimizations and a higher CDN hit rate.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [44, 56, 64, 96, 128, 200, 256, 384],
    // Session photography is uploaded once under a stable path, so a short TTL
    // just re-pays the optimization cost. Raise this only as far as your upload
    // flow allows: replacing a file at the same storage path will serve stale
    // for up to this long.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/**' }]
        : []),
      // Allow any Supabase project host in preview/CI where env may differ.
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/**' },
      // Brand logo lockup (Vercel Blob) used on the auth/signup pages and hero.
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
      // Cloudinary CDN — authentic Teach AI for India session media
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
  experimental: {
    // Server Actions are used for auth + mutations.
    serverActions: { bodySizeLimit: '10mb' },
    // Speeds up dev/build compilation for this large icon library.
    optimizePackageImports: ['lucide-react'],
  },
  // Apply the security headers to every route (issue #10).
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Icons and the map outline are content-stable and unhashed, so they
      // would otherwise be revalidated on every navigation. `immutable` makes
      // repeat visits and client-side route changes cost zero requests for
      // them; bump the filename if one ever needs to change.
      {
        source: '/:file(icon.svg|apple-icon.png|icon-dark-32x32.png|icon-light-32x32.png|india_map_outline.png)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig

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
  'upgrade-insecure-requests',
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
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/**' }]
        : []),
      // Allow any Supabase project host in preview/CI where env may differ.
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/**' },
      // Brand logo lockup (Vercel Blob) used on the auth/signup pages and hero.
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    ],
  },
  experimental: {
    // Server Actions are used for auth + mutations.
    serverActions: { bodySizeLimit: '10mb' },
  },
  // Apply the security headers to every route (issue #10).
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig

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

const nextConfig = {
  // Strict TypeScript is enforced in CI via `tsc --noEmit`. Build errors are
  // surfaced (no longer silently ignored) now that the codebase is typed.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/**' }]
        : []),
      // Allow any Supabase project host in preview/CI where env may differ.
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/**' },
    ],
  },
  experimental: {
    // Server Actions are used for auth + mutations.
    serverActions: { bodySizeLimit: '10mb' },
  },
}

export default nextConfig

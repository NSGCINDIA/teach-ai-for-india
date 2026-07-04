/**
 * Server startup hook (Next.js runs this once when the Node server boots).
 *
 * Prefer IPv4 when resolving hostnames. Node's global `fetch` (undici) otherwise
 * tries IPv6 addresses first; on networks without working IPv6 that connection
 * silently stalls until the 10s connect timeout fires, surfacing as
 * `UND_ERR_CONNECT_TIMEOUT` on every Supabase call and making pages/sign-in hang.
 * Preferring IPv4 uses the route that actually works and removes the stall.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('node:dns')
    dns.setDefaultResultOrder('ipv4first')
  }
}

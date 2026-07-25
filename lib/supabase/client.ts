'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../types/database'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'

let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null
let refreshPromise: Promise<any> | null = null

/**
 * Creates a custom fetch wrapper that intercepts 401 Unauthorized errors to automatically
 * refresh the session and retry the request once. Deduplicates concurrent refreshes and
 * handles invalid session redirect to the login page.
 */
export function createCustomFetch(
  getClient: () => ReturnType<typeof createBrowserClient<Database>> | null,
  onSessionExpired?: () => void,
): typeof fetch {
  return async (input, init) => {
    const response = await fetch(input, init)

    // Intercept 401 Unauthorized errors for token-bearing API requests
    if (response.status === 401) {
      const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url)
      const isTokenRequest = urlStr.includes('/auth/v1/token')

      // Check if retry is suppressed to prevent infinite loops
      const hasRetryHeader = init?.headers && (
        init.headers instanceof Headers 
          ? init.headers.has('x-suppress-retry') 
          : (Array.isArray(init.headers) 
              ? init.headers.some(([k]) => k.toLowerCase() === 'x-suppress-retry')
              : Object.prototype.hasOwnProperty.call(init.headers, 'x-suppress-retry')
            )
      )

      const client = getClient()
      if (!isTokenRequest && !hasRetryHeader && client) {
        // Deduplicate concurrent session refresh calls
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const { data, error } = await client.auth.refreshSession()
            if (error || !data.session) {
              throw new Error('session_refresh_failed')
            }
            return data.session
          })().finally(() => {
            refreshPromise = null
          })
        }

        try {
          const session = await refreshPromise

          // Clone original options and inject the new access token and suppression header
          const newInit = { ...init }
          const newHeaders = new Headers(init?.headers)
          newHeaders.set('Authorization', `Bearer ${session.access_token}`)
          newHeaders.set('x-suppress-retry', 'true')
          newInit.headers = newHeaders

          return await fetch(input, newInit)
        } catch (e) {
          // Sign out and clear local session state
          await client.auth.signOut()
          if (onSessionExpired) {
            onSessionExpired()
          } else if (typeof window !== 'undefined') {
            window.location.href = '/login?error=session_expired'
          }
          return response
        }
      }
    }

    return response
  }
}

/** Browser Supabase client. Uses the publishable/anon key — RLS-protected. */
export function createClient() {
  if (clientInstance) return clientInstance

  clientInstance = createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      fetch: createCustomFetch(() => clientInstance),
    },
  })

  return clientInstance
}



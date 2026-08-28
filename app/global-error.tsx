'use client'

import { useEffect } from 'react'

/**
 * Last-resort boundary: catches errors thrown by the root layout itself, which
 * `app/error.tsx` cannot reach because it renders *inside* that layout.
 *
 * Next.js replaces the whole document here, so the root layout's `globals.css`
 * import is not applied and no font variable or design token is available. Every
 * style below is therefore inline and self-contained — a stylesheet reference at
 * this point could itself be the thing that failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global-error]', { digest: error.digest, message: error.message, stack: error.stack })
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.25rem',
          background: '#FDFBF7',
          color: '#1A1A1A',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          lineHeight: 1.6,
        }}
      >
        <main style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8A8175',
            }}
          >
            Teach AI for India
          </p>
          <h1 style={{ margin: '0.75rem 0 0', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Something went badly wrong
          </h1>
          <p style={{ margin: '0.75rem 0 0', color: '#5C554C' }}>
            The application failed to start. Reloading usually clears it. If it keeps happening,
            send us the reference below.
          </p>

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.75rem',
              padding: '0.625rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: '#FFFFFF',
              background: '#C2410C',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>

          {error.digest && (
            <p style={{ margin: '1.25rem 0 0', fontSize: '0.75rem', color: '#8A8175' }}>
              Reference:{' '}
              <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                {error.digest}
              </code>
            </p>
          )}
        </main>
      </body>
    </html>
  )
}

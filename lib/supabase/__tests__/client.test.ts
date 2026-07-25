import { test } from 'node:test'
import assert from 'node:assert'
import { createCustomFetch } from '../client'

// Mock Response Helper
function mockResponse(status: number, body: string = '{}', headers: Record<string, string> = {}): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers(headers),
    json: async () => JSON.parse(body),
    text: async () => body,
  } as Response
}

test('createCustomFetch - normal successful request passes through', async () => {
  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    return mockResponse(200, '{"ok": true}')
  }
  
  // Set global fetch mock
  const originalFetch = global.fetch
  global.fetch = mockFetch
  
  try {
    const customFetch = createCustomFetch(() => null as any)
    const res = await customFetch('https://api.example.com/data')
    assert.strictEqual(res.status, 200)
    const json = await res.json()
    assert.deepStrictEqual(json, { ok: true })
  } finally {
    global.fetch = originalFetch
  }
})

test('createCustomFetch - 401 intercepts, refreshes session, and retries successfully', async () => {
  let fetchCount = 0
  let capturedInit: any = undefined

  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    fetchCount++
    if (fetchCount === 1) {
      return mockResponse(401, '{"error": "Unauthorized"}')
    }
    capturedInit = init
    return mockResponse(200, '{"data": "success"}')
  }

  let refreshCount = 0
  const mockClient = {
    auth: {
      refreshSession: async () => {
        refreshCount++
        return {
          data: {
            session: { access_token: 'new-token' }
          },
          error: null
        }
      },
      signOut: async () => {}
    }
  }

  const originalFetch = global.fetch
  global.fetch = mockFetch

  try {
    const customFetch = createCustomFetch(() => mockClient as any)
    const res = await customFetch('https://api.example.com/data', {
      headers: { Authorization: 'Bearer old-token' }
    })
    
    assert.strictEqual(fetchCount, 2)
    assert.strictEqual(refreshCount, 1)
    assert.strictEqual(res.status, 200)
    
    const json = await res.json()
    assert.deepStrictEqual(json, { data: 'success' })
    
    // Assert headers of the retried request
    assert.ok(capturedInit)
    const headers = new Headers(capturedInit.headers)
    assert.strictEqual(headers.get('Authorization'), 'Bearer new-token')
    assert.strictEqual(headers.get('x-suppress-retry'), 'true')
  } finally {
    global.fetch = originalFetch
  }
})

test('createCustomFetch - 401 intercepts, failed refresh logs out and redirects', async () => {
  let fetchCount = 0
  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    fetchCount++
    return mockResponse(401, '{"error": "Unauthorized"}')
  }

  let refreshCount = 0
  let signOutCount = 0
  const mockClient = {
    auth: {
      refreshSession: async () => {
        refreshCount++
        return { data: { session: null }, error: new Error('Failed refresh') }
      },
      signOut: async () => {
        signOutCount++
      }
    }
  }

  let redirectCount = 0
  const onSessionExpired = () => {
    redirectCount++
  }

  const originalFetch = global.fetch
  global.fetch = mockFetch

  try {
    const customFetch = createCustomFetch(() => mockClient as any, onSessionExpired)
    const res = await customFetch('https://api.example.com/data')
    
    assert.strictEqual(fetchCount, 1) // Should not retry on failed refresh
    assert.strictEqual(refreshCount, 1)
    assert.strictEqual(signOutCount, 1)
    assert.strictEqual(redirectCount, 1)
    assert.strictEqual(res.status, 401)
  } finally {
    global.fetch = originalFetch
  }
})

test('createCustomFetch - prevents infinite retry loop if retried request returns 401', async () => {
  let fetchCount = 0
  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    fetchCount++
    return mockResponse(401, '{"error": "Unauthorized"}')
  }

  let refreshCount = 0
  const mockClient = {
    auth: {
      refreshSession: async () => {
        refreshCount++
        return {
          data: { session: { access_token: 'new-token' } },
          error: null
        }
      },
      signOut: async () => {}
    }
  }

  const originalFetch = global.fetch
  global.fetch = mockFetch

  try {
    const customFetch = createCustomFetch(() => mockClient as any)
    const res = await customFetch('https://api.example.com/data')
    
    // Original attempt (1st) returns 401 -> triggers refresh -> retries (2nd) -> returns 401.
    // The 2nd request has x-suppress-retry header so it should NOT trigger a 3rd attempt.
    assert.strictEqual(fetchCount, 2)
    assert.strictEqual(refreshCount, 1)
    assert.strictEqual(res.status, 401)
  } finally {
    global.fetch = originalFetch
  }
})

test('createCustomFetch - concurrent 401s deduplicate session refresh', async () => {
  let fetchCount = 0
  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    fetchCount++
    return mockResponse(401, '{"error": "Unauthorized"}')
  }

  let refreshCount = 0
  let resolveRefresh: any
  const refreshPromise = new Promise((resolve) => {
    resolveRefresh = resolve
  })

  const mockClient = {
    auth: {
      refreshSession: async () => {
        refreshCount++
        // Simulate delayed network refresh
        await refreshPromise
        return {
          data: { session: { access_token: 'shared-token' } },
          error: null
        }
      },
      signOut: async () => {}
    }
  }

  const originalFetch = global.fetch
  global.fetch = mockFetch

  try {
    const customFetch = createCustomFetch(() => mockClient as any)
    
    // Fire two concurrent requests
    const p1 = customFetch('https://api.example.com/data1')
    const p2 = customFetch('https://api.example.com/data2')
    
    // Let the mock auth refresh complete
    resolveRefresh({ access_token: 'shared-token' })
    
    const [res1, res2] = await Promise.all([p1, p2])
    
    // Both requests initially fail (2 fetches), refresh triggers once, both retry (2 more fetches).
    // Total fetches = 4.
    assert.strictEqual(fetchCount, 4)
    assert.strictEqual(refreshCount, 1) // Deduplicated!
    assert.strictEqual(res1.status, 401) // In this mock they both return 401 on retry, which is fine
    assert.strictEqual(res2.status, 401)
  } finally {
    global.fetch = originalFetch
  }
})

import { test } from 'node:test'
import assert from 'node:assert'
import { safeNextPath } from '@/lib/security/safe-next-path'

/**
 * `safeNextPath` is the only thing standing between the `?next=` parameter and
 * an open redirect, and it now guards two entry points (the login action and
 * the auth callback route) rather than one. Pure input/output, so the whole
 * attack surface is cheap to pin down.
 */

test('accepts ordinary same-origin paths', () => {
  for (const p of ['/dashboard', '/dashboard/schools', '/admin/volunteers', '/a/b/c?q=1#frag']) {
    assert.strictEqual(safeNextPath(p), p, p)
  }
})

test('rejects absolute URLs', () => {
  for (const p of [
    'https://evil.com',
    'http://evil.com/path',
    'HTTPS://evil.com',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
  ]) {
    assert.strictEqual(safeNextPath(p), null, p)
  }
})

test('rejects protocol-relative and backslash variants', () => {
  for (const p of ['//evil.com', '//evil.com/path', '/\\evil.com', '/%2fevil.com', '/%5cevil.com']) {
    assert.strictEqual(safeNextPath(p), null, p)
  }
})

test('rejects empty, null and undefined', () => {
  assert.strictEqual(safeNextPath(''), null)
  assert.strictEqual(safeNextPath(null), null)
  assert.strictEqual(safeNextPath(undefined), null)
})

test('rejects a bare path with no leading slash', () => {
  // Relative paths resolve against the current directory, which would let
  // `next=evil` land somewhere unintended when concatenated onto an origin.
  assert.strictEqual(safeNextPath('dashboard'), null)
  assert.strictEqual(safeNextPath('evil.com'), null)
})

#!/usr/bin/env node
/**
 * Regenerate the auto-derived blocks of AGENTS.md from the source of truth.
 *
 * WHY THIS EXISTS
 * AGENTS.md is the cold-start briefing for whichever AI tool works on this repo.
 * The parts that go stale fastest are the mechanical facts — role lists, status
 * enums, lifecycle steps, file counts — and those are all derivable. So they are
 * derived, not hand-maintained, and this script rewrites them in place.
 *
 * It is plain node with no dependencies and is driven by a git pre-commit hook,
 * so it runs no matter which editor or model made the change. Nothing about it
 * is tied to Claude Code.
 *
 * Everything OUTSIDE the AUTO markers is hand-written judgement — conventions,
 * gotchas, the approval-chain narrative — and is never touched here. A machine
 * cannot infer "PostgREST returns numerics as strings"; a human or a model has
 * to write that down.
 *
 * Usage:
 *   node scripts/sync-agents-md.mjs           # rewrite AGENTS.md in place
 *   node scripts/sync-agents-md.mjs --check   # exit 1 if it would change (CI)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const AGENTS = join(ROOT, 'AGENTS.md')
const CHECK = process.argv.includes('--check')

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '')

/** Values of a multi-line `export type X = | 'a' | 'b'` union. */
function unionValues(src, typeName) {
  const start = src.indexOf(`export type ${typeName} =`)
  if (start === -1) return []
  const lines = src.slice(start).split('\n')
  const buf = [lines[0]]
  for (let i = 1; i < lines.length && /^\s*\|/.test(lines[i]); i++) buf.push(lines[i])
  return [...buf.join('\n').matchAll(/'([^']+)'/g)].map((m) => m[1])
}

/** `key: 'value'` pairs inside `export const NAME ... { ... }`. */
function recordEntries(src, name) {
  const start = src.indexOf(`export const ${name}`)
  if (start === -1) return {}
  const open = src.indexOf('{', start)
  let depth = 0
  let end = open
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) { end = i; break }
  }
  const body = src.slice(open, end)
  const out = {}
  for (const m of body.matchAll(/(\w+)\s*:\s*'((?:[^'\\]|\\.)*)'/g)) out[m[1]] = m[2].replace(/\\'/g, "'")
  return out
}

/**
 * Values of `export const NAME ... = [ 'a', 'b' ]`.
 *
 * Seeks the `[` *after* the `=`, not the first `[` in the statement — these are
 * declared as `export const SCHOOL_PIPELINE: SchoolStatus[] = [...]`, and the
 * annotation's own brackets would otherwise be mistaken for the array literal
 * and yield an empty list.
 */
function arrayValues(src, name) {
  const start = src.indexOf(`export const ${name}`)
  if (start === -1) return []
  const eq = src.indexOf('=', start)
  if (eq === -1) return []
  const open = src.indexOf('[', eq)
  const close = src.indexOf(']', open)
  if (open === -1 || close === -1) return []
  return [...src.slice(open, close).matchAll(/'([^']+)'/g)].map((m) => m[1])
}

const countFiles = (dir, ext) => {
  const p = join(ROOT, dir)
  if (!existsSync(p)) return 0
  return readdirSync(p).filter((f) => (ext ? f.endsWith(ext) : true)).length
}

// ─── Sources ─────────────────────────────────────────────────────────────────
const db = read('types/database.ts')
const rolesTs = read('lib/auth/roles.ts')
const statusTs = read('lib/constants/status.ts')

const roles = unionValues(db, 'UserRole')
const labels = recordEntries(rolesTs, 'ROLE_LABELS')
const descriptions = recordEntries(rolesTs, 'ROLE_DESCRIPTIONS')
const selfSignup = arrayValues(rolesTs, 'SELF_SIGNUP_ROLES')
const invitable = arrayValues(rolesTs, 'INVITABLE_ROLES')
const pipeline = arrayValues(statusTs, 'SCHOOL_PIPELINE')
const schoolStatuses = unionValues(db, 'SchoolStatus')
const sessionStatuses = unionValues(db, 'SessionStatus')
const execStatuses = unionValues(db, 'ExecutionPlanStatus')
const phases = unionValues(db, 'OperationalPhase')

const migrations = readdirSync(join(ROOT, 'supabase/migrations')).filter((f) => f.endsWith('.sql')).sort()

// ─── Blocks ──────────────────────────────────────────────────────────────────
const code = (v) => '`' + v + '`'

const BLOCKS = {
  roles() {
    const rows = roles.map((r) => `| ${code(r)} | ${labels[r] ?? '—'} | ${descriptions[r] ?? '—'} |`)
    const invOnly = invitable.filter((r) => !selfSignup.includes(r))
    return [
      `${roles.length} roles, defined in \`types/database.ts\` and labelled in \`lib/auth/roles.ts\`:`,
      '',
      '| Role | Label | Scope |',
      '|---|---|---|',
      ...rows,
      '',
      `**Self-requestable on \`/signup\`** (\`SELF_SIGNUP_ROLES\`): ${selfSignup.map(code).join(', ') || '—'}.`,
      `**Invite-only**: ${invOnly.map(code).join(', ') || '—'}.`,
    ].join('\n')
  },

  'school-lifecycle'() {
    const extra = schoolStatuses.filter((s) => !pipeline.includes(s))
    return [
      '```',
      pipeline.join(' → '),
      '```',
      '',
      extra.length ? `Plus ${extra.map(code).join(', ')} (outside the forward pipeline).` : '',
    ].filter(Boolean).join('\n')
  },

  'status-enums'() {
    return [
      `- **\`SessionStatus\`**: ${sessionStatuses.map(code).join(', ')}`,
      `- **\`ExecutionPlanStatus\`**: ${execStatuses.map(code).join(', ')}`,
      `- **\`OperationalPhase\`**: ${phases.length} values — ${phases.slice(0, 4).map(code).join(', ')}, then the per-session cycle (${code('session_N_planning')} … ${code('session_N_verified')}) for N = 1–4.`,
    ].join('\n')
  },

  'repo-stats'() {
    return [
      `- Server actions: **${countFiles('actions', '.ts')}** files in \`actions/\``,
      `- Data readers: **${countFiles('lib/data', '.ts')}** files in \`lib/data/\``,
      `- Validation schemas: **${countFiles('lib/validations', '.ts')}** files in \`lib/validations/\``,
      `- SQL migrations: **${migrations.length}**, latest \`${migrations[migrations.length - 1] ?? '—'}\``,
    ].join('\n')
  },
}

// ─── Rewrite ─────────────────────────────────────────────────────────────────
let md = readFileSync(AGENTS, 'utf8')
const original = md
const missing = []

for (const [name, build] of Object.entries(BLOCKS)) {
  const open = `<!-- AUTO:${name} -->`
  const close = `<!-- /AUTO:${name} -->`
  const re = new RegExp(`${open}[\\s\\S]*?${close}`)
  if (!re.test(md)) { missing.push(name); continue }
  md = md.replace(re, `${open}\n<!-- Generated by scripts/sync-agents-md.mjs — do not edit by hand. -->\n\n${build()}\n\n${close}`)
}

if (missing.length) {
  console.error(`sync-agents-md: missing AUTO markers in AGENTS.md: ${missing.join(', ')}`)
  process.exit(2)
}

if (md === original) {
  if (!CHECK) console.log('sync-agents-md: AGENTS.md already up to date')
  process.exit(0)
}

if (CHECK) {
  console.error('sync-agents-md: AGENTS.md is STALE. Run: node scripts/sync-agents-md.mjs')
  process.exit(1)
}

writeFileSync(AGENTS, md)
console.log('sync-agents-md: AGENTS.md updated')

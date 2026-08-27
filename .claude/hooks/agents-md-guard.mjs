/**
 * PostToolUse hook: keep AGENTS.md honest.
 *
 * AGENTS.md is the cold-start briefing for AI agents on this repo. It goes stale
 * silently — nothing fails when it drifts, the next agent just gets misled. This
 * hook watches the files whose contents AGENTS.md actually describes and, when
 * one is edited, injects a reminder naming the section to re-check.
 *
 * Deliberately narrow: it fires on structural files only, not on every edit.
 * A reminder that appears constantly gets ignored, which is the failure mode
 * this is trying to prevent.
 *
 * Reads the PostToolUse payload on stdin; prints hook JSON on stdout, or
 * nothing at all when the edit isn't structural. Never blocks.
 */

const RULES = [
  {
    re: /lib\/auth\/(roles|rbac)\.ts$/,
    section: '"Roles"',
    why: 'a role, its scope, or route/capability gating may have changed',
  },
  {
    re: /types\/database\.ts$/,
    section: '"Roles" and "Domain model"',
    why: 'this file is the TS source of truth for every domain enum',
  },
  {
    re: /lib\/constants\/status\.ts$/,
    section: '"School lifecycle"',
    why: 'the pipeline or its legal transitions may have changed',
  },
  {
    re: /lib\/constants\/operational-phases\.ts$/,
    section: '"Operational phases"',
    why: 'the 7-step sub-workflow may have changed',
  },
  {
    re: /supabase\/migrations\/.*\.sql$/,
    section: '"Domain model" (esp. "The approval chain") and "Conventions → Migrations"',
    why: 'a migration can change an enum, an invariant, or an approval leg',
  },
  {
    re: /hooks\/[^/]+\.ts$/,
    section: '"Conventions → Forms"',
    why: 'a shared client hook is a convention other code is expected to follow',
  },
  {
    re: /lib\/validations\/[^/]+\.ts$/,
    section: '"Conventions → Server actions"',
    why: 'validation shape is part of the action contract',
  },
]

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let filePath = ''
  try {
    const payload = JSON.parse(raw)
    filePath = payload?.tool_response?.filePath || payload?.tool_input?.file_path || ''
  } catch {
    process.exit(0) // malformed payload is not this hook's problem
  }
  if (!filePath) process.exit(0)

  const p = String(filePath).replace(/\\/g, '/')

  // Editing AGENTS.md itself is the thing we're asking for — never nag about it.
  if (/AGENTS\.md$/i.test(p)) process.exit(0)

  const hit = RULES.find((r) => r.re.test(p))
  if (!hit) process.exit(0)

  const rel = p.split('/').slice(-3).join('/')
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          `[AGENTS.md check] You edited ${rel}, which AGENTS.md documents — ${hit.why}. ` +
          `Re-read the ${hit.section} section of AGENTS.md and update it IN THIS COMMIT if it is now ` +
          `inaccurate or incomplete. If it still reads correctly, change nothing and say nothing about it.`,
      },
      suppressOutput: true,
    }),
  )
})

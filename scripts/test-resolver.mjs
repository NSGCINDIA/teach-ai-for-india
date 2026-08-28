import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')

// Extensions tried when a specifier resolves to nothing, in the order Next.js
// and tsc try them.
const CANDIDATES = ['.ts', '.tsx', '/index.ts', '/index.tsx']

/**
 * Module resolution hook for `node --test`.
 *
 * Node 24 strips TypeScript types natively, so the project needs no transpiler
 * to run its tests — but Node resolves ESM specifiers literally. Source files
 * here use two things it will not resolve on its own:
 *
 *   1. the `@/` path alias from tsconfig.json, which Node does not read, and
 *   2. extensionless relative imports, which are ESM-illegal but standard in a
 *      bundled Next.js codebase.
 *
 * Teaching the resolver about both is ~30 lines and keeps the test setup on the
 * existing stack, rather than pulling in a bundler-backed test framework purely
 * to resolve paths.
 */
export async function resolve(specifier, context, nextResolve) {
  const mapped = specifier.startsWith('@/')
    ? pathToFileURL(path.join(ROOT, specifier.slice(2))).href
    : specifier

  try {
    return await nextResolve(mapped, context)
  } catch (error) {
    if (error?.code !== 'ERR_MODULE_NOT_FOUND' && error?.code !== 'ERR_UNSUPPORTED_DIR_IMPORT') {
      throw error
    }
    for (const ext of CANDIDATES) {
      try {
        return await nextResolve(mapped + ext, context)
      } catch {
        // Try the next candidate; rethrow the original error if none match so
        // the failure names the specifier the source actually wrote.
      }
    }
    throw error
  }
}

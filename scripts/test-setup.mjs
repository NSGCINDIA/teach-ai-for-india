import { register } from 'node:module'

// Installs the resolver in scripts/test-resolver.mjs for the test run.
// Loaded via `node --import ./scripts/test-setup.mjs` — see the `test` script.
register('./test-resolver.mjs', import.meta.url)

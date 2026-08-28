import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescriptConfig from 'eslint-config-next/typescript'

/**
 * ESLint flat config.
 *
 * `package.json` has carried a `lint` script since the project started, but
 * eslint was never a dependency and no config file existed, so the script had
 * never once run. This is the minimum that makes it work: Next.js's own rules,
 * which cover the App Router mistakes that actually bite here — client/server
 * boundary errors, `next/image` misuse, invalid `<Link>` usage.
 *
 * eslint-config-next 16 ships flat configs directly, so this needs no
 * FlatCompat shim.
 *
 * Deliberately no stylistic rules. Nothing has been linting 40k lines until
 * now, so a formatting ruleset would bury real findings under thousands of
 * cosmetic ones. Tighten later, from a green baseline.
 */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'supabase/**',
      'public/**',
    ],
  },
  ...coreWebVitals,
  ...typescriptConfig,
  {
    rules: {
      // `any` appears in ~57 places that are tracked separately as debt. Warn so
      // they stay visible without failing the build on day one.
      '@typescript-eslint/no-explicit-any': 'warn',
      // React Compiler rule from eslint-plugin-react-hooks v7. The ten current
      // hits are deliberate and correct as written: the hydration-safe
      // localStorage read in dashboard-shell, and animation replays that must
      // reset state when `prefers-reduced-motion` changes. Each has an
      // alternative, but rewriting them is a behavioural change to shipped
      // components rather than a lint cleanup — warn so new ones stay visible.
      'react-hooks/set-state-in-effect': 'warn',
      // Unused *variables and imports* are dead code and fail the build.
      // Unused *parameters* do not: a component's prop list and a callback's
      // signature document an interface, and several panels here legitimately
      // accept props they do not read yet on every branch. Renaming those to
      // `_name` in an object-destructuring pattern would change which property
      // is read, so silencing args is the correct trade rather than a dodge.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]

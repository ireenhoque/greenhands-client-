<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

Single-app Next.js 16 (App Router) + React 19 + TypeScript, npm-managed (use `npm`, not yarn/pnpm). Everything lives in `src/`; no monorepo, no tests, no CI. Entry point is `src/app/page.tsx` (currently a near-empty shell).

## Commands

```bash
npm run dev     # dev server (Turbopack), localhost:3000
npm run build   # production build
npm run lint    # eslint with eslint-config-next
npx tsc --noEmit  # typecheck — there is no "typecheck" script
```

## Framework quirks (verified in `next.config.ts`)

- `cacheComponents: true` is on: async data access in Server Components must be wrapped/awaited according to the cacheComponents model described in `node_modules/next/dist/docs/`; component APIs may differ from pre-16 Next.js examples.
- React Compiler is enabled (`reactCompiler: true` + `babel-plugin-react-compiler`): do not add manual `useMemo`/`useCallback`/`React.memo` unless profiling shows a real need.
- Tailwind v4 via the `@tailwindcss/turbopack` loader rule (not a PostCSS plugin). There is no `tailwind.config`; the theme is in `src/app/globals.css` (CSS variables).
- `npm run dev` and `npm run build` run on Turbopack; there is no webpack fallback config.

## UI structure

- `src/components/ui/*` is shadcn-generated output (style `base-nova`, see `components.json`) — but it is built on **`@base-ui/react` primitives, not Radix**, and icons come from `lucide-react` (shadcn CLI: `npx shadcn add <component>`; run from repo root so `components.json` governs the paths).
- The `cn` helper is the `cn` npm package, re-exported by `src/lib/utils.ts` — don't reimplement the usual `clsx`/`tailwind-merge` shim.
- Path alias `@/*` → `src/*`.
- Code highlighting uses Shiki's JavaScript regex engine with lazily loaded languages in `src/lib/highlighter.tsx`; register new languages (and aliases) there. If you use them during build/SSR, reuse the shared module instead of calling `createHighlighter` yourself.

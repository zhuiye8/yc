# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the main React 19 + TypeScript application. Keep shared UI in `src/components/`, layout shells in `src/layouts/`, route pages in `src/pages/`, and mock/domain data in `src/mock/`. Static assets live in `public/`. `scripts/parseChainMd.ts` regenerates `src/mock/industryChainGraphData.ts` from the six industry-chain Markdown source files bundled with this repo. `dashboard/` is a separate Vite-based visualization app with its own `src/`, `package.json`, and lint/format rules. Treat `dist/` and both `node_modules/` folders as generated output.

## Build, Test, and Development Commands
Run commands from `yc/` unless noted otherwise.

- `npm install`: install root dependencies.
- `npm run dev`: start the main site in Vite.
- `npm run build`: run `tsc -b` and produce a production build.
- `npm run lint`: check `ts` and `tsx` files with ESLint.
- `npm run preview`: preview the built root app.
- `cd dashboard && npm install`: install dashboard dependencies.
- `cd dashboard && npm run dev`: start the full-screen dashboard locally.
- `cd dashboard && npm run build`: build the dashboard app.
- `cd dashboard && npm run lint`: run dashboard ESLint rules.
- `npx tsx scripts/parseChainMd.ts`: regenerate industry-chain mock data after updating the source Markdown files.

## Coding Style & Naming Conventions
Use 2-space indentation. In `src/`, component and page files use PascalCase, for example `Home.tsx` and `MainLayout.tsx`; utilities and mock data use camelCase, such as `industryChainGraphData.ts`. In `dashboard/src`, preserve the existing lowercase `jsx` and `scss` filenames unless you are doing a wider cleanup. Follow the root ESLint config for TypeScript and the dashboard ESLint + Prettier setup (`tabWidth: 2`, `singleQuote: true`, `semi: true`). Keep existing file header blocks and nearby `INDEX.md` docs in sync when editing documented modules.

## Testing Guidelines
No automated test framework is configured in the root app or dashboard. For every change, run `npm run lint` and `npm run build` in the affected app, then manually smoke-test the touched routes or dashboard views. If you introduce tests, colocate them with the feature as `*.test.ts`, `*.test.tsx`, or `*.test.jsx`, and prefer Vitest for Vite compatibility.

## Commit & Pull Request Guidelines
This workspace copy does not include `.git` history, so commit conventions cannot be inferred from local logs. Use short imperative commit messages with an optional scope, for example `feat(industry): refine talent map filters`. Pull requests should summarize user-visible changes, list affected routes or data files, mention regenerated mock assets, and include screenshots for UI updates.

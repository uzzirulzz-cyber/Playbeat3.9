# AGENTS.md

## Project overview

This repo is a Vite + React storefront with a Node/Express API and an admin dashboard. The app is primarily in [src/App.tsx](src/App.tsx), [src/context/StoreContext.tsx](src/context/StoreContext.tsx), and [src/components](src/components). The server and HTTP routes live in [server.ts](server.ts), with data access in [src/lib/repository.ts](src/lib/repository.ts).

Key conventions:
- The app is a single-page frontend with admin/store view switching by URL and state.
- Product and app state are centralized in the store context instead of scattered component state.
- The repo supports MongoDB Atlas when `MONGODB_URI` is configured; otherwise it falls back to in-memory seed data from [src/data/mockData.ts](src/data/mockData.ts).
- The theme and branding are intentionally preserved; do not redo the dark premium storefront design or alter the existing business logic unless explicitly asked.

## Build and verification commands

Use the scripts in [package.json](package.json):

- `npm install` to install dependencies.
- `npm run dev` to start the dev server via the Express + Vite setup.
- `npm run build` to create a production build.
- `npm run lint` to run TypeScript checking (`tsc --noEmit`).
- `npm run start` to run the built server bundle.

Important notes:
- The project is configured to stay within the repo root in [vite.config.ts](vite.config.ts); do not widen filesystem access to `skills/`, `upload/`, or `download/`.
- The TypeScript config excludes those folders in [tsconfig.json](tsconfig.json).

## Architecture and editing guidance

- Frontend entry: [src/main.tsx](src/main.tsx), [src/App.tsx](src/App.tsx)
- Shared store/state: [src/context/StoreContext.tsx](src/context/StoreContext.tsx)
- Domain data models: [src/types.ts](src/types.ts)
- Mock data: [src/data/mockData.ts](src/data/mockData.ts)
- Server endpoints: [server.ts](server.ts)
- Auth helpers: [src/lib/auth.ts](src/lib/auth.ts)
- Repository/data layer: [src/lib/repository.ts](src/lib/repository.ts)

When making changes:
- Prefer updating existing components and patterns over introducing new app-wide frameworks.
- Keep admin and storefront behavior consistent with the current navigation and role logic.
- Preserve modal/drawer patterns and toast behavior used by the app.
- For product and variation changes, favor the repository and existing helper utilities rather than adding ad hoc storage logic.

## Safety and scope constraints

- Do not modify unrelated sandbox folders such as `skills/`, `download/`, or `upload/` unless the task explicitly requires it.
- Keep changes targeted; this project already contains extensive mock data and admin functionality.
- If a task is about a feature, first locate the matching data model and store logic before editing UI components.
- Prefer minimal diffs that maintain the current aesthetic and business flow.

## Working style for AI agents

- Read the relevant file and the nearest existing pattern before editing.
- Reuse the established component naming and import structure.
- Validate with the relevant command after code changes, usually `npm run lint` for TypeScript issues and a focused app check for UI behavior.
- If a change touches API behavior, verify the endpoint in the server file and confirm it remains aligned with the client-side store logic.

## Useful references

- [package.json](package.json)
- [vite.config.ts](vite.config.ts)
- [tsconfig.json](tsconfig.json)
- [server.ts](server.ts)
- [src/context/StoreContext.tsx](src/context/StoreContext.tsx)
- [src/data/mockData.ts](src/data/mockData.ts)
- [src/App.tsx](src/App.tsx)

## Next customizations worth creating

If you want to optimize this repo for agent workflows further, the most useful follow-ups are:
- `/create-skill admin-qa` for admin flow checks and regression validation
- `/create-instruction frontend` for React component and styling conventions
- `/create-instruction api` for server and repository safety patterns
- `/create-agent product-ops` for catalog and variation workflow automation

These would complement this repo-level instructions file without duplicating it.

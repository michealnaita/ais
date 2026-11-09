<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- Begin: Project Folder Structure rules -->
# Project Folder Structure

Follow a resource-oriented architecture when organising the project.

## 1. App Directory (`src/app/`)

Each route represents a resource or functional area and must be self-contained.

Each resource directory should contain:

- `page.tsx` – Route entry point.
- `types.ts` – Resource-specific TypeScript types and interfaces.
- `queries.ts` – TanStack Query hooks for fetching resource data.
- `actions.ts` – TanStack Query mutation hooks for modifying resource data.
- `components/` – Components used exclusively by that resource.

Nested routes belonging to the same resource should remain within its directory.

## 2. Shared Directories (`src/`)

Everything outside `app/` is considered shared application code.

Use the following directories:

- `components/` – Shared UI components.
- `hooks/` – Custom hooks shared across the application.
- `context/` – Shared React contexts and providers.
- `lib/` – Shared infrastructure, configurations and library integrations.
- `services/` – Shared business logic and data operations.
- `utils/` – General-purpose helper functions.
- `types/` – Application-wide TypeScript definitions.

## 3. Organisation Rules

1. Keep resource-specific code inside its respective route directory.
2. Keep genuinely reusable code outside `app/` in the appropriate shared directory.
3. Resource-specific code may import shared code, but shared code must not depend on individual resources.
4. Avoid duplicating functionality across resources.
5. Do not promote components or logic to shared directories unless they are needed by multiple resources.
6. Maintain this structure consistently as the application grows.

**Core principle:** Each route owns its functionality; shared directories own functionality used across routes. This structure should be applied consistently to all future applications.

<!-- End: Project Folder Structure rules -->

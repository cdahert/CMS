# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GenioX Commerce — B2B marketplace platform for commerce management (Bolivia-focused). Built with Next.js 15 App Router, React 19, TypeScript, Supabase, and shadcn/ui.

## Commands

```bash
npm run dev              # Dev server with Turbopack
npm run build            # Production build
npm run lint             # ESLint
npm run lint:fix         # ESLint autofix
npm run format           # Prettier format
npm run format:check     # Check formatting
npm run type-check       # TypeScript type checking
```

Pre-commit hooks (Husky + lint-staged) automatically run ESLint and Prettier on staged files.

## Architecture

### Routing & Auth

- **App Router** with two protected route groups: `/admin/*` (platform admins) and `/comercios/*` (merchant portal)
- **Public routes:** `/`, `/blog`, `/soluciones`, `/comercios/login`, `/comercios/registro`
- **Auth:** Supabase Auth with Google OAuth. Role stored in `sessionStorage` key `gx-login-role`
- **Middleware** (`src/middleware.ts`) handles route protection and role-based redirects
- **Authorization wrappers:** `AdminRoute` and `CommerceRoute` components check roles via `has_role()` / `is_commerce_member()` Supabase functions

### Data Layer

- **Database:** Supabase (PostgreSQL) with RLS on all tables. Schema in `supabase/migration.sql` (18 tables)
- **Supabase clients:** `src/integrations/supabase/client.ts` (browser), `src/integrations/supabase/server.ts` (server-side)
- **DB types:** `src/integrations/supabase/types.ts` (generated)
- **Server state:** TanStack React Query (60s stale time, 5min cache, 1 retry)
- **Client state:** Zustand
- **Forms:** React Hook Form + Zod validation (`src/lib/validations/`)

### UI & Styling

- **Component library:** shadcn/ui (in `src/components/ui/`) with Radix UI primitives
- **Styling:** Tailwind CSS with HSL CSS variables for theming. Dark mode enabled by default (class-based)
- **Class merging:** Use `cn()` from `src/lib/utils`
- **Rich text:** Tiptap editor (`TiptapEditor` / `TiptapRenderer` components)
- **Font:** Inter

### Key Conventions

- Path alias: `@/*` maps to `src/*`
- Server Components by default; `"use client"` only for interactive components
- Console: only `warn` and `error` allowed (no `console.log`)
- Unused variables must be prefixed with `_`
- Prettier: 80 char width, double quotes, ES5 trailing commas, Tailwind class sorting
- Locale: Spanish (es_BO)

### Environment Variables

Required vars defined in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase connection
- `SUPABASE_SERVICE_ROLE_KEY` — server-only admin access
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` — app config

### API Routes

- `POST /api/settlements` — Commission calculation and settlement creation
- `POST /api/webhooks` — ERP webhook handler

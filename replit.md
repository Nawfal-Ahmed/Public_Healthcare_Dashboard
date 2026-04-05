# Workspace

## Overview

Full-stack MERN-style public healthcare dashboard built with React + Vite frontend and Express + PostgreSQL backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Recharts
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: express-session + bcryptjs (cookie-based sessions)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Project: HealthWatch - Public Healthcare Dashboard

### Features

**Auth System:**
- Login + registration pages
- Role-based access: `user` and `admin`
- Session-based authentication (cookie)

**Admin Panel (hamburger/sidebar menu):**
- `/admin/alerts` — Create, edit, delete health alerts (severity: low/medium/high/critical)
- `/admin/vaccinations` — Manage vaccine programs info
- `/admin/users` — View and delete user accounts
- `/admin/metrics` — Control disease metrics (hospitalized, recovered, death_rate) per disease

**User Dashboard:**
- `/dashboard` — Active health alerts + disease summary cards
- `/vaccinations` — Vaccination programs available in their area
- `/charts` — Analytics charts (area/line charts) per disease with disease dropdown

### Demo Credentials
- **Admin:** admin@health.gov / password123
- **User:** jane@example.com / password123

### Seeded Data
- 4 health alerts (varying severity)
- 5 vaccination programs
- Disease metrics for: COVID-19, Influenza, Dengue (3 months each)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

Tables: `users`, `alerts`, `vaccinations`, `disease_metrics`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

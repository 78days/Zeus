# ⚡ ZEUS

[![CI](https://github.com/78days/Zeus/actions/workflows/ci.yml/badge.svg)](https://github.com/78days/Zeus/actions/workflows/ci.yml)

Zeus is a TypeScript-driven software project focused on building scalable, intelligent workflow and automation capabilities, with lightweight supporting infrastructure in shell and web styling layers.

> Design a workflow once. Zeus runs it in a real browser, on a schedule, and shows you exactly what happened.

**Live:** [zeus-eight-xi.vercel.app](https://zeus-eight-xi.vercel.app)

## Overview

ZEUS is a visual workflow automation platform for browser-based tasks. It lets teams design workflows on a collaborative canvas, combine browser actions with structured extraction, and run the flow in a persistent browser session with live status updates.

The product is built on Next.js 16, React 19, and TypeScript, with Clerk for auth, Neon Postgres for persistence, Trigger.dev for durable jobs, Browserbase/Stagehand for browser automation, and Resend for email delivery.

## Highlights

- Visual flow canvas with connected workflow nodes
- Real-time collaboration and shared editing state
- Browser automation through Stagehand on Browserbase
- Durable execution via Trigger.dev jobs
- Live run status and console logs
- Scheduling and recurring workflows
- Email delivery using interpolated workflow outputs
- Org-scoped access and plan-aware features

## Workflow nodes

| Node | Type | Purpose |
| --- | --- | --- |
| Start | Trigger | Entry point for the workflow |
| Agent | Action | Handles open-ended browser tasks from a natural-language instruction |
| Act | Action | Performs a single browser action |
| Observe | Action | Finds relevant actions or elements on the page |
| Open URL | Action | Opens a page in the browser session |
| Send Email | Action | Sends an email with interpolated values from previous outputs |

## Tech stack

| Layer | Choice |
| --- | --- |
| App framework | Next.js 16 |
| UI | React 19, Tailwind CSS, shadcn/ui, Base UI, Radix UI |
| Auth | Clerk |
| Collaboration | Liveblocks |
| Database | Neon Postgres, Drizzle ORM |
| Browser automation | Browserbase + Stagehand |
| Background jobs | Trigger.dev |
| Email | Resend |
| Monitoring | Sentry |
| Language | TypeScript |

## Architecture

```text
Browser (Next.js app)
├── Canvas (React Flow + Liveblocks multiplayer)
├── Console (run history, logs, replay)
└── Sidebar (workflow controls, inspector, schedule UI)
        │
        ▼
Server actions / route handlers
├── Neon Postgres (workflows, graphs, schedules)
├── Liveblocks (presence and collaboration)
├── Trigger.dev jobs
│   └── run-workflow / scheduled-workflow
│       └── Stagehand on Browserbase
└── Resend email delivery
```

## Getting started

### Prerequisites

- Node.js 20.9+
- npm
- A Neon Postgres database or PostgreSQL-compatible instance
- Accounts and API keys for Clerk, Liveblocks, Browserbase, Trigger.dev, and Resend

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```dotenv
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_

# Neon / PostgreSQL
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# Liveblocks
LIVEBLOCKS_SECRET_KEY=sk_...

# Browserbase
BROWSERBASE_API_KEY=...
BROWSERBASE_EXTENSION_ID=""

# Resend
RESEND_API_KEY=re_...

# Trigger.dev
TRIGGER_SECRET_KEY=tr_...
```

The repository also includes `.env.example` with the expected variables.

### 3. Apply the database schema

```bash
npm run db:migrate
```

### 4. Start the app and workers

```bash
npm run dev
npx trigger.dev@latest dev
```

The workflow runner is handled by the Trigger.dev tasks in `src/trigger/`.

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js app |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run format` | Format TypeScript and TSX files |
| `npm run db:generate` | Generate a Drizzle migration |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push the schema directly to the database |
| `npm run db:studio` | Open Drizzle Studio |

## Project structure

```text
app/
components/
features/
  workflows/
    actions.ts
    data.ts
    components/
    hooks/
    lib/
    nodes/
lib/
  db/
src/
  trigger/
  app/
design/
drizzle/
public/
next.config.ts
trigger.config.ts
.eslintrc
package.json
.env.example
```

## CI/CD

CI is already configured in `.github/workflows/ci.yml` and runs on push and pull request.

The workflow checks:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npx prettier --check "**/*.{ts,tsx}"`
- `npm run build`

## Security

- Keep `.env.local` and provider credentials out of version control.
- Store API keys in environment variables only.
- Scope workflow access to the authenticated organization.
- Report errors to Sentry with useful operation context.

## Status

ZEUS is under active development. The workflow canvas, browser automation, scheduling, replay, and background execution foundation are in place and continue to evolve.

---

<p align="center">Built with ⚡ by the ZEUS team</p>

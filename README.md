# ⚡ ZEUS

[![CI](https://github.com/78days/Zeus/actions/workflows/ci.yml/badge.svg)](https://github.com/78days/Zeus/actions/workflows/ci.yml)

**ZEUS is a visual workflow automation platform for browser-based tasks.** Build workflows on a collaborative canvas, combine browser actions with structured data extraction and email delivery, and run the finished workflow as a durable background job — with live step-by-step progress, session replays, and scheduling.

> Design a flow once. Zeus runs it in a real browser, on a schedule, and shows you exactly what happened.

**🔗 Live:** [https://zeus-eight-xi.vercel.app](https://zeus-eight-xi.vercel.app)

---

## Table of Contents

- [Highlights](#highlights)
- [How It Works](#how-it-works)
- [Workflow Nodes](#workflow-nodes)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Project Structure](#project-structure)
- [Adding a Workflow Node](#adding-a-workflow-node)
- [Execution Model](#execution-model)
- [Deployment](#deployment)
- [Security](#security)
- [Status](#status)

---

## Highlights

| Capability | What you get |
| --- | --- |
| 🎨 **Visual builder** | Drag-and-drop canvas powered by React Flow, with an inspector for editing node properties. |
| 👥 **Real-time collaboration** | Multiplayer editing and presence through Liveblocks — see teammates' cursors and changes live. |
| 🤖 **AI browser automation** | Stagehand on Browserbase: natural-language acting, observing, and structured extraction in a real browser. |
| 📊 **Live run status** | Trigger.dev powers durable execution; every step streams its status (pending → running → done/failed) to the canvas and console in real time. |
| ⏱ **Scheduling** | Schedule workflows with friendly presets (every hour, daily at 9:00, weekly…) — no cron expertise required. A dedicated `/scheduled` page lists everything that runs automatically. |
| 🛑 **Run control** | Stop an in-flight run from the Run/Stop toggle; step statuses settle gracefully (stopped/skipped) in the logs. |
| 🎥 **Session replays** | Every run's browser session is recorded — replay it from the console to see exactly what the automation did. |
| 📧 **Email delivery** | Send results anywhere with Resend, interpolating outputs from earlier nodes. |
| 🏢 **Organizations & billing** | Clerk organizations with Pro plan gating for premium nodes. |
| 🗄 **Serverless Postgres** | Neon Postgres with Drizzle ORM and versioned migrations. |

## How It Works

1. **Design** — drag nodes onto the canvas, connect them into a directed graph, and configure each node's fields. Upstream outputs can be referenced in downstream fields with `{{nodeId}}` interpolation.
2. **Run** — hit **Run**. The graph is saved and a durable Trigger.dev task takes over: nodes execute in topological order inside a shared Browserbase browser session.
3. **Watch** — step statuses light up live on the canvas and in the run console. Open the inspector for any step's output, or replay the recorded browser session.
4. **Automate** — schedule the workflow with a preset and let it run itself. Manage everything scheduled from the `/scheduled` page.

## Workflow Nodes

| Node | Kind | Purpose |
| --- | --- | --- |
| **Start** | Trigger | Workflow entry point. |
| **Agent** ⭐ | Action | Complete an open-ended browser task from a natural-language instruction. *(Pro plan)* |
| **Act** | Action | Perform one specific browser action. |
| **Observe** | Action | Find possible actions or elements on the current page. |
| **Extract** | Action | Extract structured information from a page. |
| **Open URL** | Action | Open a URL in the shared browser session. |
| **Send Email** | Action | Send an email using interpolated workflow values. |

⭐ denotes a Pro-gated node. Outputs from previous nodes can be referenced by later nodes using the interpolation syntax in `features/workflows/lib/interpolate.ts`.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Base UI, Radix UI, Lucide |
| Canvas | React Flow (`@xyflow/react`) |
| Authentication | Clerk (organizations, Pro plan entitlements) |
| Collaboration | Liveblocks |
| Database | Neon Postgres, Drizzle ORM, Drizzle Kit |
| Automation | Browserbase, Stagehand v4 |
| Background jobs | Trigger.dev |
| Email | Resend |
| Monitoring | Sentry |

## Architecture

```text
 Browser (Next.js app)
 ├── Canvas (React Flow + Liveblocks multiplayer)
 ├── Console (run history, step logs, replay viewer)
 └── Sidebar (toolbar, inspector, schedule controls)
        │
        ▼
 Server Actions (Clerk-authenticated, org-scoped)
 ├── Neon Postgres (workflows, graphs, schedules) via Drizzle
 ├── Liveblocks (rooms, auth, presence)
 └── Trigger.dev
      └── run-workflow / scheduled-workflow tasks
           └── Stagehand on Browserbase (AI browser automation)
```

## Getting Started

### Prerequisites

- Node.js 20.9+
- npm
- A Neon Postgres database (or any PostgreSQL)
- Accounts and API keys for [Clerk](https://clerk.com), [Liveblocks](https://liveblocks.io), [Browserbase](https://browserbase.com), [Trigger.dev](https://trigger.dev), and [Resend](https://resend.com)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment** — create `.env.local` in the project root:

   ```dotenv
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Neon / PostgreSQL
   DATABASE_URL=postgresql://...            # pooled connection
   DATABASE_URL_UNPOOLED=postgresql://...   # direct connection (required by Drizzle Kit)

   # Liveblocks
   LIVEBLOCKS_SECRET_KEY=sk_...

   # Browserbase (drives Stagehand's browser automation)
   BROWSERBASE_API_KEY=...
   # Optional: pre-uploaded extension to avoid runtime uploads
   BROWSERBASE_EXTENSION_ID=""

   # Resend
   RESEND_API_KEY=re_...

   # Trigger.dev
   TRIGGER_SECRET_KEY=tr_...
   ```

   > `DATABASE_URL_UNPOOLED` is required by the Drizzle Kit commands. The application itself uses `DATABASE_URL_UNPOOLED` when available and falls back to `DATABASE_URL`.

3. **Apply the database schema**

   ```bash
   npm run db:migrate
   ```

4. **Start the development servers**

   ```bash
   npm run dev                  # Next.js app → http://localhost:3000
   npx trigger.dev@latest dev   # Trigger.dev worker (separate terminal)
   ```

Workflow runs are handled by the `run-workflow` task in `src/trigger/run-workflow.ts`; schedules by `scheduled-workflow` in `src/trigger/scheduled-workflow.ts`.

## Development Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm run format` | Format TypeScript and TSX files with Prettier. |
| `npm run db:generate` | Generate a Drizzle migration from schema changes. |
| `npm run db:migrate` | Apply pending Drizzle migrations. |
| `npm run db:push` | Push the schema directly to the database (dev only — bypasses migration history). |
| `npm run db:studio` | Open Drizzle Studio. |

CI runs on every push and pull request (`.github/workflows/ci.yml`): install → lint → typecheck → format check → production build.

## Project Structure

```text
app/                         Next.js routes, layouts, and API handlers
│  ├── (dashboard)/          Main app — workflows, scheduled page, billing
│  └── api/                  Route handlers (Liveblocks auth, replays)
components/                  Shared UI components (shadcn/ui primitives, app shell)
features/workflows/          The workflow feature
│  ├── actions.ts            Server actions (run, cancel, schedule, CRUD)
│  ├── data.ts               Database queries (Drizzle)
│  ├── components/           Canvas, console, sidebar, logs, replay viewer
│  ├── hooks/                Org/plan, upstream connections
│  ├── lib/                  Graph validation, interpolation, schedule presets
│  └── nodes/                Node registry + executors (registry-driven)
lib/db/                      Drizzle client and PostgreSQL schema
lib/liveblocks.ts            Liveblocks server client
src/trigger/                 Trigger.dev tasks (run-workflow, scheduled-workflow)
drizzle/                     Generated database migrations
trigger.config.ts            Trigger.dev project configuration
```

## Adding a Workflow Node

Workflow nodes are **registry-driven** — the runner and the canvas consume the registry automatically. To add an action node, make three edits under `features/workflows/nodes/`:

1. **Executor** — add the node's implementation (e.g. `open-url.ts`).
2. **Register** — add it to `node-executors.ts`; the `satisfies` contract makes a missing executor a compile error.
3. **Manifest** — add its entry in `node-registry.ts`: kind, label, icon, accent, input `fields`, and the `outputs` downstream nodes can reference.

No changes to the run task or the canvas are needed for a standard node.

## Execution Model

When a workflow is run, ZEUS saves the current graph and triggers the `run-workflow` Trigger.dev task. The task:

1. Loads the workflow for the authenticated organization.
2. Orders connected nodes with a topological sort (cycles are rejected; orphan nodes are skipped).
3. Interpolates `{{nodeId}}` references from earlier node outputs.
4. Lazily opens one Browserbase session and reuses it across all browser steps, so the recording spans the whole run.
5. Publishes step status as each node moves from `pending` → `running` → `done`/`failed`; statuses stream to the UI in real time.
6. Closes Stagehand and the browser session when execution completes, fails, or is cancelled.

Cancelled runs settle gracefully: the in-flight step is marked `stopped` and remaining steps `skipped`, so nothing keeps spinning in the UI.

## Deployment

### Vercel (recommended)

**ZEUS is live at [zeus-eight-xi.vercel.app](https://zeus-eight-xi.vercel.app).**

1. Push the repository to GitHub.
2. Import the project into Vercel and add every variable from `.env.local` in **Settings → Environment Variables** — builds fail fast if required secrets (e.g. `LIVEBLOCKS_SECRET_KEY`) are missing.
3. Deploy. `npm run build` runs automatically.

> Tip: keep Vercel's Deployment Protection enabled for internal use, and disable it only when the app should be publicly reachable.

### Trigger.dev

Deploy the background workers separately:

```bash
npx trigger.dev@latest deploy
```

## Security

- Keep `.env.local` and all provider credentials out of version control.
- Use server-side environment variables for secret keys — never expose `CLERK_SECRET_KEY`, `LIVEBLOCKS_SECRET_KEY`, `BROWSERBASE_API_KEY`, `RESEND_API_KEY`, or `TRIGGER_SECRET_KEY` to the browser.
- Workflow and schedule access is scoped to the authenticated Clerk organization.
- Browserbase sessions carry organization and workflow metadata for traceability.
- Errors are reported to Sentry with operation context.

## Status

ZEUS is under active development. The workflow canvas, persistence, collaboration, browser automation, scheduling, run cancellation, session replay, and background execution foundations are in place, while additional workflow capabilities and production hardening continue to evolve.

---

<p align="center">Built with ⚡ by the ZEUS team</p>

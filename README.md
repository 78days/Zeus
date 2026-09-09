# ZEUS

ZEUS is a visual workflow automation platform for browser-based tasks. Build workflows on a collaborative canvas, combine browser actions with structured data extraction and email delivery, then run the completed workflow in a managed background job.

## Features

- Visual workflow builder powered by React Flow.
- Real-time workflow editing and presence through Liveblocks.
- Browser automation with Stagehand and Browserbase.
- AI-assisted browser actions, observations, and data extraction.
- Email delivery through Resend.
- Durable workflow execution and live run status through Trigger.dev.
- Organization-based authentication and access control with Clerk.
- PostgreSQL persistence through Neon and Drizzle ORM.

## Workflow Nodes

The current node registry includes:

| Node | Purpose |
| --- | --- |
| **Start** | Workflow entry point. |
| **Agent** | Complete a browser task from a natural-language instruction. |
| **Act** | Perform a specific browser action. |
| **Observe** | Find possible actions or elements on the current page. |
| **Extract** | Extract structured information from a page. |
| **Open URL** | Open a URL in the shared browser session. |
| **Send Email** | Send an email using workflow values. |

Outputs from previous nodes can be referenced by later nodes using the workflow interpolation syntax supported by `features/workflows/lib/interpolate.ts`.

## Tech Stack

- **Application:** Next.js 16, React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Base UI, Radix UI, Lucide
- **Canvas:** React Flow (`@xyflow/react`)
- **Authentication:** Clerk
- **Collaboration:** Liveblocks
- **Database:** Neon Postgres, Drizzle ORM, Drizzle Kit
- **Automation:** Browserbase, Stagehand
- **Background jobs:** Trigger.dev
- **Email:** Resend

## Prerequisites

- Node.js 20.9 or newer
- npm
- A PostgreSQL database, preferably Neon
- Accounts and credentials for Clerk, Liveblocks, Browserbase, Trigger.dev, and Resend

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root and add the required credentials:

   ```dotenv
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Neon / PostgreSQL
   DATABASE_URL=postgresql://...
   DATABASE_URL_UNPOOLED=postgresql://...

   # Liveblocks
   LIVEBLOCKS_SECRET_KEY=sk_...

   # Browserbase and Stagehand
   BROWSERBASE_API_KEY=...

   # Resend
   RESEND_API_KEY=re_...

   # Trigger.dev
   TRIGGER_SECRET_KEY=tr_...
   ```

   `DATABASE_URL_UNPOOLED` is required by the Drizzle Kit commands. The application uses `DATABASE_URL_UNPOOLED` when available and falls back to `DATABASE_URL`.

3. Apply the database schema:

   ```bash
   npm run db:migrate
   ```

4. Start the Next.js development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Start the Trigger.dev development worker in a separate terminal using the Trigger.dev CLI configured for this project:

   ```bash
   npx trigger.dev@latest dev
   ```

   Workflow runs are handled by the `run-workflow` task in `src/trigger/run-workflow.ts`.

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
| `npm run db:push` | Push the schema directly to the database. |
| `npm run db:studio` | Open Drizzle Studio. |

## Project Structure

```text
app/                         Next.js routes, layouts, and API handlers
components/                  Shared UI components
features/workflows/          Workflow data, actions, canvas, and node definitions
lib/db/                      Drizzle client and PostgreSQL schema
lib/liveblocks.ts            Liveblocks server client
src/trigger/                 Trigger.dev background tasks
drizzle/                     Generated database migrations
trigger.config.ts            Trigger.dev project configuration
```

## Adding A Workflow Node

Workflow nodes are registry-driven. To add an action node:

1. Add the executor under `features/workflows/nodes/`.
2. Register the executor in `features/workflows/nodes/node-executors.ts`.
3. Add the node manifest, fields, icon, accent, and outputs to `features/workflows/nodes/node-registry.ts`.

The workflow runner and canvas consume the registry automatically, so they should not require changes for a standard node addition.

## Execution Model

When a workflow is run, ZEUS saves the current graph and triggers the `run-workflow` Trigger.dev task. The task:

1. Loads the workflow for the active organization.
2. Orders connected nodes with a topological sort.
3. Interpolates values from earlier node outputs.
4. Lazily opens one Browserbase session and reuses it across browser steps.
5. Publishes step status as each node moves from pending to running, done, or failed.
6. Closes the Stagehand and browser resources when execution completes or fails.

## Security

- Keep `.env.local` and all provider credentials out of version control.
- Use server-side environment variables for secret keys.
- Do not expose `CLERK_SECRET_KEY`, `LIVEBLOCKS_SECRET_KEY`, `BROWSERBASE_API_KEY`, `RESEND_API_KEY`, or `TRIGGER_SECRET_KEY` to the browser.
- Workflow access is scoped to the authenticated Clerk organization.

## Status

ZEUS is under active development. The workflow canvas, persistence, collaboration, browser automation, email, and background execution foundations are in place, while additional workflow capabilities and production hardening continue to evolve.

import { and, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { WorkflowGraph, workflows } from "@/lib/db/schema"
import { validateGraph } from "@/features/workflows/lib/validate-graph"
import { reportError } from "@/lib/sentry"

function isTransientDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const cause = error instanceof Error && error.cause ? String(error.cause) : ""
  return /fetch failed|ETIMEDOUT|ECONNRESET|ENETUNREACH/i.test(
    `${message} ${cause}`
  )
}

async function withDatabaseRetry<T>(operation: () => Promise<T>) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      if (attempt >= 2 || !isTransientDatabaseError(error)) {
        reportError(error, { operation: "database.query", attempt })
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt))
    }
  }
}

export async function saveWorkflowGraph({
  orgId,
  id,
  graph,
}: {
  orgId: string
  id: string
  graph: WorkflowGraph
}) {
  const problems = validateGraph(graph)
  if (problems.length > 0) throw new Error(problems.join(" "))
  await withDatabaseRetry(() =>
    db
      .update(workflows)
      .set({ graph, updatedAt: new Date() })
      .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
  )
}

export function listWorkflows(orgId: string) {
  return withDatabaseRetry(() =>
    db
      .select()
      .from(workflows)
      .where(eq(workflows.orgId, orgId))
      .orderBy(desc(workflows.createdAt))
  )
}

export function listScheduledWorkflows(orgId: string) {
  return withDatabaseRetry(() =>
    db
      .select()
      .from(workflows)
      .where(
        and(eq(workflows.orgId, orgId), eq(workflows.scheduleActive, true))
      )
      .orderBy(desc(workflows.createdAt))
  )
}

export async function getWorkflow(orgId: string, id: string) {
  const [workflow] = await withDatabaseRetry(() =>
    db
      .select()
      .from(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
  )

  return workflow
}

export async function getWorkflowById(id: string) {
  const [workflow] = await withDatabaseRetry(() =>
    db.select().from(workflows).where(eq(workflows.id, id))
  )

  return workflow
}

export async function createWorkflow(orgId: string, name: string) {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name, graph: { nodes: [], edges: [] } })
    .returning()

  return workflow
}

export async function deleteWorkflow(orgId: string, id: string) {
  const [workflow] = await withDatabaseRetry(() =>
    db
      .delete(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
      .returning()
  )

  return workflow
}

export async function saveWorkflowSchedule({
  orgId,
  id,
  scheduleId,
  cron,
  timezone,
  active,
}: {
  orgId: string
  id: string
  scheduleId: string | null
  cron: string | null
  timezone: string | null
  active: boolean
}) {
  await withDatabaseRetry(() =>
    db
      .update(workflows)
      .set({
        scheduleId,
        scheduleCron: cron,
        scheduleTimezone: timezone,
        scheduleActive: active,
        updatedAt: new Date(),
      })
      .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
  )
}

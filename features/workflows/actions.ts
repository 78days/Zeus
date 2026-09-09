"use server"

import { auth } from "@clerk/nextjs/server"
import { runs, tasks } from "@trigger.dev/sdk"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { runWorkflowTask } from "@/src/trigger/run-workflow"

import { liveblocks } from "@/lib/liveblocks"
import { reportError } from "@/lib/sentry"
import { createWorkflow, deleteWorkflow, saveWorkflowGraph } from "@/features/workflows/data"
import type { WorkflowGraph } from "@/lib/db/schema"

export async function createWorkflowAction(name: string) {
  const { has, orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  if (!has({ plan: "org:pro" })) {
    throw new Error("An organization Pro plan is required to create workflows")
  }

  let workflow
  try {
    workflow = await createWorkflow(orgId, name)
  } catch (error) {
    reportError(error, { operation: "workflows.create", orgId })
    throw error
  }

  revalidatePath("/workflows", "layout")
  redirect(`/workflows/${workflow.id}`)
}

export async function deleteWorkflowAction(id: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  let workflow
  try {
    workflow = await deleteWorkflow(orgId, id)
  } catch (error) {
    reportError(error, { operation: "workflows.delete", orgId, workflowId: id })
    throw error
  }

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  // The workflow id doubles as its Liveblocks room id — clean it up too.
  try {
    await liveblocks.deleteRoom(id)
  } catch (error) {
    reportError(error, { operation: "liveblocks.delete-room", orgId, workflowId: id })
    throw error
  }

  revalidatePath("/workflows", "layout")
  redirect("/")
}

export async function runWorkflowAction({
  id,
  graph,
}: {
  id: string
  graph: WorkflowGraph
}) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  try {
    await saveWorkflowGraph({ orgId, id, graph })
  } catch (error) {
    reportError(error, { operation: "workflows.save-graph", orgId, workflowId: id })
    throw error
  }

  let handle
  try {
    handle = await tasks.trigger<typeof runWorkflowTask>(
      "run-workflow",
      { workflowId: id, orgId },
      { tags: [`workflow:${id}`] }
    )
  } catch (error) {
    reportError(error, { operation: "workflows.trigger-run", orgId, workflowId: id })
    throw error
  }

  return handle
}

export async function cancelWorkflowRunAction(runId: string) {
  const { orgId } = await auth()
  if (!orgId) throw new Error("No active organization")
  try {
    await runs.cancel(runId)
  } catch (error) {
    reportError(error, { operation: "workflows.cancel-run", orgId, runId })
    throw error
  }
}

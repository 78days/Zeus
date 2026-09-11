import { schedules, tasks } from "@trigger.dev/sdk"

import { getWorkflowById } from "@/features/workflows/data"
import type { runWorkflowTask } from "@/src/trigger/run-workflow"

export const scheduledWorkflowTask = schedules.task({
  id: "scheduled-workflow",
  run: async (payload) => {
    if (!payload.externalId)
      throw new Error("Scheduled workflow has no workflow ID")

    const workflow = await getWorkflowById(payload.externalId)
    if (!workflow) throw new Error(`Workflow ${payload.externalId} not found`)

    return tasks.trigger<typeof runWorkflowTask>(
      "run-workflow",
      { workflowId: workflow.id, orgId: workflow.orgId },
      { tags: [`workflow:${workflow.id}`, "workflow:scheduled"] }
    )
  },
})

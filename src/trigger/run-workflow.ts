import toposort from "toposort"
import Browserbase from "@browserbasehq/sdk"
import { logger, task } from "@trigger.dev/sdk"

import { getWorkflow } from "@/features/workflows/data"

export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({ workflowId, orgId }: { workflowId: string; orgId: string }) => {
    const workflow = await getWorkflow(orgId, workflowId)
    if (!workflow?.graph) throw new Error(`Workflow ${workflowId} has no graph`)

    const { nodes, edges } = workflow.graph
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const connected = new Set(edges.flatMap((edge) => [edge.source, edge.target]))
    const order = toposort(edges.map((edge) => [edge.source, edge.target]))
      .filter((id) => connected.has(id))

    const instructions = order
      .map((id) => byId.get(id)?.data)
      .filter((data): data is NonNullable<typeof data> => Boolean(data))
      .map((data) => {
        const values = Object.entries(data.values)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")
        return `${data.title}${values ? `\n${values}` : ""}`
      })
      .join("\n\n")

    const browserbase = new Browserbase({
      apiKey: process.env.BROWSERBASE_API_KEY,
    })
    const run = await browserbase.agents.runs.create({
      task: `Execute the following workflow in a web browser. Follow the steps in order, use only the information provided, and stop if a required value is missing.\n\nWorkflow: ${workflow.name}\n\n${instructions}`,
    })

    logger.log(`Started Browserbase run for workflow ${workflow.name}`, {
      browserbaseRunId: run.runId,
      steps: order.length,
    })

    return { browserbaseRunId: run.runId, steps: order.length }
  },
})

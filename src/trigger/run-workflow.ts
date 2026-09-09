import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"
import { browserbase, Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import { getWorkflow } from "@/features/workflows/data"
import { interpolate } from "@/features/workflows/lib/interpolate"

export type RunStep = {
  id: string
  status: "pending" | "running" | "done" | "failed"
}

// The Trigger.dev task the Run button fires. It loads the saved graph, works out
// what order the nodes should run in, and walks them. For now each node just
// announces itself — real execution (per-node executors, live progress, browser
// sessions) gets layered on from here.
export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({ workflowId, orgId }: { workflowId: string; orgId: string }) => {
    const workflow = await getWorkflow(orgId, workflowId)
    if (!workflow?.graph) throw new Error(`Workflow ${workflowId} has no graph`)

    const { nodes, edges } = workflow.graph
    const byId = new Map(nodes.map((n) => [n.id, n]))

    // Run only connected nodes — anything touching an edge. Orphans dropped on
    // the canvas are skipped. toposort orders them and throws on a cycle.
    const connected = new Set(edges.flatMap((e) => [e.source, e.target]))
    const order = toposort(edges.map((e) => [e.source, e.target]))
      .filter((id) => connected.has(id))
    const steps: RunStep[] = order.map((id) => ({ id, status: "pending" }))

    const publishSteps = () => {
      metadata.set("steps", [...steps])
    }

    publishSteps()

    logger.log(`Running workflow ${workflow.name}`, { steps: order.length })

    // The run owns one Browserbase session, opened lazily on the first browser step
    // and reused by every later one, so the recording spans the whole flow. The
    // LLM routes through Browserbase's Model Gateway (BROWSERBASE_API_KEY), so no
    // separate provider key is needed.
    let stagehand: Stagehand | undefined
    let browser: Awaited<ReturnType<typeof browserbase.launch>> | undefined
    const outputs: Record<string, unknown> = {}
    const getStagehand = async () => {
      if (stagehand) return stagehand
      const apiKey = process.env.BROWSERBASE_API_KEY
      if (!apiKey) throw new Error("BROWSERBASE_API_KEY is not set")

      browser = await browserbase.launch({ apiKey })
      stagehand = await Stagehand.create({
        browser,
        model: {
          modelName: "google/gemini-2.5-flash",
          apiKey,
        },
        logging: { level: "off", format: "pretty" },
      })
      return stagehand
    }

    try {
      for (const id of order) {
        const node = byId.get(id)
        if (!node) continue
        logger.log(`Running step: ${node.data.title}`)
        const stepIndex = steps.findIndex((step) => step.id === id)
        steps[stepIndex] = { id, status: "running" }
        publishSteps()
        await metadata.flush()

        const executor = nodeExecutors[node.data.type]
        const values = Object.fromEntries(
          Object.entries(node.data.values).map(([key, value]) => [
            key,
            interpolate(value, outputs),
          ])
        )
        try {
          outputs[id] = executor
            ? await executor({ values, getStagehand })
            : undefined
          steps[stepIndex] = { id, status: "done" }
          publishSteps()
        } catch (error) {
          steps[stepIndex] = { id, status: "failed" }
          publishSteps()
          await metadata.flush()
          throw error
        }
      }
    } finally {
      await stagehand?.close()
      await browser?.close()
    }

    return { steps }
  },
})

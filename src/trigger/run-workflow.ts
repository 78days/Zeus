import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"
import { browserbase, Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import { getWorkflow } from "@/features/workflows/data"
import { interpolate } from "@/features/workflows/lib/interpolate"

export type RunStep = {
  id: string
  nodeType: string
  title: string
  status: "pending" | "running" | "done" | "failed"
  startedAt?: string
  finishedAt?: string
  durationMs?: number
  output?: unknown
  error?: {
    name: string
    message: string
    stack?: string
  }
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
    const steps: RunStep[] = order.map((id) => {
      const node = byId.get(id)
      return {
        id,
        nodeType: node?.data.type ?? "unknown",
        title: node?.data.title ?? id,
        status: "pending",
      }
    })

    const publishSteps = () => {
      metadata.set("steps", [...steps] as never)
    }

    publishSteps()

    logger.log(`Running workflow ${workflow.name}`, { steps: order.length })

    // The run owns one Browserbase session, opened lazily on the first browser step
    // and reused by every later one, so the recording spans the whole flow. The
    // LLM routes through Browserbase's Model Gateway (BROWSERBASE_API_KEY), so no
    // separate provider key is needed.
    let stagehand: Stagehand | undefined
    let browser: Awaited<ReturnType<typeof browserbase.launch>> | undefined
    let sessionId: string | undefined
    const outputs: Record<string, unknown> = {}
    const getStagehand = async () => {
      if (stagehand) return stagehand
      const apiKey = process.env.BROWSERBASE_API_KEY
      if (!apiKey) throw new Error("BROWSERBASE_API_KEY is not set")

      browser = await browserbase.launch({
        apiKey,
        // A pre-uploaded extension avoids runtime uploads in Trigger deployments,
        // where package assets may not be available to the worker.
        extensionId: process.env.BROWSERBASE_EXTENSION_ID,
        userMetadata: { orgId, workflowId },
      })
      sessionId = browser.sessionId
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
        const startedAt = new Date().toISOString()
        steps[stepIndex] = {
          ...steps[stepIndex],
          status: "running",
          startedAt,
        }
        publishSteps()
        await metadata.flush()

        try {
          const executor = nodeExecutors[node.data.type]
          if (!executor) {
            const finishedAt = new Date().toISOString()
            steps[stepIndex] = {
              ...steps[stepIndex],
              status: "done",
              finishedAt,
              durationMs:
                new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
            }
            publishSteps()
            await metadata.flush()
            continue
          }

          const values = Object.fromEntries(
            Object.entries(node.data.values).map(([key, value]) => [
              key,
              interpolate(value, outputs),
            ])
          )
          const output = await executor({ values, getStagehand })
          outputs[id] = output
          const finishedAt = new Date().toISOString()
          steps[stepIndex] = {
            ...steps[stepIndex],
            status: "done",
            finishedAt,
            durationMs:
              new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
            output,
          }
          publishSteps()
        } catch (error) {
          const finishedAt = new Date().toISOString()
          steps[stepIndex] = {
            ...steps[stepIndex],
            status: "failed",
            finishedAt,
            durationMs:
              new Date(finishedAt).getTime() - new Date(startedAt).getTime(),
            error: serializeError(error),
          }
          publishSteps()
          await metadata.flush()
          throw error
        }
      }
    } finally {
      await stagehand?.close()
      await browser?.close()
    }

    return { steps, sessionId }
  },
})

function serializeError(error: unknown): NonNullable<RunStep["error"]> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack } : {}),
    }
  }

  return {
    name: "Error",
    message: typeof error === "string" ? error : String(error),
  }
}

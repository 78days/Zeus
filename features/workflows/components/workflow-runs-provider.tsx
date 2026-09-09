"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type { RunStep } from "@/src/trigger/run-workflow"

export type WorkflowRun = {
  id: string
  status: string
  updatedAt: Date | string
  output?: unknown
  metadata?: Record<string, unknown>
  steps: RunStep[]
  sessionId?: string
}

export type WorkflowRunsContextValue = {
  runs: WorkflowRun[]
}

const WorkflowRunsContext = createContext<WorkflowRunsContextValue | undefined>(
  undefined
)

export function WorkflowRunsProvider({
  workflowId,
  publicAccessToken,
  children,
}: {
  workflowId: string
  publicAccessToken: string
  children: ReactNode
}) {
  const { runs, error } = useRealtimeRunsWithTag(
    `workflow:${workflowId}`,
    { accessToken: publicAccessToken }
  )

  if (error) {
    console.error("Failed to subscribe to workflow runs", error)
  }

  const workflowRuns = (runs as Array<Omit<WorkflowRun, "steps" | "sessionId">>).map(
    (run) => ({
      ...run,
      steps: readRunSteps(run) ?? [],
      sessionId: readSessionId(run.output),
    })
  )

  return (
    <WorkflowRunsContext.Provider value={{ runs: workflowRuns }}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

export function useWorkflowRuns(): WorkflowRun[] {
  const context = useContext(WorkflowRunsContext)
  if (!context) {
    throw new Error("useWorkflowRuns must be used within WorkflowRunsProvider")
  }

  return context.runs
}

export function useLatestRunSteps(): { steps: RunStep[]; live: boolean } {
  const context = useContext(WorkflowRunsContext)
  if (!context) {
    throw new Error("useLatestRunSteps must be used within WorkflowRunsProvider")
  }

  const latestRun = [...context.runs].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0]

  if (!latestRun) return { steps: [], live: false }

  const steps = latestRun.steps

  return {
    steps,
    live: ["QUEUED", "EXECUTING"].includes(latestRun.status.toUpperCase()),
  }
}

function readRunSteps(
  run: { output?: unknown; metadata?: unknown }
): RunStep[] | undefined {
  const outputSteps = readSteps(run.output)
  const metadataSteps = readSteps(run.metadata)
  if (isRunSteps(metadataSteps)) return metadataSteps
  if (isRunSteps(outputSteps)) return outputSteps
  return undefined
}

function readSessionId(value: unknown): string | undefined {
  const parsed = parseJson(value)
  const sessionId =
    typeof parsed === "object" && parsed !== null
      ? (parsed as { sessionId?: unknown }).sessionId
      : undefined

  return typeof sessionId === "string" && sessionId.length > 0
    ? sessionId
    : undefined
}

function readSteps(value: unknown) {
  const parsed = parseJson(value)

  if (Array.isArray(parsed)) return parsed
  return (parsed as { steps?: unknown } | undefined)?.steps
}

function parseJson(value: unknown) {
  if (typeof value !== "string") return value

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function isRunSteps(value: unknown): value is RunStep[] {
  return (
    Array.isArray(value) &&
    value.every(
      (step) =>
        typeof step === "object" &&
        step !== null &&
        typeof (step as RunStep).id === "string" &&
        typeof (step as RunStep).nodeType === "string" &&
        typeof (step as RunStep).title === "string" &&
        ["pending", "running", "done", "failed"].includes(
          (step as RunStep).status
        )
    )
  )
}

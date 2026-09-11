"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"
import { useEffect } from "react"

import * as Sentry from "@sentry/nextjs"

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
  const { runs, error } = useRealtimeRunsWithTag(`workflow:${workflowId}`, {
    accessToken: publicAccessToken,
  })

  useEffect(() => {
    if (!error) return

    Sentry.withScope((scope) => {
      scope.setTag("operation", "trigger.realtime-runs")
      scope.setExtra("workflowId", workflowId)
      Sentry.captureException(error)
    })
  }, [error, workflowId])

  const workflowRuns = (
    runs as Array<Omit<WorkflowRun, "steps" | "sessionId">>
  ).map((run) => ({
    ...run,
    steps: settleSteps(readRunSteps(run) ?? [], run.status),
    sessionId: readSessionId(run.output),
  }))

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
    throw new Error(
      "useLatestRunSteps must be used within WorkflowRunsProvider"
    )
  }

  const latestRun = [...context.runs].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0]

  if (!latestRun) return { steps: [], live: false }

  const steps = latestRun.steps

  return {
    steps,
    live: isLiveStatus(latestRun.status),
  }
}

// At most one run is live at a time — the one currently queued or executing.
export function useLiveRun(): WorkflowRun | undefined {
  const context = useContext(WorkflowRunsContext)
  if (!context) {
    throw new Error("useLiveRun must be used within WorkflowRunsProvider")
  }

  return context.runs.find((run) => isLiveStatus(run.status))
}

function isLiveStatus(status: string) {
  return ["QUEUED", "EXECUTING"].includes(status.toUpperCase())
}

// A cancelled (or crashed) run dies before the task can update its steps, so
// the step in flight stays "running" and the rest stay "pending" forever. Once
// the run reaches a terminal status, settle them so nothing keeps spinning.
function settleSteps(steps: RunStep[], runStatus: string): RunStep[] {
  if (isLiveStatus(runStatus)) return steps

  return steps.map((step) => {
    if (step.status === "running") return { ...step, status: "stopped" }
    if (step.status === "pending") return { ...step, status: "skipped" }
    return step
  })
}

function readRunSteps(run: {
  output?: unknown
  metadata?: unknown
}): RunStep[] | undefined {
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

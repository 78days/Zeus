"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type { RunStep } from "@/src/trigger/run-workflow"

type WorkflowRun = {
  id: string
  status: string
  updatedAt: Date
  output?: unknown
  metadata?: Record<string, unknown>
}

type WorkflowRunsContextValue = {
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
  const { runs } = useRealtimeRunsWithTag(
    `workflow:${workflowId}`,
    { accessToken: publicAccessToken }
  )

  return (
    <WorkflowRunsContext.Provider value={{ runs: runs as WorkflowRun[] }}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

export function useLatestRunSteps(): { steps: RunStep[]; live: boolean } {
  const context = useContext(WorkflowRunsContext)
  if (!context) {
    throw new Error("useLatestRunSteps must be used within WorkflowRunsProvider")
  }

  const latestRun = [...context.runs].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )[0]

  if (!latestRun) return { steps: [], live: false }

  const outputSteps = (latestRun.output as { steps?: unknown } | undefined)?.steps
  const metadataSteps = latestRun.metadata?.steps
  const steps = isRunSteps(outputSteps)
    ? outputSteps
    : isRunSteps(metadataSteps)
      ? metadataSteps
      : []

  return {
    steps,
    live: latestRun.status === "QUEUED" || latestRun.status === "EXECUTING",
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
        ["pending", "running", "done", "failed"].includes(
          (step as RunStep).status
        )
    )
  )
}

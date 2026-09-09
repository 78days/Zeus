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
  updatedAt: Date | string
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
  const { runs, error } = useRealtimeRunsWithTag(
    `workflow:${workflowId}`,
    { accessToken: publicAccessToken }
  )

  if (error) {
    console.error("Failed to subscribe to workflow runs", error)
  }

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
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0]

  if (!latestRun) return { steps: [], live: false }

  const outputSteps = readSteps(latestRun.output)
  const metadataSteps = readSteps(latestRun.metadata)
  const steps = isRunSteps(outputSteps)
    ? outputSteps
    : isRunSteps(metadataSteps)
      ? metadataSteps
      : []

  return {
    steps,
    live: ["QUEUED", "EXECUTING"].includes(latestRun.status.toUpperCase()),
  }
}

function readSteps(value: unknown) {
  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value)
          } catch {
            return undefined
          }
        })()
      : value

  return (parsed as { steps?: unknown } | undefined)?.steps
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

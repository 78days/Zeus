"use client"

import prettyMs from "pretty-ms"
import { Check, CircleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { NodeIcon } from "@/features/workflows/components/node-icon"
import type { WorkflowRun } from "@/features/workflows/components/workflow-runs-provider"
import type { NodeType } from "@/features/workflows/nodes/node-registry"

export function LogsPanel({
  runs,
  selectedStepId,
  onSelectStep,
}: {
  runs: WorkflowRun[]
  selectedStepId: string | undefined
  onSelectStep: (stepKey: string) => void
}) {
  const sortedRuns = [...runs].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <div className="flex size-full min-h-0 flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center border-b border-border px-3 text-xs font-semibold">
        Runs
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sortedRuns.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">No runs yet</p>
        ) : (
          sortedRuns.map((run) => (
            <div key={run.id} className="border-b border-border last:border-b-0">
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="truncate font-mono text-[10px] text-muted-foreground">
                  {run.id}
                </span>
                <RunStatus status={run.status} />
              </div>
              <div className="pb-1">
                {run.steps.map((step) => (
                  <button
                    key={`${run.id}:${step.id}`}
                    type="button"
                    aria-pressed={selectedStepId === `${run.id}:${step.id}`}
                    className={cn(
                      "flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs transition-colors hover:bg-muted/60",
                      selectedStepId === `${run.id}:${step.id}` && "bg-muted",
                      step.status === "pending" && "opacity-50",
                      step.status === "failed" && "text-destructive"
                    )}
                    onClick={() => onSelectStep(`${run.id}:${step.id}`)}
                  >
                    <NodeIcon
                      type={step.nodeType as NodeType}
                      className="size-5 rounded-sm"
                      running={step.status === "running"}
                    />
                    <StepStatus status={step.status} />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        step.status === "pending" && "text-muted-foreground",
                        step.status === "failed" && "text-destructive"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {formatDuration(step.durationMs, step.status)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function RunStatus({ status }: { status: string }) {
  const normalized = status.toUpperCase()
  const active = normalized === "QUEUED" || normalized === "EXECUTING"
  const failed = normalized === "FAILED" || normalized === "CRASHED"

  return (
    <span
      className={cn(
        "shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
        active && "text-blue-500",
        failed && "text-destructive"
      )}
    >
      {status.toLowerCase()}
    </span>
  )
}

function StepStatus({
  status,
}: {
  status: "pending" | "running" | "done" | "failed"
}) {
  if (status === "running") return null
  if (status === "failed") {
    return <CircleAlert className="size-3.5 text-destructive" />
  }
  if (status === "done") return <Check className="size-3.5 text-emerald-500" />
  return <span className="size-3.5 shrink-0 rounded-full bg-muted-foreground/30" />
}

function formatDuration(durationMs: number | undefined, status: string) {
  if (durationMs !== undefined) return prettyMs(durationMs, { compact: true })
  if (status === "running") return "..."
  return "-"
}

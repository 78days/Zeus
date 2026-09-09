"use client"

import { CircleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import type { RunStep } from "@/src/trigger/run-workflow"
import { NodeIcon } from "@/features/workflows/components/node-icon"
import type { NodeType } from "@/features/workflows/nodes/node-registry"
import { SessionReplay } from "@/features/workflows/components/session-replay"

export function InspectorPanel({
  step,
  sessionId,
}: {
  step?: RunStep
  sessionId?: string
}) {
  if (sessionId) return <SessionReplay sessionId={sessionId} />
  if (!step) return null

  const error = step.status === "failed" ? step.error : undefined
  const formattedOutput = formatOutput(step.output)

  return (
    <div className="flex size-full min-h-0 flex-col border-l border-border bg-background">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3 text-xs font-semibold">
        <NodeIcon
          type={step.nodeType as NodeType}
          running={step.status === "running"}
        />
        <span className="min-w-0 flex-1 truncate">{step.title}</span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
            step.status === "failed" && "text-destructive",
            step.status === "running" && "text-blue-500"
          )}
        >
          {step.status}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {error ? (
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-destructive">
              <CircleAlert className="size-3.5" />
              {error.name}
            </div>
            <p className="whitespace-pre-wrap break-words text-destructive/90">
              {error.message}
            </p>
            {error.stack && (
              <pre className="whitespace-pre-wrap break-words rounded-md bg-destructive/5 p-2 font-mono text-[10px] text-muted-foreground">
                {error.stack}
              </pre>
            )}
          </div>
        ) : formattedOutput ? (
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-muted/50 p-2 font-mono text-[11px] leading-relaxed">
            {formattedOutput}
          </pre>
        ) : (
          <p className="text-xs text-muted-foreground">
            This step did not produce any output.
          </p>
        )}
      </div>
    </div>
  )
}

function formatOutput(output: unknown) {
  if (output === undefined) return undefined

  try {
    return JSON.stringify(output, null, 2)
  } catch {
    return String(output)
  }
}

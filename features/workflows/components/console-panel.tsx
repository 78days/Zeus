"use client"

import { useState } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useWorkflowRuns } from "@/features/workflows/components/workflow-runs-provider"
import { InspectorPanel } from "@/features/workflows/components/inspector-panel"
import { LogsPanel } from "@/features/workflows/components/logs-panel"
import type { ConsoleSelection } from "@/features/workflows/components/logs-panel"

export function ConsolePanel() {
  const runs = useWorkflowRuns()
  const [selection, setSelection] = useState<ConsoleSelection>()

  const select = (next: ConsoleSelection) => {
    setSelection((current) =>
      JSON.stringify(current) === JSON.stringify(next) ? undefined : next
    )
  }

  const selectedItem = selection
    ? runs
        .flatMap((run) =>
          selection.type === "step"
            ? run.steps.map((step) => ({
                type: "step" as const,
                run,
                step,
                key: `${run.id}:${step.id}`,
              }))
            : [{ type: "replay" as const, run, key: run.id }]
        )
        .find(({ key }) =>
          selection.type === "step"
            ? key === `${selection.runId}:${selection.nodeId}`
            : key === selection.runId
        )
    : undefined

  return (
    <ResizablePanelGroup
      className="size-full"
      orientation="horizontal"
    >
      <ResizablePanel minSize="12rem">
        <LogsPanel
          runs={runs}
          selection={selection}
          onSelect={select}
        />
      </ResizablePanel>
      {selectedItem && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%" minSize="16rem">
            {selectedItem.type === "replay" ? (
              selectedItem.run.sessionId && (
                <InspectorPanel sessionId={selectedItem.run.sessionId} />
              )
            ) : (
              <InspectorPanel step={selectedItem.step} />
            )}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}

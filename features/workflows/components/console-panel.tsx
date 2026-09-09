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

  const select = (next: ConsoleSelection | undefined) => {
    setSelection(next)
  }

  const selectedRun = selection
    ? runs.find((run) => run.id === selection.runId)
    : undefined
  const selectedStep =
    selection?.type === "step"
      ? selectedRun?.steps.find((step) => step.id === selection.nodeId)
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
      {(selectedStep || (selection?.type === "replay" && selectedRun)) && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%" minSize="16rem">
            {selection?.type === "replay" ? (
              selectedRun?.sessionId && (
                <InspectorPanel sessionId={selectedRun.sessionId} />
              )
            ) : (
              selectedStep && <InspectorPanel step={selectedStep} />
            )}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}

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

export function ConsolePanel() {
  const runs = useWorkflowRuns()
  const [selectedStepId, setSelectedStepId] = useState<string>()

  const selectStep = (stepId: string) => {
    setSelectedStepId((current) => (current === stepId ? undefined : stepId))
  }

  const selectedStep = selectedStepId
    ? runs
        .flatMap((run) =>
          run.steps.map((step) => ({ key: `${run.id}:${step.id}`, step }))
        )
        .find(({ key }) => key === selectedStepId)?.step
    : undefined

  return (
    <ResizablePanelGroup
      className="size-full"
      orientation="horizontal"
    >
      <ResizablePanel minSize="12rem">
        <LogsPanel
          runs={runs}
          selectedStepId={selectedStepId}
          onSelectStep={selectStep}
        />
      </ResizablePanel>
      {selectedStep && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="50%" minSize="16rem">
            <InspectorPanel step={selectedStep} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}

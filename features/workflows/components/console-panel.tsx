"use client"

import { useState } from "react"

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
    <div className="flex size-full min-h-0">
      <div className={selectedStep ? "min-w-0 flex-1" : "size-full"}>
        <LogsPanel
          runs={runs}
          selectedStepId={selectedStepId}
          onSelectStep={selectStep}
        />
      </div>
      {selectedStep && (
        <div className="w-1/2 min-w-64">
          <InspectorPanel step={selectedStep} />
        </div>
      )}
    </div>
  )
}
